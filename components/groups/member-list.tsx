import type { GroupMemberWithLabel } from "@/lib/groups/queries";

export function MemberList({
  members,
  currentUserId,
}: {
  members: GroupMemberWithLabel[];
  currentUserId: string;
}) {
  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-900">
              {member.label}
              {member.user_id && member.user_id === currentUserId ? (
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  (you)
                </span>
              ) : null}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize text-zinc-600">
            {member.role}
          </span>
        </li>
      ))}
    </ul>
  );
}
