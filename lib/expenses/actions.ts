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

export async function createExpense(
  _previousState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const groupId = String(formData.get("groupId") ?? "").trim();
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

  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.database.rpc("create_expense", {
    p_group_id: groupId,
    p_paid_by_group_member_id: paidByGroupMemberId,
    p_amount_cents: amountCents,
    p_description: description,
    p_expense_date: expenseDate,
    p_participant_group_member_ids: participantGroupMemberIds,
  });

  if (error) {
    return { error: error.message ?? "Could not create expense." };
  }

  if (!data) {
    return { error: "Could not create expense." };
  }

  revalidatePath(`/app/groups/${groupId}`);

  return {
    success: "Expense added.",
    submissionId: crypto.randomUUID(),
  };
}
