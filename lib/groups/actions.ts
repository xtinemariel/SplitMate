"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { ensureProfile } from "@/lib/profiles/ensure";
import { createInsForgeServerClient } from "@/lib/insforge/server";

export type GroupFormState = {
  error?: string;
  success?: string;
};

export type MemberFormState = {
  error?: string;
  success?: string;
};

async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await ensureProfile(user);
  return user;
}

export async function createGroup(
  _previousState: GroupFormState,
  formData: FormData,
): Promise<GroupFormState> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Group name is required." };
  }

  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.database.rpc("create_group", {
    p_name: name,
  });

  const groupId =
    data && typeof data === "object" && "id" in data
      ? String((data as { id: string }).id)
      : null;

  if (error || !groupId) {
    return { error: error?.message ?? "Could not create group." };
  }

  revalidatePath("/app");
  redirect(`/app/groups/${groupId}`);
}

export async function addMemberByName(
  _previousState: GroupFormState,
  formData: FormData,
): Promise<GroupFormState> {
  await requireUser();

  const groupId = String(formData.get("groupId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!groupId || !name) {
    return { error: "Member name is required." };
  }

  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.database.rpc("add_group_member_by_name", {
    p_group_id: groupId,
    p_name: name,
  });

  if (error) {
    return { error: error.message ?? "Could not add member." };
  }

  if (!data) {
    return { error: "Could not add member." };
  }

  revalidatePath("/app");
  revalidatePath(`/app/groups/${groupId}`);

  return { success: `Added ${name}.` };
}

export async function editMemberName(
  _previousState: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  await requireUser();

  const groupId = String(formData.get("groupId") ?? "").trim();
  const memberId = String(formData.get("memberId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!groupId || !memberId) {
    return { error: "Member is required." };
  }

  if (!name) {
    return { error: "Member name is required." };
  }

  if (name.length > 50) {
    return { error: "Member name must be 50 characters or less." };
  }

  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.database.rpc("update_group_member_name", {
    p_group_member_id: memberId,
    p_name: name,
  });

  if (error) {
    return { error: error.message ?? "Could not update member." };
  }

  if (!data) {
    return { error: "Could not update member." };
  }

  revalidatePath("/app");
  revalidatePath(`/app/groups/${groupId}`);

  return { success: "Member updated." };
}

export async function deleteMember(
  _previousState: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  await requireUser();

  const groupId = String(formData.get("groupId") ?? "").trim();
  const memberId = String(formData.get("memberId") ?? "").trim();

  if (!groupId || !memberId) {
    return { error: "Member is required." };
  }

  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.database.rpc("delete_group_member", {
    p_group_member_id: memberId,
  });

  if (error) {
    const message = error.message ?? "Could not remove member.";

    if (message.includes("cannot be removed because they are part of existing expenses")) {
      return {
        error:
          "This member can't be removed because they are part of existing expenses. Remove or update those expenses first.",
      };
    }

    return { error: message };
  }

  if (!data) {
    return { error: "Could not remove member." };
  }

  revalidatePath("/app");
  revalidatePath(`/app/groups/${groupId}`);

  return { success: "Member removed." };
}
