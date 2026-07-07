import { createInsForgeServerClient } from "@/lib/insforge/server";
import { formatCents } from "@/lib/expenses/money";
import type { GroupMemberWithLabel } from "@/lib/groups/queries";

export type SettlementHistoryItem = {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
  settledAt: string;
  fromLabel: string;
  toLabel: string;
  formattedAmount: string;
};

export async function getSettlementHistory(
  groupId: string,
  members: GroupMemberWithLabel[],
): Promise<SettlementHistoryItem[]> {
  const insforge = await createInsForgeServerClient();

  const { data, error } = await insforge.database
    .from("settlements")
    .select(
      "id, from_group_member_id, to_group_member_id, amount_cents, settled_at, created_at",
    )
    .eq("group_id", groupId)
    .order("settled_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(error.message ?? "Failed to load settlement history");
  }

  const labelById = new Map(members.map((member) => [member.id, member.label]));

  return (data ?? []).map((item) => ({
    id: item.id,
    fromMemberId: item.from_group_member_id,
    toMemberId: item.to_group_member_id,
    amountCents: item.amount_cents,
    settledAt: item.settled_at,
    fromLabel: labelById.get(item.from_group_member_id) ?? "Member",
    toLabel: labelById.get(item.to_group_member_id) ?? "Member",
    formattedAmount: formatCents(item.amount_cents),
  }));
}
