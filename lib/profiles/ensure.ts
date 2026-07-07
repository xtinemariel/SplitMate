import { createInsForgeServerClient } from "@/lib/insforge/server";

type AuthUser = {
  id: string;
  email?: string;
  profile?: {
    name?: string | null;
  } | null;
};

export async function ensureProfile(user: AuthUser) {
  const insforge = await createInsForgeServerClient();
  const displayName =
    user.profile?.name?.trim() ||
    user.email?.split("@")[0] ||
    "SplitMate user";

  await insforge.database.from("profiles").upsert([
    {
      id: user.id,
      display_name: displayName,
    },
  ]);
}

export async function getMemberLabel(userId: string, fallbackEmail?: string) {
  const insforge = await createInsForgeServerClient();

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.display_name?.trim()) {
    return profile.display_name.trim();
  }

  const { data: authProfile } = await insforge.auth.getProfile(userId);
  const name = authProfile?.profile?.name;

  if (typeof name === "string" && name.trim()) {
    return name.trim();
  }

  if (fallbackEmail) {
    return fallbackEmail.split("@")[0] ?? fallbackEmail;
  }

  return "Member";
}
