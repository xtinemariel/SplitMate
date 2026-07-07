export function parseAmountToCents(amount: string): number | null {
  const normalized = amount.replace(/,/g, "").trim();
  if (!normalized) {
    return null;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round(value * 100);
}

export function splitAmountEqually(
  totalCents: number,
  participantCount: number,
): number[] {
  if (participantCount <= 0) {
    return [];
  }

  const base = Math.floor(totalCents / participantCount);
  const remainder = totalCents % participantCount;

  return Array.from({ length: participantCount }, (_, index) =>
    index < remainder ? base + 1 : base,
  );
}

export function formatCents(amountCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}
