import Link from "next/link";

import { AppHeader } from "@/components/app/app-header";
import { GroupList } from "@/components/groups/group-list";
import { ensureProfile } from "@/lib/profiles/ensure";
import { getGroupsForCurrentUser } from "@/lib/groups/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function GroupsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await ensureProfile(user);
  const groups = await getGroupsForCurrentUser();

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Groups
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your shared expense groups
            </p>
          </div>
          {groups.length > 0 ? (
            <Link
              href="/app/groups/new"
              className="inline-flex h-10 shrink-0 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-primary/90"
            >
              New
            </Link>
          ) : null}
        </div>

        <GroupList groups={groups} />
      </main>
    </>
  );
}
