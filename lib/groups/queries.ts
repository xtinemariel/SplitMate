import { notFound } from "next/navigation";

import { getMemberLabel } from "@/lib/profiles/ensure";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { Group, GroupMember } from "@/types/database";

export type GroupSummary = Group & {
  member_count: number;
};

export type GroupMemberWithLabel = GroupMember & {
  label: string;
};

export type GroupDetail = Group & {
  members: GroupMemberWithLabel[];
};

export async function getGroupsForCurrentUser(): Promise<GroupSummary[]> {
  const insforge = await createInsForgeServerClient();

  const { data, error } = await insforge.database
    .from("groups")
    .select("id, name, created_by, created_at, updated_at, group_members(count)")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load groups");
  }

  return (data ?? []).map((group) => ({
    id: group.id,
    name: group.name,
    created_by: group.created_by,
    created_at: group.created_at,
    updated_at: group.updated_at,
    member_count: group.group_members?.[0]?.count ?? 0,
  }));
}

export async function getGroupDetail(groupId: string): Promise<GroupDetail> {
  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const insforge = await createInsForgeServerClient();

  const { data: group, error: groupError } = await insforge.database
    .from("groups")
    .select("id, name, created_by, created_at, updated_at")
    .eq("id", groupId)
    .maybeSingle();

  if (groupError) {
    throw new Error(groupError.message ?? "Failed to load group");
  }

  if (!group) {
    notFound();
  }

  const { data: members, error: membersError } = await insforge.database
    .from("group_members")
    .select("id, group_id, user_id, display_name, role, joined_at")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (membersError) {
    throw new Error(membersError.message ?? "Failed to load members");
  }

  const membersWithLabels = await Promise.all(
    (members ?? []).map(async (member) => {
      if (member.display_name?.trim()) {
        return {
          ...member,
          label: member.display_name.trim(),
        };
      }

      if (member.user_id) {
        return {
          ...member,
          label: await getMemberLabel(
            member.user_id,
            member.user_id === user.id ? user.email : undefined,
          ),
        };
      }

      return {
        ...member,
        label: "Member",
      };
    }),
  );

  return {
    ...group,
    members: membersWithLabels,
  };
}
