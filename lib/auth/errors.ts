import type { InsForgeError } from "@insforge/sdk";

export function formatAuthError(error: InsForgeError | null): string {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  switch (error.error) {
    case "AUTH_UNAUTHORIZED":
      return "Incorrect email or password.";
    case "AUTH_EMAIL_NOT_VERIFIED":
      return "Verify your email before signing in.";
    case "AUTH_USER_ALREADY_EXISTS":
      return "An account with this email already exists.";
    case "AUTH_INVALID_OTP":
      return "Invalid verification code. Try again.";
    case "AUTH_OAUTH_PROVIDER_NOT_CONFIGURED":
      return "Google Sign-In is not configured yet.";
    default:
      return error.message || "Something went wrong. Please try again.";
  }
}

export function formatAuthSearchParam(error: string | null): string | null {
  if (!error) {
    return null;
  }

  switch (error) {
    case "oauth_failed":
      return "Google sign-in was cancelled or failed.";
    case "missing_verifier":
      return "Sign-in session expired. Please try again.";
    case "exchange_failed":
      return "Could not complete Google sign-in. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
