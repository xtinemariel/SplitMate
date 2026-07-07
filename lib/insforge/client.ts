import { createBrowserClient } from "@insforge/sdk/ssr";

import { getPublicEnv } from "@/lib/env";

const { insforgeUrl, insforgeAnonKey } = getPublicEnv();

export const insforge = createBrowserClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey,
});
