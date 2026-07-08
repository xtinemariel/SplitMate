import Link from "next/link";

import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export function AppHeader({
  title,
  backHref,
}: {
  title?: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="text-sm font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:text-foreground"
            >
              Back
            </Link>
          ) : (
            <Link
              href="/app"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              SplitMate
            </Link>
          )}
          {title ? (
            <span className={cn("truncate text-sm font-medium text-foreground")}>
              {title}
            </span>
          ) : null}
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="text-sm font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
