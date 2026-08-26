"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { noticeClass } from "@/components/ui/surface";
import {
  signUpWithEmail,
  verifyEmailCode,
  type AuthFormState,
} from "@/lib/auth/actions";

const initialState: AuthFormState = {};

export function SignUpForm() {
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUpWithEmail,
    initialState,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyEmailCode,
    initialState,
  );

  const needsVerification =
    signUpState.needsVerification || verifyState.needsVerification;
  const email = verifyState.email ?? signUpState.email ?? "";
  const error = verifyState.error ?? signUpState.error;

  if (needsVerification) {
    return (
      <AuthShell
        title="Verify your email"
        description={`Enter the 6-digit code sent to ${email}.`}
        footer={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground">
              Sign in
            </Link>
          </>
        }
      >
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />

          <div className="space-y-2">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              required
            />
          </div>

          {error ? (
            <p className={noticeClass.warning}>{error}</p>
          ) : null}

          <Button type="submit" disabled={verifyPending}>
            {verifyPending ? "Verifying..." : "Verify and continue"}
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create account"
      description="For the one who always pays first."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <GoogleSignInButton />

        <div className="flex items-center justify-center">
          <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            or
          </span>
        </div>

        <form action={signUpAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Alex"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          {error ? (
            <p className={noticeClass.warning}>{error}</p>
          ) : null}

          <Button type="submit" disabled={signUpPending}>
            {signUpPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
