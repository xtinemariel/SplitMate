"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { createInsForgeServerClient } from "@/lib/insforge/server";

export async function settleUp(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const groupId = String(formData.get("groupId") ?? "").trim();
  const fromGroupMemberId = String(formData.get("fromGroupMemberId") ?? "").trim();
  const toGroupMemberId = String(formData.get("toGroupMemberId") ?? "").trim();
  const amountCents = Number(formData.get("amountCents") ?? 0);

  if (
    !groupId ||
    !fromGroupMemberId ||
    !toGroupMemberId ||
    !Number.isFinite(amountCents) ||
    amountCents <= 0
  ) {
    redirect(`/app/groups/${groupId || ""}?settle=failed`);
  }

  const insforge = await createInsForgeServerClient();
  const { error } = await insforge.database.from("settlements").insert([
    {
      group_id: groupId,
      from_group_member_id: fromGroupMemberId,
      to_group_member_id: toGroupMemberId,
      amount_cents: Math.trunc(amountCents),
      created_by: user.id,
    },
  ]);

  if (error) {
    redirect(`/app/groups/${groupId}?settle=failed`);
  }

  revalidatePath(`/app/groups/${groupId}`);
  redirect(`/app/groups/${groupId}`);
}
