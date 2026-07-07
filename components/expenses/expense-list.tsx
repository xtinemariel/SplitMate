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
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-8 text-center">
        <p className="text-sm font-medium text-zinc-900">No expenses yet</p>
        <p className="mt-2 text-sm text-zinc-600">
          Add your first expense below.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {expenses.map((expense) => (
        <li key={expense.id} className="px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-900">
                {expense.description}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {expense.payer_label} paid · {formatExpenseDate(expense.expense_date)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Split {expense.participant_count} {expense.participant_count === 1 ? "way" : "ways"}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-zinc-900">
              {expense.formatted_amount}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
