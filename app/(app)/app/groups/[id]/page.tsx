import { AppHeader } from "@/components/app/app-header";
import { AddMemberForm } from "@/components/groups/add-member-form";
import { MemberList } from "@/components/groups/member-list";
import { getCurrentUser } from "@/lib/auth/session";
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

  return (
    <>
      <AppHeader backHref="/app" title={group.name} />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-8 px-4 py-6">
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
