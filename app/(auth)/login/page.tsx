import { LoginForm } from "@/components/auth/login-form";
import { formatAuthSearchParam } from "@/lib/auth/errors";
import { safeRedirectPath } from "@/lib/auth/redirect";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <LoginForm
      nextPath={safeRedirectPath(params.next)}
      initialError={formatAuthSearchParam(params.error ?? null)}
    />
  );
}
