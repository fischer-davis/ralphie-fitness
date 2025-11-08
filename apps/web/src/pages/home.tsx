import { useSession, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header, Counter } from "@repo/ui"

export function HomePage() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Ralphie Fitness</CardTitle>
            <CardDescription>
              Please sign in to access your fitness dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button asChild className="flex-1">
              <a href="/login">Sign in</a>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <a href="/register">Sign up</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header title="Ralphie Fitness" />
      <main className="container mx-auto p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Welcome back, {session.user.name}!</CardTitle>
            <CardDescription>Email: {session.user.email}</CardDescription>
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
  )
}
