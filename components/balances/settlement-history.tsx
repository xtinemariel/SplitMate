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
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-8 text-center">
        <p className="text-sm font-medium text-foreground">No settlements yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Mark a balance as settled to see it here.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {items.map((item) => {
        const fromIsYou = item.fromMemberId === currentUserMemberId;
        const toIsYou = item.toMemberId === currentUserMemberId;

        const sentence = fromIsYou
          ? `You settled with ${item.toLabel}`
          : toIsYou
            ? `${item.fromLabel} settled with you`
            : `${item.fromLabel} settled with ${item.toLabel}`;

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
