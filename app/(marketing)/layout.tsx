import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SplitMate",
  description: "Split expenses with the fewest taps possible.",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <span className="text-sm font-semibold tracking-tight">SplitMate</span>
        </div>
      </header>
      {children}
    </div>
  );
}
