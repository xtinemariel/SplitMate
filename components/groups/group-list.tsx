import Link from "next/link";

import type { GroupSummary } from "@/lib/groups/queries";

function memberLabel(count: number) {
  return count === 1 ? "1 member" : `${count} members`;
}

export function GroupList({ groups }: { groups: GroupSummary[] }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-zinc-900">No groups yet</p>
        <p className="mt-2 text-sm text-zinc-600">
          Create a group to start splitting expenses with friends.
        </p>
        <Link
          href="/app/groups/new"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Create group
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {groups.map((group) => (
        <li key={group.id}>
          <Link
            href={`/app/groups/${group.id}`}
            className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-zinc-50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-900">{group.name}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {memberLabel(group.member_count)}
              </p>
            </div>
            <span className="text-zinc-400" aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
