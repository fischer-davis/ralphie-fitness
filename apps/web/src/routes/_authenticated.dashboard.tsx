import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: session } = useSession();

  const { data: overallStats } = trpc.stats.getOverallStats.useQuery(
    { userId: session?.user.id || "" },
    { enabled: !!session?.user.id }
  );

  const { data: runStats } = trpc.stats.getRunStats.useQuery(
    { userId: session?.user.id || "" },
    { enabled: !!session?.user.id }
  );

  const { data: repStats } = trpc.stats.getRepStats.useQuery(
    { userId: session?.user.id || "" },
    { enabled: !!session?.user.id }
  );

  const { data: timeStats } = trpc.stats.getTimeStats.useQuery(
    { userId: session?.user.id || "" },
    { enabled: !!session?.user.id }
  );

  const { data: recentActivity } = trpc.stats.getRecentActivity.useQuery(
    { userId: session?.user.id || "", limit: 5 },
    { enabled: !!session?.user.id }
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      </header>
      <main className="container mx-auto p-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {overallStats?.totalCompletedWorkouts || 0}
              </div>
            </CardContent>
          </Card>

          {runStats && runStats.totalRuns > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Miles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {runStats.totalMiles.toFixed(1)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{runStats.totalRuns}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Avg Run Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatDuration(Math.round(runStats.avgDuration))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Running Stats Chart */}
        {runStats && runStats.chartData.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Running Performance</CardTitle>
              <CardDescription>
                Your running times over the last {runStats.chartData.length} runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {runStats.chartData.map((data, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-2">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(data.date)}
                    </div>
                    <div className="flex gap-4">
                      <div className="text-sm">
                        <span className="font-medium">{data.distance}</span> mi
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{formatDuration(data.duration)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(data.duration / 60 / data.distance).toFixed(2)} min/mi
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rep-Based Workout Stats */}
        {repStats && repStats.totalWorkouts > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Rep-Based Workouts</CardTitle>
              <CardDescription>
                Push-ups, sit-ups, squats, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Reps</div>
                  <div className="text-2xl font-bold">{repStats.totalReps}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Workouts</div>
                  <div className="text-2xl font-bold">{repStats.totalWorkouts}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Avg Reps</div>
                  <div className="text-2xl font-bold">
                    {Math.round(repStats.avgReps)}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {repStats.chartData.map((data, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-2">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(data.date)}
                    </div>
                    <div className="flex gap-4">
                      <div className="text-sm">
                        <span className="font-medium">{data.reps}</span> reps
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Target: {data.target}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time-Based Workout Stats */}
        {timeStats && timeStats.totalWorkouts > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Time-Based Workouts</CardTitle>
              <CardDescription>
                Planks and other timed exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Duration</div>
                  <div className="text-2xl font-bold">
                    {formatDuration(timeStats.totalDuration)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Workouts</div>
                  <div className="text-2xl font-bold">{timeStats.totalWorkouts}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Avg Duration</div>
                  <div className="text-2xl font-bold">
                    {formatDuration(Math.round(timeStats.avgDuration))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {timeStats.chartData.map((data, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-2">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(data.date)}
                    </div>
                    <div className="flex gap-4">
                      <div className="text-sm">
                        <span className="font-medium">{formatDuration(data.duration)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Target: {formatDuration(data.target)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest workouts</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.instanceId} className="border-b pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{activity.templateName}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.completedAt && formatDate(activity.completedAt.toISOString())}
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.workoutType === "run" && activity.duration && (
                          <div className="text-sm">{formatDuration(activity.duration)}</div>
                        )}
                        {activity.workoutType === "reps" && (
                          <div className="text-sm">{activity.actualReps} reps</div>
                        )}
                        {activity.workoutType === "time" && activity.actualDuration && (
                          <div className="text-sm">{formatDuration(activity.actualDuration)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No workouts yet. Start tracking your fitness journey!
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
