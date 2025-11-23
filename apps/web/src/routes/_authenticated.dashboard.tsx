import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: session } = useSession();
  const trpc = useTRPC();

  const overallStatsQueryOptions = trpc.stats.getOverallStats.queryOptions({
    userId: session?.user.id || "",
  });
  const { data: overallStats } = useQuery(overallStatsQueryOptions);

  const runStatsQueryOptions = trpc.stats.getRunStats.queryOptions({
    userId: session?.user.id || "",
  });
  const { data: runStats = null as any } = useQuery(runStatsQueryOptions);

  const repStatsQueryOptions = trpc.stats.getRepStats.queryOptions({
    userId: session?.user.id || "",
  });
  const { data: repStats = null as any } = useQuery(repStatsQueryOptions);

  const timeStatsQueryOptions = trpc.stats.getTimeStats.queryOptions({
    userId: session?.user.id || "",
  });
  const { data: timeStats = null as any } = useQuery(timeStatsQueryOptions);

  const recentActivityQueryOptions = trpc.stats.getRecentActivity.queryOptions({
    userId: session?.user.id || "",
    limit: 5,
  });
  const { data: recentActivity = [] as any[] } = useQuery(recentActivityQueryOptions);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateValue: string | Date) => {
    const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-full bg-background">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(overallStats as any)?.totalCompletedWorkouts || 0}
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
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={runStats.chartData.map((data: any) => ({
                    date: formatDate(data.date).replace('/' + new Date(data.date).getFullYear(), ''),
                    distance: data.distance,
                    time: data.duration / 60,
                  }))}
                >
                  <defs>
                    <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Distance (mi)', angle: -90, position: 'insideLeft' }}
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="distance"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorDistance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
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
              <div className="grid grid-cols-3 gap-4 mb-6">
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
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={repStats.chartData.map((data: any) => ({
                    date: formatDate(data.date).replace('/' + new Date(data.date).getFullYear(), ''),
                    reps: data.reps,
                    target: data.target,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="reps" fill="hsl(var(--primary))" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="hsl(var(--muted))" name="Target" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
              <div className="grid grid-cols-3 gap-4 mb-6">
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
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={timeStats.chartData.map((data: any) => ({
                    date: formatDate(data.date).replace('/' + new Date(data.date).getFullYear(), ''),
                    duration: data.duration,
                    target: data.target,
                  }))}
                >
                  <defs>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Duration (seconds)', angle: -90, position: 'insideLeft' }}
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="duration"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorDuration)"
                  />
                </AreaChart>
              </ResponsiveContainer>
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
            {(recentActivity as any[]).length > 0 ? (
              <div className="space-y-4">
                {(recentActivity as any[]).map((activity: any) => (
                  <div key={activity.instanceId} className="border-b pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{activity.templateName}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.completedAt && formatDate(activity.completedAt)}
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
      </div>
    </div>
  );
}
