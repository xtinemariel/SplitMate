import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "SplitMate",
  description: "Split expenses with the fewest taps possible.",
};

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-zinc-900"
          >
            SplitMate
          </Link>
          {user ? (
            <Link
              href="/app"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              Open app
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
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
