import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RegisterForm } from "@/components/auth/register-form";
import { useSession } from "@/lib/auth";
import { useEffect } from "react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && !isPending) {
      navigate({ to: "/" });
    }
  }, [session, isPending, navigate]);

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <RegisterForm />
    </div>
  );
}
