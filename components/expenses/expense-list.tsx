import type { ExpenseWithMeta } from "@/lib/expenses/queries";

function formatExpenseDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function ExpenseList({ expenses }: { expenses: ExpenseWithMeta[] }) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-8 text-center">
        <p className="text-sm font-medium text-foreground">No expenses yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first expense below.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
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
                Split {expense.participant_count} {expense.participant_count === 1 ? "way" : "ways"}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-foreground">
              {expense.formatted_amount}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
