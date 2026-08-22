import Link from "next/link";

import { surfaceCardClass } from "@/components/ui/surface";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-sm space-y-4">
        <div className={surfaceCardClass("blue", "p-6")}>
          <div className="text-center">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              SplitMate
            </Link>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className={surfaceCardClass("neutral", "p-6")}>
          {children}
        </div>

        {footer ? (
          <div className="px-2 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
