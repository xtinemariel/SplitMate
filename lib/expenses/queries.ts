import { formatCents } from "@/lib/expenses/money";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import type { Expense } from "@/types/database";

export type ExpenseWithMeta = Expense & {
  payer_label: string;
  participant_count: number;
  formatted_amount: string;
};

export async function getExpensesForGroup(
  groupId: string,
  payerLabels: Map<string, string>,
): Promise<ExpenseWithMeta[]> {
  const insforge = await createInsForgeServerClient();

  const { data: expenses, error } = await insforge.database
    .from("expenses")
    .select(
      "id, group_id, paid_by_group_member_id, amount_cents, description, expense_date, created_by, created_at, updated_at, expense_participants(count)",
    )
    .eq("group_id", groupId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load expenses");
  }

  return (expenses ?? []).map((expense) => ({
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
    participant_count: expense.expense_participants?.[0]?.count ?? 0,
    formatted_amount: formatCents(expense.amount_cents),
  }));
}
