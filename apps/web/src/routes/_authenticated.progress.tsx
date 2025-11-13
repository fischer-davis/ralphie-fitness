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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Running Progress</CardTitle>
              <CardDescription>
                Your running performance over the last {runStats.chartData.length} runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {runStats.chartData.map((data: any, idx: number) => {
                  const pace = data.duration / 60 / data.distance;
                  const prevPace =
                    idx > 0
                      ? runStats.chartData[idx - 1].duration /
                        60 /
                        runStats.chartData[idx - 1].distance
                      : null;
                  const improvement = prevPace ? ((prevPace - pace) / prevPace) * 100 : null;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{formatDate(data.date)}</div>
                          <div className="text-sm text-muted-foreground">
                            {data.distance} miles
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">
                            {formatDuration(data.duration)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {pace.toFixed(2)} min/mi
                          </div>
                        </div>

                        {improvement !== null && (
                          <div
                            className={`flex items-center gap-1 text-sm font-medium ${
                              improvement > 0
                                ? "text-green-600"
                                : improvement < 0
                                ? "text-red-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {improvement > 0 ? (
                              <>
                                <TrendingUp className="h-4 w-4" />
                                <span>+{improvement.toFixed(1)}%</span>
                              </>
                            ) : improvement < 0 ? (
                              <>
                                <TrendingDown className="h-4 w-4" />
                                <span>{improvement.toFixed(1)}%</span>
                              </>
                            ) : (
                              <span>-</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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
              <div className="space-y-3">
                {repStats.chartData.map((data: any, idx: number) => {
                  const completion = (data.reps / data.target) * 100;
                  const prevCompletion =
                    idx > 0
                      ? (repStats.chartData[idx - 1].reps /
                          repStats.chartData[idx - 1].target) *
                        100
                      : null;
                  const improvement = prevCompletion
                    ? completion - prevCompletion
                    : null;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{formatDate(data.date)}</div>
                          <div className="text-sm text-muted-foreground">
                            Target: {data.target} reps
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{data.reps} reps</div>
                          <div className="text-sm text-muted-foreground">
                            {completion.toFixed(0)}% of target
                          </div>
                        </div>

                        {improvement !== null && (
                          <div
                            className={`flex items-center gap-1 text-sm font-medium ${
                              improvement > 0
                                ? "text-green-600"
                                : improvement < 0
                                ? "text-red-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {improvement > 0 ? (
                              <>
                                <TrendingUp className="h-4 w-4" />
                                <span>+{improvement.toFixed(1)}%</span>
                              </>
                            ) : improvement < 0 ? (
                              <>
                                <TrendingDown className="h-4 w-4" />
                                <span>{improvement.toFixed(1)}%</span>
                              </>
                            ) : (
                              <span>-</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
