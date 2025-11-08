import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { useEffect } from "react";

// This is a layout route for authenticated pages
// All routes nested under this will require authentication
export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session && !isPending) {
      navigate({
        to: "/login",
        search: {
          redirect: window.location.pathname,
        },
      });
    }
  }, [session, isPending, navigate]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return <Outlet />;
}
