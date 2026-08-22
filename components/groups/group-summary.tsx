import { formatCents } from "@/lib/expenses/money";
import type { ExpenseWithMeta } from "@/lib/expenses/queries";
import type { GroupMemberWithLabel } from "@/lib/groups/queries";
import {
  surfaceCardClass,
  surfaceListDivideClass,
} from "@/components/ui/surface";
import { cn } from "@/lib/utils";

export type MemberPaidTotal = {
  memberId: string;
  label: string;
  amountCents: number;
};

export type GroupExpenseSummary = {
  totalCents: number;
  paidBy: MemberPaidTotal[];
};

export function buildGroupExpenseSummary(
  members: GroupMemberWithLabel[],
  expenses: ExpenseWithMeta[],
): GroupExpenseSummary {
  const paidCentsByMember = new Map(
    members.map((member) => [member.id, 0]),
  );

  let totalCents = 0;

  for (const expense of expenses) {
    totalCents += expense.amount_cents;
    paidCentsByMember.set(
      expense.paid_by_group_member_id,
      (paidCentsByMember.get(expense.paid_by_group_member_id) ?? 0) +
        expense.amount_cents,
    );
  }

  const paidBy = members
    .map((member) => ({
      memberId: member.id,
      label: member.label,
      amountCents: paidCentsByMember.get(member.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.amountCents !== a.amountCents) {
        return b.amountCents - a.amountCents;
      }

      return a.label.localeCompare(b.label);
    });

  return { totalCents, paidBy };
}

export function GroupSummary({
  summary,
}: {
  summary: GroupExpenseSummary;
}) {
  return (
    <div className={surfaceCardClass("lavender", "overflow-hidden")}>
      <div className="px-4 py-4">
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {formatCents(summary.totalCents)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Total expenses</p>
      </div>

      {summary.paidBy.length > 0 ? (
        <div className="border-t border-[rgba(106,109,130,0.12)]">
          <p className="px-4 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Paid by
          </p>
          <ul className={cn(surfaceListDivideClass)}>
            {summary.paidBy.map((member) => (
              <li
                key={member.memberId}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <p className="min-w-0 truncate text-sm text-foreground">
                  {member.label}
                </p>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  {formatCents(member.amountCents)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
