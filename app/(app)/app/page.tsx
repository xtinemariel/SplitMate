import { signOut } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

export default async function AppPlaceholderPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          You&apos;re signed in
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Expense features are coming next. For now, this confirms authentication
          is working.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
        <p className="font-medium text-zinc-900">Account</p>
        <p className="mt-1 text-zinc-600">{user?.email}</p>
      </div>

      <form action={signOut}>
        <Button type="submit" variant="secondary" className="w-auto px-5">
          Sign out
        </Button>
      </form>
    </div>
  );
}
