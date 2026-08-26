import { AppHeader } from "@/components/app/app-header";
import { AddMemberForm } from "@/components/groups/add-member-form";
import { BalanceSummary } from "@/components/balances/balance-summary";
import { SettlementHistory } from "@/components/balances/settlement-history";
import { CreateExpenseForm } from "@/components/expenses/create-expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import {
  buildGroupExpenseSummary,
  GroupSummary,
} from "@/components/groups/group-summary";
import { MemberList } from "@/components/groups/member-list";
import { GroupSettings } from "@/components/groups/group-settings";
import { ShareGroupButton } from "@/components/share/share-group-button";
import { surfaceCardClass } from "@/components/ui/surface";
import { getCurrentUser } from "@/lib/auth/session";
import { getGroupBalances } from "@/lib/balances/queries";
import { getExpensesForGroup } from "@/lib/expenses/queries";
import { getGroupDetail } from "@/lib/groups/queries";
import { getSettlementHistory } from "@/lib/settlements/queries";
import { redirect } from "next/navigation";

type GroupPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ settle?: string }>;
};

export default async function GroupPage({ params, searchParams }: GroupPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const { settle } = await searchParams;
  const group = await getGroupDetail(id);
  const payerLabels = new Map(group.members.map((member) => [member.id, member.label]));
  const [expenses, balances, settlementHistory] = await Promise.all([
    getExpensesForGroup(id, payerLabels),
    getGroupBalances(id, group.members),
    getSettlementHistory(id, group.members),
  ]);
  const currentUserMember = group.members.find((member) => member.user_id === user.id);
  const currentUserMemberId = currentUserMember?.id ?? "";
  const isAdmin = currentUserMember?.role === "admin";
  const groupSummary = buildGroupExpenseSummary(group.members, expenses);

  return (
    <>
      <AppHeader backHref="/app" title={group.name} />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-8 px-4 py-6">
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Group summary
          </h2>
          <GroupSummary summary={groupSummary} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Balances
            </h2>
            <ShareGroupButton
              groupName={group.name}
              summary={groupSummary}
              expenses={expenses}
              balances={balances}
            />
          </div>
          <BalanceSummary
            balances={balances}
            currentUserMemberId={currentUserMemberId}
            groupId={group.id}
            settleError={settle === "failed" ? "failed" : null}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Expenses
          </h2>
          <ExpenseList expenses={expenses} groupId={group.id} />
        </section>

        <section className={surfaceCardClass("peach", "space-y-4 p-4") }>
          <div>
            <h2 className="text-sm font-medium text-foreground">Add expense</h2>
            <p className="mt-1 text-xs text-muted-foreground">
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
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Payment history
          </h2>
          <SettlementHistory
            items={settlementHistory}
            currentUserMemberId={currentUserMemberId}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Members
          </h2>
          <MemberList
            members={group.members}
            currentUserId={user.id}
            groupId={group.id}
          />
        </section>

        <section className={surfaceCardClass("yellow", "space-y-4 p-4") }>
          <h2 className="text-sm font-medium text-foreground">Add someone</h2>
          <AddMemberForm groupId={group.id} />
        </section>

        {isAdmin ? (
          <section className={surfaceCardClass("neutral", "space-y-4 p-4")}>
            <div>
              <h2 className="text-sm font-medium text-foreground">Group settings</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Rename or delete this group. Only admins can do this.
              </p>
            </div>
            <GroupSettings groupId={group.id} groupName={group.name} />
          </section>
        ) : null}
      </main>
    </>
  );
}
