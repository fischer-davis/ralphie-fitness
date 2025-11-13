import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dumbbell,
  TrendingUp,
  Calendar,
  Target,
  ListChecks,
  Activity,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

function HomePage() {
  const { data: session } = useSession();
  const trpc = useTRPC();

  const overallStatsQueryOptions = trpc.stats.getOverallStats.queryOptions({
    userId: session?.user.id || "",
  });
  const { data: overallStats } = useQuery(overallStatsQueryOptions);

  const recentActivityQueryOptions = trpc.stats.getRecentActivity.queryOptions({
    userId: session?.user.id || "",
    limit: 3,
  });
  const { data: recentActivity = [] as any[] } = useQuery(recentActivityQueryOptions);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-full bg-background">
      <div className="p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {session?.user.name || "there"}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to crush your fitness goals today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(overallStats as any)?.totalCompletedWorkouts || 0}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Workouts completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">% to goal</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump right into your fitness routine</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/workouts">
                <Button className="w-full h-auto flex flex-col items-start p-4" variant="outline">
                  <Dumbbell className="h-6 w-6 mb-2" />
                  <span className="font-semibold text-base">Record Workout</span>
                  <span className="text-xs text-muted-foreground">
                    Log your training session
                  </span>
                </Button>
              </Link>

              <Link to="/templates">
                <Button className="w-full h-auto flex flex-col items-start p-4" variant="outline">
                  <ListChecks className="h-6 w-6 mb-2" />
                  <span className="font-semibold text-base">Manage Templates</span>
                  <span className="text-xs text-muted-foreground">
                    Create workout plans
                  </span>
                </Button>
              </Link>

              <Link to="/dashboard">
                <Button className="w-full h-auto flex flex-col items-start p-4" variant="outline">
                  <Activity className="h-6 w-6 mb-2" />
                  <span className="font-semibold text-base">View Dashboard</span>
                  <span className="text-xs text-muted-foreground">
                    See detailed stats
                  </span>
                </Button>
              </Link>

              <Link to="/progress">
                <Button className="w-full h-auto flex flex-col items-start p-4" variant="outline">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span className="font-semibold text-base">Track Progress</span>
                  <span className="text-xs text-muted-foreground">
                    Analyze your journey
                  </span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Link to="/workouts">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {(recentActivity as any[]).length > 0 ? (
                <div className="space-y-3">
                  {(recentActivity as any[]).map((activity: any) => (
                    <div
                      key={activity.instanceId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.templateName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.completedAt && formatDate(activity.completedAt.toISOString())}
                        </p>
                      </div>
                      <Dumbbell className="h-4 w-4 text-muted-foreground ml-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No workouts yet</p>
                  <p className="text-xs">Start your fitness journey!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Motivational Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Keep Going! 💪</CardTitle>
            <CardDescription>
              Every workout counts. Stay consistent and you'll see amazing results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/exercises">
              <Button>
                Explore Exercises
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
