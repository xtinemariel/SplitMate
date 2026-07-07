"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";

import { formatAuthError } from "@/lib/auth/errors";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getPublicEnv } from "@/lib/env";

export type AuthFormState = {
  error?: string;
  needsVerification?: boolean;
  email?: string;
};

async function createAuth() {
  return createAuthActions({ cookies: await cookies() });
}

export async function signInWithEmail(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(String(formData.get("next") ?? "/app"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const auth = await createAuth();
  const { data, error } = await auth.signInWithPassword({ email, password });

  if (error) {
    return { error: formatAuthError(error) };
  }

  if (!data?.user) {
    return { error: "Sign in failed. Please try again." };
  }

  redirect(next);
}

export async function signUpWithEmail(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const { appUrl } = getPublicEnv();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const auth = await createAuth();
  const { data, error } = await auth.signUp({
    email,
    password,
    name: name || undefined,
    redirectTo: `${appUrl}/login`,
  });

  if (error) {
    return { error: formatAuthError(error) };
  }

  if (data?.requireEmailVerification) {
    return {
      needsVerification: true,
      email,
    };
  }

  if (data?.user) {
    redirect("/app");
  }

  return { error: "Sign up failed. Please try again." };
}

export async function verifyEmailCode(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!email || !otp) {
    return { error: "Email and verification code are required.", email };
  }

  const auth = await createAuth();
  const { data, error } = await auth.verifyEmail({ email, otp });

  if (error) {
    return { error: formatAuthError(error), needsVerification: true, email };
  }

  if (!data?.user) {
    return {
      error: "Verification failed. Please try again.",
      needsVerification: true,
      email,
    };
  }

  redirect("/app");
}

export async function signInWithGoogle() {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const { appUrl } = getPublicEnv();

  const { data, error } = await auth.signInWithOAuth("google", {
    redirectTo: new URL("/api/auth/callback", appUrl).toString(),
    additionalParams: { prompt: "select_account" },
    skipBrowserRedirect: true,
  });

  if (error || !data.url || !data.codeVerifier) {
    redirect("/login?error=oauth_failed");
  }

  cookieStore.set("insforge_code_verifier", data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  redirect(data.url);
}

export async function signOut() {
  const auth = await createAuth();
  await auth.signOut();
  redirect("/login");
}
