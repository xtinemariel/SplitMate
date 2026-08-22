import Link from "next/link";

import { surfaceCardClass } from "@/components/ui/surface";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-6 py-16">
      <div className="w-full space-y-10">
        <div className="max-w-xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Expense sharing
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            SplitMate
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Split expenses. See balances. Settle up. Nothing more than you need.
          </p>

          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link
                href="/app"
                className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-primary/90"
              >
                Open app
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-primary/90"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center rounded-lg bg-secondary px-5 text-sm font-medium text-secondary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-accent hover:text-accent-foreground"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className={surfaceCardClass("lavender", "p-5") }>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Expense card
            </p>
            <p className="mt-3 text-sm leading-6 text-foreground">
              Log each shared cost without losing the context around it.
            </p>
          </div>
          <div className={surfaceCardClass("mint", "p-5") }>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Balance card
            </p>
            <p className="mt-3 text-sm leading-6 text-foreground">
              See who owes what at a glance before you settle up.
            </p>
          </div>
          <div className={surfaceCardClass("peach", "p-5") }>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Reminder card
            </p>
            <p className="mt-3 text-sm leading-6 text-foreground">
              Keep next steps visible so every group stays moving.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
