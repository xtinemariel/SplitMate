"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { parseAmountToCents } from "@/lib/expenses/money";
import { createInsForgeServerClient } from "@/lib/insforge/server";

export type ExpenseFormState = {
  error?: string;
  success?: string;
  submissionId?: string;
};

type ParsedExpenseForm =
  | { error: string }
  | {
      groupId: string;
      expenseId: string;
      amountCents: number;
      description: string;
      paidByGroupMemberId: string;
      expenseDate: string;
      participantGroupMemberIds: string[];
    };

function parseExpenseForm(formData: FormData): ParsedExpenseForm {
  const groupId = String(formData.get("groupId") ?? "").trim();
  const expenseId = String(formData.get("expenseId") ?? "").trim();
  const amount = String(formData.get("amount") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const paidByGroupMemberId = String(formData.get("paidByGroupMemberId") ?? "").trim();
  const expenseDate = String(formData.get("expenseDate") ?? "").trim();
  const participantGroupMemberIds = formData
    .getAll("participants")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!groupId) {
    return { error: "Group is required." };
  }

  const amountCents = parseAmountToCents(amount);
  if (amountCents === null) {
    return { error: "Enter a valid amount." };
  }

  if (!description) {
    return { error: "Description is required." };
  }

  if (!paidByGroupMemberId) {
    return { error: "Select who paid." };
  }

  if (!expenseDate) {
    return { error: "Date is required." };
  }

  if (participantGroupMemberIds.length === 0) {
    return { error: "Select at least one participant." };
  }

  return {
    groupId,
    expenseId,
    amountCents,
    description,
    paidByGroupMemberId,
    expenseDate,
    participantGroupMemberIds,
  };
}

async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function createExpense(
  _previousState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  await requireCurrentUser();

  const parsed = parseExpenseForm(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.database.rpc("create_expense", {
    p_group_id: parsed.groupId,
    p_paid_by_group_member_id: parsed.paidByGroupMemberId,
    p_amount_cents: parsed.amountCents,
    p_description: parsed.description,
    p_expense_date: parsed.expenseDate,
    p_participant_group_member_ids: parsed.participantGroupMemberIds,
  });

  if (error) {
    return { error: error.message ?? "Could not create expense." };
  }

  if (!data) {
    return { error: "Could not create expense." };
  }

  revalidatePath(`/app/groups/${parsed.groupId}`);

  return {
    success: "Expense added.",
    submissionId: crypto.randomUUID(),
  };
}

export async function updateExpense(
  _previousState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  await requireCurrentUser();

  const parsed = parseExpenseForm(formData);
  if ("error" in parsed) {
    return parsed;
  }

  if (!parsed.expenseId) {
    return { error: "Expense is required." };
  }

  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.database.rpc("update_expense", {
    p_expense_id: parsed.expenseId,
    p_paid_by_group_member_id: parsed.paidByGroupMemberId,
    p_amount_cents: parsed.amountCents,
    p_description: parsed.description,
    p_expense_date: parsed.expenseDate,
    p_participant_group_member_ids: parsed.participantGroupMemberIds,
  });

  if (error) {
    return { error: error.message ?? "Could not update expense." };
  }

  if (!data) {
    return { error: "Could not update expense." };
  }

  revalidatePath(`/app/groups/${parsed.groupId}`);
  redirect(`/app/groups/${parsed.groupId}`);
}

export async function deleteExpense(
  _previousState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  await requireCurrentUser();

  const groupId = String(formData.get("groupId") ?? "").trim();
  const expenseId = String(formData.get("expenseId") ?? "").trim();

  if (!groupId || !expenseId) {
    return { error: "Expense is required." };
  }

  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.database.rpc("delete_expense", {
    p_expense_id: expenseId,
  });

  if (error) {
    return { error: error.message ?? "Could not delete expense." };
  }

  if (!data) {
    return { error: "Could not delete expense." };
  }

  revalidatePath(`/app/groups/${groupId}`);
  redirect(`/app/groups/${groupId}`);
}
