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
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
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
