import type { GroupMemberWithLabel } from "@/lib/groups/queries";
import {
  surfaceCardClass,
  surfaceListDivideClass,
} from "@/components/ui/surface";
import { MemberRow } from "@/components/groups/member-row";
import { cn } from "@/lib/utils";

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
    <ul
      className={surfaceCardClass(
        "neutral",
        cn("overflow-hidden", surfaceListDivideClass),
      )}
    >
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
