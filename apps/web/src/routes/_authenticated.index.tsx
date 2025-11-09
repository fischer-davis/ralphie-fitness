import { createFileRoute } from "@tanstack/react-router";
import { useSession, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header, Counter } from "@repo/ui";
import { ModeToggle } from "@/components/mode-toggle";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Header title="Ralphie Fitness" />
          <ModeToggle />
        </div>
      </div>
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

        <div className="card">
          <Counter />
        </div>
      </main>
    </div>
  );
}
