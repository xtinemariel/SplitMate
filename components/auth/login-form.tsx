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
  signInWithEmail,
  type AuthFormState,
} from "@/lib/auth/actions";

const initialState: AuthFormState = {};

export function LoginForm({
  nextPath,
  initialError,
}: {
  nextPath: string;
  initialError?: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    signInWithEmail,
    initialState,
  );
  const error = state.error ?? initialError;

  return (
    <AuthShell
      title="Sign in"
      description="Welcome back. Keep the group settled."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground">
            Sign up
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

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={nextPath} />

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
              autoComplete="current-password"
              placeholder="Your password"
              required
            />
          </div>

          {error ? (
            <p className={noticeClass.warning}>{error}</p>
          ) : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
