import { formatCents } from "@/lib/expenses/money";
import type { ExpenseWithMeta } from "@/lib/expenses/queries";
import type { BalanceLine } from "@/lib/balances/queries";
import type { GroupExpenseSummary } from "@/components/groups/group-summary";

function bold(text: string) {
  return `*${text}*`;
}

function settlementLines(balances: BalanceLine[]) {
  return balances.map(
    (balance) =>
      `${balance.fromLabel} → ${balance.toLabel}: ${formatCents(balance.amountCents)}`,
  );
}

function settlementTotalCents(balances: BalanceLine[]) {
  return balances.reduce((sum, balance) => sum + balance.amountCents, 0);
}

export function formatSettlementShare(balances: BalanceLine[]): string {
  if (balances.length === 0) {
    return [
      `💸 ${bold("Group Settlement")}`,
      "",
      "All settled up — no open balances.",
    ].join("\n");
  }

  return [
    `💸 ${bold("Group Settlement")}`,
    "",
    "Here's what needs to be settled:",
    "",
    ...settlementLines(balances),
    "",
    `${bold(`Total to settle: ${formatCents(settlementTotalCents(balances))}`)}`,
  ].join("\n");
}

export function formatExpenseBreakdownShare(
  expenses: ExpenseWithMeta[],
  totalCents: number,
): string {
  if (expenses.length === 0) {
    return [
      `🧾 ${bold("Expense Breakdown")}`,
      "",
      "No expenses recorded yet.",
    ].join("\n");
  }

  const rows = expenses.flatMap((expense, index) => {
    const block = [
      expense.description,
      `${expense.formatted_amount} · ${expense.payer_label} paid`,
    ];

    if (index < expenses.length - 1) {
      block.push("");
    }

    return block;
  });

  return [
    `🧾 ${bold("Expense Breakdown")}`,
    "",
    ...rows,
    "",
    `${bold(`Total expenses: ${formatCents(totalCents)}`)}`,
  ].join("\n");
}

export function formatFullSummaryShare({
  groupName,
  summary,
  expenses,
  balances,
}: {
  groupName: string;
  summary: GroupExpenseSummary;
  expenses: ExpenseWithMeta[];
  balances: BalanceLine[];
}): string {
  const paidByLines = summary.paidBy
    .filter((member) => member.amountCents > 0)
    .map((member) => `${member.label}: ${formatCents(member.amountCents)}`);

  const expenseLines =
    expenses.length === 0
      ? ["No expenses recorded yet."]
      : expenses.map(
          (expense) =>
            `• ${expense.description} — ${expense.formatted_amount} · ${expense.payer_label}`,
        );

  const settlementBlock =
    balances.length === 0
      ? ["All settled up — no open balances."]
      : [
          ...settlementLines(balances),
          "",
          `${bold(`Total to settle: ${formatCents(settlementTotalCents(balances))}`)}`,
        ];

  return [
    `🏔️ ${bold(groupName)}`,
    "",
    bold("Expense Summary"),
    "",
    `Total expenses: ${bold(formatCents(summary.totalCents))}`,
    "",
    bold("Paid by"),
    ...(paidByLines.length > 0 ? paidByLines : ["No payments recorded yet."]),
    "",
    bold("Expenses"),
    ...expenseLines,
    "",
    bold("Settlement"),
    "",
    ...settlementBlock,
  ].join("\n");
}
