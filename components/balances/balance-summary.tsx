import { formatCents } from "@/lib/expenses/money";
import {
  noticeClass,
  surfaceCardClass,
  surfaceListDivideClass,
} from "@/components/ui/surface";
import { settleUp } from "@/lib/settlements/actions";
import type { BalanceLine } from "@/lib/balances/queries";
import { cn } from "@/lib/utils";

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
      <div className={surfaceCardClass("mint", "px-6 py-8 text-center")}>
        <p className="text-sm font-medium text-foreground">Nothing to settle yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add an expense and we&apos;ll figure out who owes whom.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {settleError ? (
        <p className={noticeClass.warning}>
          Could not settle up. Please try again.
        </p>
      ) : null}

      <ul
        className={surfaceCardClass(
          "neutral",
          cn("overflow-hidden", surfaceListDivideClass),
        )}
      >
        {balances.map((balance) => {
          const fromIsYou = balance.fromMemberId === currentUserMemberId;
          const toIsYou = balance.toMemberId === currentUserMemberId;

          const sentence = fromIsYou
            ? `You owe ${balance.toLabel}`
            : toIsYou
              ? `${balance.fromLabel} owes you`
              : `${balance.fromLabel} owes ${balance.toLabel}`;

          const amountClass = fromIsYou
            ? "text-owe"
            : toIsYou
              ? "text-owed"
              : "text-foreground";

          return (
            <li
              key={`${balance.fromMemberId}-${balance.toMemberId}`}
              className="px-4 py-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-foreground">{sentence}</p>
                  <p
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      amountClass,
                    )}
                  >
                    {formatCents(balance.amountCents)}
                  </p>
                </div>

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
                    className="inline-flex h-8 items-center rounded-lg border border-border bg-transparent px-2.5 text-xs font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-muted hover:text-foreground"
                  >
                    Mark as paid
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
