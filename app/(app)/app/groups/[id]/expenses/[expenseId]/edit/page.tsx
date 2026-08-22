import { AppHeader } from "@/components/app/app-header";
import { EditExpenseForm } from "@/components/expenses/edit-expense-form";
import { surfaceCardClass } from "@/components/ui/surface";
import { getCurrentUser } from "@/lib/auth/session";
import { getExpenseForEdit } from "@/lib/expenses/queries";
import { getGroupDetail } from "@/lib/groups/queries";
import { redirect } from "next/navigation";

type EditExpensePageProps = {
  params: Promise<{ id: string; expenseId: string }>;
};

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id, expenseId } = await params;
  const group = await getGroupDetail(id);
  const expense = await getExpenseForEdit(id, expenseId);

  return (
    <>
      <AppHeader backHref={`/app/groups/${id}`} title="Edit expense" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <section className={surfaceCardClass("peach", "space-y-4 p-4")}>
          <div>
            <h2 className="text-sm font-medium text-foreground">Edit expense</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Changes update the group balances.
            </p>
          </div>
          <EditExpenseForm
            groupId={group.id}
            members={group.members}
            currentUserId={user.id}
            expense={expense}
          />
        </section>
      </main>
    </>
  );
}
