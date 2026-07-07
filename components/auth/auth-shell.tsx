import Link from "next/link";

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
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-zinc-900"
          >
            SplitMate
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {children}
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm text-zinc-600">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
