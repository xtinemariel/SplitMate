import { formatCents } from "@/lib/expenses/money";
import { settleUp } from "@/lib/settlements/actions";
import type { BalanceLine } from "@/lib/balances/queries";

export function BalanceSummary({
  balances,
  currentUserMemberId,
  groupId,
  settleError,
}: {
  balances: BalanceLine[];
  currentUserMemberId: string;
  groupId: string;
  settleError?: string | null;
}) {
  if (balances.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-8 text-center">
        <p className="text-sm font-medium text-foreground">All settled up</p>
        <p className="mt-2 text-sm text-muted-foreground">
          No one owes anything right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {settleError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not settle up. Please try again.
        </p>
      ) : null}

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {balances.map((balance) => {
          const fromIsYou = balance.fromMemberId === currentUserMemberId;
          const toIsYou = balance.toMemberId === currentUserMemberId;

          const sentence = fromIsYou
            ? `You owe ${balance.toLabel} ${formatCents(balance.amountCents)}`
            : toIsYou
              ? `${balance.fromLabel} owes you ${formatCents(balance.amountCents)}`
              : `${balance.fromLabel} owes ${balance.toLabel} ${formatCents(balance.amountCents)}`;

          return (
            <li
              key={`${balance.fromMemberId}-${balance.toMemberId}`}
              className="px-4 py-4"
            >
              <div className="space-y-3">
                <p className="text-sm text-foreground">{sentence}</p>

                <form action={settleUp} className="flex justify-end">
                  <input type="hidden" name="groupId" value={groupId} />
                  <input
                    type="hidden"
                    name="fromGroupMemberId"
                    value={balance.fromMemberId}
                  />
                  <input
                    type="hidden"
                    name="toGroupMemberId"
                    value={balance.toMemberId}
                  />
                  <input
                    type="hidden"
                    name="amountCents"
                    value={balance.amountCents}
                  />
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center rounded-lg border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-accent hover:text-accent-foreground"
                  >
                    Mark as settled
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
