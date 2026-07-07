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
  const user = await requireUser();
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
