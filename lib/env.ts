type PublicEnvKey =
  | "NEXT_PUBLIC_INSFORGE_URL"
  | "NEXT_PUBLIC_INSFORGE_ANON_KEY";

function readPublicEnv(key: PublicEnvKey): string {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getPublicEnv() {
  return {
    insforgeUrl: readPublicEnv("NEXT_PUBLIC_INSFORGE_URL"),
    insforgeAnonKey: readPublicEnv("NEXT_PUBLIC_INSFORGE_ANON_KEY"),
    appUrl:
      process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "http://localhost:3000",
  };
}
