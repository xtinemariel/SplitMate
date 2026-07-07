export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <span className="text-sm font-semibold tracking-tight">SplitMate</span>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
