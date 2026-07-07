import { formatCents } from "@/lib/expenses/money";
import type { BalanceLine } from "@/lib/balances/queries";

export function BalanceSummary({
  balances,
  currentUserMemberId,
}: {
  balances: BalanceLine[];
  currentUserMemberId: string;
}) {
  if (balances.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-8 text-center">
        <p className="text-sm font-medium text-zinc-900">All settled up</p>
        <p className="mt-2 text-sm text-zinc-600">
          No one owes anything right now.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {balances.map((balance) => {
        const fromIsYou = balance.fromMemberId === currentUserMemberId;
        const toIsYou = balance.toMemberId === currentUserMemberId;
        const fromLabel = fromIsYou ? "You" : balance.fromLabel;
        const toLabel = toIsYou ? "you" : balance.toLabel;

        return (
          <li
            key={`${balance.fromMemberId}-${balance.toMemberId}`}
            className="px-4 py-4"
          >
            <p className="text-sm text-zinc-900">
              <span className="font-medium">{fromLabel}</span> owes{" "}
              <span className="font-medium">{toLabel}</span>{" "}
              <span className="font-semibold">
                {formatCents(balance.amountCents)}
              </span>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
