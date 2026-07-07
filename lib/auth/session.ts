import { createInsForgeServerClient } from "@/lib/insforge/server";

export async function getCurrentUser() {
  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user) {
    return null;
  }

  return data.user;
}
