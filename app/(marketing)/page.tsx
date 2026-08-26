import Link from "next/link";

import { surfaceCardClass } from "@/components/ui/surface";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-6 py-16">
      <div className="w-full space-y-10">
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Abono
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            For the one who always pays first. The designated treasurer of the
            group.
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
          <div className={surfaceCardClass("lavender", "p-5")}>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Pay first
            </p>
            <p className="mt-3 text-sm leading-6 text-foreground">
              Track what you covered for the group before anyone settles up.
            </p>
          </div>
          <div className={surfaceCardClass("mint", "p-5")}>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              See balances
            </p>
            <p className="mt-3 text-sm leading-6 text-foreground">
              Know exactly who owes you, and how much, at a glance.
            </p>
          </div>
          <div className={surfaceCardClass("peach", "p-5")}>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Collect
            </p>
            <p className="mt-3 text-sm leading-6 text-foreground">
              Share a clean summary so people can pay you back faster.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
