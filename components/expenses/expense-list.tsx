import Link from "next/link";

import type { ExpenseWithMeta } from "@/lib/expenses/queries";
import {
  surfaceCardClass,
  surfaceListDivideClass,
} from "@/components/ui/surface";
import { cn } from "@/lib/utils";

function formatExpenseDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function ExpenseList({
  expenses,
  groupId,
}: {
  expenses: ExpenseWithMeta[];
  groupId: string;
}) {
  if (expenses.length === 0) {
    return (
      <div className={surfaceCardClass("neutral", "px-6 py-8 text-center")}>
        <p className="text-sm font-medium text-foreground">No expenses yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first expense and we&apos;ll handle the math.
        </p>
      </div>
    );
  }

  return (
    <ul
      className={surfaceCardClass(
        "neutral",
        cn("overflow-hidden", surfaceListDivideClass),
      )}
    >
      {expenses.map((expense) => (
        <li key={expense.id} className="px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {expense.description}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {expense.payer_label} paid · {formatExpenseDate(expense.expense_date)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Split {expense.participant_count}{" "}
                {expense.participant_count === 1 ? "way" : "ways"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <p className="text-sm font-semibold tabular-nums text-foreground">
                {expense.formatted_amount}
              </p>
              <Link
                href={`/app/groups/${groupId}/expenses/${expense.id}/edit`}
                className="inline-flex h-8 items-center rounded-lg border border-border bg-transparent px-2.5 text-xs font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-muted hover:text-foreground"
              >
                Edit
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
