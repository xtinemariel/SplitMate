import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Abono",
  description:
    "For the one who always pays first. The designated treasurer of the group.",
};

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            Abono
          </Link>
          {user ? (
            <Link
              href="/app"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Open app
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
