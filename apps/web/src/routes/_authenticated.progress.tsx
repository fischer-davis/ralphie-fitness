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
import { TrendingUp, TrendingDown, Activity, Target, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/progress")({
  component: ProgressPage,
});

function ProgressPage() {
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-full bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Progress & Analytics</h1>
          <p className="text-muted-foreground">
            Track your fitness journey and see how you're improving over time
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(overallStats as any)?.totalCompletedWorkouts || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All time completed
              </p>
            </CardContent>
          </Card>

          {runStats && runStats.totalRuns > 0 && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {runStats.totalMiles.toFixed(1)} mi
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across {runStats.totalRuns} runs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Pace</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {runStats.avgDuration && runStats.totalMiles
                      ? (runStats.avgDuration / 60 / (runStats.totalMiles / runStats.totalRuns)).toFixed(2)
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minutes per mile
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {repStats && repStats.totalWorkouts > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Reps</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{repStats.totalReps}</div>
                <p className="text-xs text-muted-foreground">
                  Across {repStats.totalWorkouts} workouts
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Running Progress Chart */}
        {runStats && runStats.chartData.length > 0 && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Running Pace Trend</CardTitle>
                <CardDescription>
                  Your pace (minutes per mile) over the last {runStats.chartData.length} runs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={runStats.chartData.map((data: any) => ({
                      date: formatDate(data.date).replace(', ' + new Date(data.date).getFullYear(), ''),
                      pace: Number((data.duration / 60 / data.distance).toFixed(2)),
                      distance: data.distance,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      label={{ value: 'Pace (min/mi)', angle: -90, position: 'insideLeft' }}
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pace"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Running Distance</CardTitle>
                <CardDescription>
                  Distance covered over your last {runStats.chartData.length} runs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={runStats.chartData.map((data: any) => ({
                      date: formatDate(data.date).replace(', ' + new Date(data.date).getFullYear(), ''),
                      distance: data.distance,
                      duration: data.duration / 60,
                    }))}
                  >
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
                    <Bar dataKey="distance" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {/* Rep-Based Progress */}
        {repStats && repStats.chartData.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Rep-Based Progress</CardTitle>
              <CardDescription>
                Your performance on rep-based exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={repStats.chartData.map((data: any) => ({
                    date: formatDate(data.date).replace(', ' + new Date(data.date).getFullYear(), ''),
                    reps: data.reps,
                    target: data.target,
                    completion: Math.round((data.reps / data.target) * 100),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Reps', angle: -90, position: 'insideLeft' }}
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
                  <Bar dataKey="reps" fill="hsl(var(--primary))" name="Actual" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="target" fill="hsl(var(--muted))" name="Target" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {(!overallStats || (overallStats as any)?.totalCompletedWorkouts === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>No progress data yet</CardTitle>
              <CardDescription>
                Start completing workouts to see your progress and analytics here
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
