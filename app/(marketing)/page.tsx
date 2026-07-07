import { getBackendStatus } from "@/lib/insforge/status";

export default async function HomePage() {
  const backend = await getBackendStatus();

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
          A minimalist Splitwise alternative. Fast, minimal, and built for
          friends, roommates, and travel groups.
        </p>
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
