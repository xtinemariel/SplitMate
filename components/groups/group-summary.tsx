import { formatCents } from "@/lib/expenses/money";
import type { ExpenseWithMeta } from "@/lib/expenses/queries";
import type { BalanceLine } from "@/lib/balances/queries";
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
  currentUserMemberId,
  balances,
}: {
  summary: GroupExpenseSummary;
  currentUserMemberId?: string;
  balances?: BalanceLine[];
}) {
  const youvePaidCents = currentUserMemberId
    ? (summary.paidBy.find((m) => m.memberId === currentUserMemberId)
        ?.amountCents ?? 0)
    : 0;

  const toCollectCents =
    currentUserMemberId && balances
      ? balances
          .filter((b) => b.toMemberId === currentUserMemberId)
          .reduce((sum, b) => sum + b.amountCents, 0)
      : 0;

  const showPersonal = Boolean(currentUserMemberId);

  return (
    <div className="space-y-3">
      {showPersonal ? (
        <div className="grid grid-cols-2 gap-3">
          <div className={surfaceCardClass("mint", "px-4 py-4")}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              You&apos;ve paid
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-owed tabular-nums">
              {formatCents(youvePaidCents)}
            </p>
          </div>
          <div className={surfaceCardClass("peach", "px-4 py-4")}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              To collect
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-owed tabular-nums">
              {formatCents(toCollectCents)}
            </p>
          </div>
        </div>
      ) : null}

      <div className={surfaceCardClass("neutral", "overflow-hidden")}>
        <div className="px-4 py-4">
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {formatCents(summary.totalCents)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Group total</p>
        </div>

        {summary.paidBy.length > 0 ? (
          <div className="border-t border-[#E0D8CC]">
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
    </div>
  );
}
