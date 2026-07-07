import type { GroupMemberWithLabel } from "@/lib/groups/queries";

export type BillableMember = GroupMemberWithLabel & {
  user_id: string;
};

export function getBillableMembers(
  members: GroupMemberWithLabel[],
): BillableMember[] {
  return members.filter(
    (member): member is BillableMember => member.user_id !== null,
  );
}
