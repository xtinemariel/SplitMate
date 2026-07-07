import type { GroupMemberWithLabel } from "@/lib/groups/queries";
import { MemberRow } from "@/components/groups/member-row";

export function MemberList({
  members,
  currentUserId,
  groupId,
}: {
  members: GroupMemberWithLabel[];
  currentUserId: string;
  groupId: string;
}) {
  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {members.map((member) => (
        <MemberRow
          key={`${member.id}:${member.label}`}
          member={member}
          currentUserId={currentUserId}
          groupId={groupId}
        />
      ))}
    </ul>
  );
}
