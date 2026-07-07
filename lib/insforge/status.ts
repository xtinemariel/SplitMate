import { createInsForgeServerClient } from "@/lib/insforge/server";

export type BackendStatus = {
  connected: boolean;
  message: string;
};

export async function getBackendStatus(): Promise<BackendStatus> {
  try {
    const insforge = await createInsForgeServerClient();
    const { data, error } = await insforge.auth.getPublicAuthConfig();

    if (error) {
      return {
        connected: false,
        message: error.message ?? "Unable to reach InsForge",
      };
    }

    if (!data) {
      return {
        connected: false,
        message: "InsForge returned an empty auth config",
      };
    }

    return {
      connected: true,
      message: "Connected to InsForge",
    };
  } catch (error) {
    return {
      connected: false,
      message:
        error instanceof Error ? error.message : "Unknown connection error",
    };
  }
}
