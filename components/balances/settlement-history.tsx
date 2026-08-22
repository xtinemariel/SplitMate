import {
  surfaceCardClass,
  surfaceListDivideClass,
} from "@/components/ui/surface";
import { cn } from "@/lib/utils";

type SettlementHistoryItem = {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
  settledAt: string;
  fromLabel: string;
  toLabel: string;
  formattedAmount: string;
};

function formatSettlementDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function SettlementHistory({
  items,
  currentUserMemberId,
}: {
  items: SettlementHistoryItem[];
  currentUserMemberId: string;
}) {
  if (items.length === 0) {
    return (
      <div className={surfaceCardClass("blue", "px-6 py-8 text-center")}>
        <p className="text-sm font-medium text-foreground">No payments yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
        Payments you mark as paid will show up here.
        </p>
      </div>
    );
  }

  return (
    <ul
      className={surfaceCardClass(
        "blue",
        cn("overflow-hidden", surfaceListDivideClass),
      )}
    >
      {items.map((item) => {
        const fromIsYou = item.fromMemberId === currentUserMemberId;
        const toIsYou = item.toMemberId === currentUserMemberId;

        const sentence = fromIsYou
          ? `You paid ${item.toLabel}`
          : toIsYou
            ? `${item.fromLabel} paid you`
            : `${item.fromLabel} paid ${item.toLabel}`;

        return (
          <li key={item.id} className="px-4 py-4">
            <div className="space-y-1">
              <p className="text-sm text-foreground">
                <span className="font-medium">{sentence}</span>{" "}
                <span className="font-semibold">{item.formattedAmount}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatSettlementDate(item.settledAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
