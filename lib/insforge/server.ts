import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

import { getPublicEnv } from "@/lib/env";

export async function createInsForgeServerClient() {
  const { insforgeUrl, insforgeAnonKey } = getPublicEnv();

  return createServerClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey,
    cookies: await cookies(),
  });
}
