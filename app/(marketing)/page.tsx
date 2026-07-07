import Link from "next/link";

import { getBackendStatus } from "@/lib/insforge/status";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  const [backend, user] = await Promise.all([
    getBackendStatus(),
    getCurrentUser(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
      <div className="max-w-xl space-y-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Expense sharing
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          SplitMate
        </h1>
        <p className="text-lg leading-8 text-zinc-600">
        Split expenses. See balances. Settle up. Nothing more than you need.
        </p>

        <div className="flex flex-wrap gap-3">
          {user ? (
            <Link
              href="/app"
              className="inline-flex h-11 items-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-11 items-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                Create account
              </Link>
            </>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">
          <p className="font-medium text-zinc-900">Backend status</p>
          <p
            className={
              backend.connected ? "mt-1 text-emerald-700" : "mt-1 text-red-700"
            }
          >
            {backend.message}
          </p>
        </div>
      </div>
    </main>
  );
}
