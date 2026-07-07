export type BalanceMember = {
  id: string;
  label: string;
};

export type BalanceExpenseParticipant = {
  group_member_id: string;
  amount_cents: number;
};

export type BalanceExpense = {
  paid_by_group_member_id: string;
  amount_cents: number;
  participants: BalanceExpenseParticipant[];
};

export type BalanceSettlement = {
  from_group_member_id: string;
  to_group_member_id: string;
  amount_cents: number;
};

export type NetBalance = {
  memberId: string;
  netCents: number;
};

export type BalanceTransfer = {
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
};

export function calculateNetBalances(
  members: BalanceMember[],
  expenses: BalanceExpense[],
  settlements: BalanceSettlement[] = [],
): NetBalance[] {
  const totals = new Map<string, number>();

  for (const member of members) {
    totals.set(member.id, 0);
  }

  for (const expense of expenses) {
    totals.set(
      expense.paid_by_group_member_id,
      (totals.get(expense.paid_by_group_member_id) ?? 0) + expense.amount_cents,
    );

    for (const participant of expense.participants) {
      totals.set(
        participant.group_member_id,
        (totals.get(participant.group_member_id) ?? 0) -
          participant.amount_cents,
      );
    }
  }

  for (const settlement of settlements) {
    totals.set(
      settlement.from_group_member_id,
      (totals.get(settlement.from_group_member_id) ?? 0) +
        settlement.amount_cents,
    );
    totals.set(
      settlement.to_group_member_id,
      (totals.get(settlement.to_group_member_id) ?? 0) -
        settlement.amount_cents,
    );
  }

  return members.map((member) => ({
    memberId: member.id,
    netCents: totals.get(member.id) ?? 0,
  }));
}

export function simplifyBalances(balances: NetBalance[]): BalanceTransfer[] {
  const creditors = balances
    .filter((balance) => balance.netCents > 0)
    .map((balance) => ({ ...balance }));
  const debtors = balances
    .filter((balance) => balance.netCents < 0)
    .map((balance) => ({ ...balance }));

  creditors.sort((a, b) => b.netCents - a.netCents);
  debtors.sort((a, b) => a.netCents - b.netCents);

  const transfers: BalanceTransfer[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(-debtor.netCents, creditor.netCents);

    transfers.push({
      fromMemberId: debtor.memberId,
      toMemberId: creditor.memberId,
      amountCents: amount,
    });

    debtor.netCents += amount;
    creditor.netCents -= amount;

    if (debtor.netCents === 0) {
      debtorIndex += 1;
    }

    if (creditor.netCents === 0) {
      creditorIndex += 1;
    }
  }

  return transfers;
}
