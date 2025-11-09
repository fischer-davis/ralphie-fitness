import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/login-form";
import { useSession } from "@/lib/auth";
import { useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    return {
      redirect: (search.redirect as string) || undefined,
    };
  },
});

function LoginPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();

  useEffect(() => {
    if (session && !isPending) {
      navigate({ to: redirectTo || "/" });
    }
  }, [session, isPending, navigate, redirectTo]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <LoginForm />
    </div>
  );
}
