import { notFound } from "next/navigation";

import { formatCents } from "@/lib/expenses/money";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import type { Expense } from "@/types/database";

type ExpenseParticipantRow = {
  group_member_id: string;
};

export type ExpenseWithMeta = Expense & {
  payer_label: string;
  participant_count: number;
  participant_member_ids: string[];
  formatted_amount: string;
};

export type ExpenseForEdit = Expense & {
  participant_member_ids: string[];
};

function participantIdsFromExpense(
  participants: ExpenseParticipantRow[] | null | undefined,
): string[] {
  return (participants ?? []).map((participant) => participant.group_member_id);
}

export async function getExpensesForGroup(
  groupId: string,
  payerLabels: Map<string, string>,
): Promise<ExpenseWithMeta[]> {
  const insforge = await createInsForgeServerClient();

  const { data: expenses, error } = await insforge.database
    .from("expenses")
    .select(
      "id, group_id, paid_by_group_member_id, amount_cents, description, expense_date, created_by, created_at, updated_at, expense_participants(group_member_id)",
    )
    .eq("group_id", groupId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load expenses");
  }

  return (expenses ?? []).map((expense) => {
    const participant_member_ids = participantIdsFromExpense(
      expense.expense_participants as ExpenseParticipantRow[] | null,
    );

    return {
      id: expense.id,
      group_id: expense.group_id,
      paid_by_group_member_id: expense.paid_by_group_member_id,
      amount_cents: expense.amount_cents,
      description: expense.description,
      expense_date: expense.expense_date,
      created_by: expense.created_by,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
      payer_label: payerLabels.get(expense.paid_by_group_member_id) ?? "Member",
      participant_member_ids,
      participant_count: participant_member_ids.length,
      formatted_amount: formatCents(expense.amount_cents),
    };
  });
}

export async function getExpenseForEdit(
  groupId: string,
  expenseId: string,
): Promise<ExpenseForEdit> {
  const insforge = await createInsForgeServerClient();

  const { data: expenses, error } = await insforge.database
    .from("expenses")
    .select(
      "id, group_id, paid_by_group_member_id, amount_cents, description, expense_date, created_by, created_at, updated_at, expense_participants(group_member_id)",
    )
    .eq("id", expenseId)
    .eq("group_id", groupId)
    .limit(1);

  if (error) {
    throw new Error(error.message ?? "Failed to load expense");
  }

  const expense = expenses?.[0];

  if (!expense) {
    notFound();
  }

  return {
    id: expense.id,
    group_id: expense.group_id,
    paid_by_group_member_id: expense.paid_by_group_member_id,
    amount_cents: expense.amount_cents,
    description: expense.description,
    expense_date: expense.expense_date,
    created_by: expense.created_by,
    created_at: expense.created_at,
    updated_at: expense.updated_at,
    participant_member_ids: participantIdsFromExpense(
      expense.expense_participants as ExpenseParticipantRow[] | null,
    ),
  };
}
