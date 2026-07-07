import { AppHeader } from "@/components/app/app-header";
import { AddMemberForm } from "@/components/groups/add-member-form";
import { BalanceSummary } from "@/components/balances/balance-summary";
import { CreateExpenseForm } from "@/components/expenses/create-expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { MemberList } from "@/components/groups/member-list";
import { getCurrentUser } from "@/lib/auth/session";
import { getGroupBalances } from "@/lib/balances/queries";
import { getExpensesForGroup } from "@/lib/expenses/queries";
import { getGroupDetail } from "@/lib/groups/queries";
import { redirect } from "next/navigation";

type GroupPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const group = await getGroupDetail(id);
  const payerLabels = new Map(group.members.map((member) => [member.id, member.label]));
  const [expenses, balances] = await Promise.all([
    getExpensesForGroup(id, payerLabels),
    getGroupBalances(id, group.members),
  ]);
  const currentUserMemberId = group.members.find((member) => member.user_id === user.id)?.id ?? "";

  return (
    <>
      <AppHeader backHref="/app" title={group.name} />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-8 px-4 py-6">
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Balances
          </h2>
          <BalanceSummary
            balances={balances}
            currentUserMemberId={currentUserMemberId}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Expenses
          </h2>
          <ExpenseList expenses={expenses} />
        </section>

        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4">
          <div>
            <h2 className="text-sm font-medium text-zinc-900">Add expense</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Any group member can be selected as payer or participant.
            </p>
          </div>
          <CreateExpenseForm
            groupId={group.id}
            members={group.members}
            currentUserId={user.id}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Members
          </h2>
          <MemberList members={group.members} currentUserId={user.id} />
        </section>

        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-medium text-zinc-900">Add someone</h2>
          <AddMemberForm groupId={group.id} />
        </section>
      </main>
    </>
  );
}
