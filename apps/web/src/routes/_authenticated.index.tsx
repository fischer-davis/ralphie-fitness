import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@repo/ui";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header title="Ralphie Fitness" />
      <main className="container mx-auto p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Welcome back, {session?.user.name}!</CardTitle>
            <CardDescription>Email: {session?.user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signOut()}>Sign out</Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>
                View your workout stats and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard">
                <Button>View Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workout Templates</CardTitle>
              <CardDescription>
                Create and manage your workout templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/templates">
                <Button>Manage Templates</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Workouts</CardTitle>
              <CardDescription>
                Record and track your workout sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/workouts">
                <Button>Record Workout</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
