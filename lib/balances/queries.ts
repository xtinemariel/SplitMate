import { createInsForgeServerClient } from "@/lib/insforge/server";
import {
  calculateNetBalances,
  simplifyBalances,
  type BalanceMember,
  type BalanceExpense,
} from "@/lib/balances/calculate";
import type { GroupMemberWithLabel } from "@/lib/groups/queries";

export type BalanceLine = {
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
  fromLabel: string;
  toLabel: string;
};

export async function getGroupBalances(
  groupId: string,
  members: GroupMemberWithLabel[],
): Promise<BalanceLine[]> {
  const insforge = await createInsForgeServerClient();

  const { data: expenses, error: expensesError } = await insforge.database
    .from("expenses")
    .select("id, paid_by_group_member_id, amount_cents")
    .eq("group_id", groupId);

  if (expensesError) {
    throw new Error(expensesError.message ?? "Failed to load balances");
  }

  const expenseIds = (expenses ?? []).map((expense) => expense.id);
  let participantRows: Array<{
    expense_id: string;
    group_member_id: string;
    amount_cents: number;
  }> = [];

  if (expenseIds.length > 0) {
    const { data: participants, error: participantsError } =
      await insforge.database
        .from("expense_participants")
        .select("expense_id, group_member_id, amount_cents")
        .in("expense_id", expenseIds);

    if (participantsError) {
      throw new Error(participantsError.message ?? "Failed to load balances");
    }

    participantRows = participants ?? [];
  }

  const participantsByExpense = new Map<
    string,
    Array<{ group_member_id: string; amount_cents: number }>
  >();

  for (const row of participantRows) {
    const rows = participantsByExpense.get(row.expense_id) ?? [];
    rows.push({
      group_member_id: row.group_member_id,
      amount_cents: row.amount_cents,
    });
    participantsByExpense.set(row.expense_id, rows);
  }

  const normalizedExpenses: BalanceExpense[] = (expenses ?? []).map(
    (expense) => ({
      paid_by_group_member_id: expense.paid_by_group_member_id,
      amount_cents: expense.amount_cents,
      participants: participantsByExpense.get(expense.id) ?? [],
    }),
  );

  const memberBalances: BalanceMember[] = members.map((member) => ({
    id: member.id,
    label: member.label,
  }));

  const netBalances = calculateNetBalances(memberBalances, normalizedExpenses);
  const simplified = simplifyBalances(netBalances);
  const labelById = new Map(members.map((member) => [member.id, member.label]));

  return simplified.map((line) => ({
    ...line,
    fromLabel: labelById.get(line.fromMemberId) ?? "Member",
    toLabel: labelById.get(line.toMemberId) ?? "Member",
  }));
}
