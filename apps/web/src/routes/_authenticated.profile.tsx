import { createFileRoute } from "@tanstack/react-router";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Activity,
  Target,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: session } = useSession();
  const trpc = useTRPC();

  const overallStatsQueryOptions = trpc.stats.getOverallStats.queryOptions({
    userId: session?.user.id || "",
  });
  const { data: overallStats } = useQuery(overallStatsQueryOptions);

  const runStatsQueryOptions = trpc.stats.getRunStats.queryOptions({
    userId: session?.user.id || "",
  });
  const { data: runStats } = useQuery(runStatsQueryOptions);

  const repStatsQueryOptions = trpc.stats.getRepStats.queryOptions({
    userId: session?.user.id || "",
  });
  const { data: repStats } = useQuery(repStatsQueryOptions);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-full bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(session?.user.name, session?.user.email)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl text-center">
                  {session?.user.name || "User"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground break-all">
                  {session?.user.email}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Joined {formatDate(session?.user.createdAt)}
                </span>
              </div>

              <Separator className="my-4" />

              <Button className="w-full" variant="outline">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fitness Stats</CardTitle>
                <CardDescription>Your workout achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {(overallStats as any)?.totalCompletedWorkouts || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Workouts
                      </p>
                    </div>
                  </div>

                  {runStats && (runStats as any).totalRuns > 0 && (
                    <>
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="p-3 bg-blue-500/10 rounded-full">
                          <Target className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {(runStats as any).totalMiles.toFixed(1)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Miles Run
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="p-3 bg-green-500/10 rounded-full">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {(runStats as any).totalRuns}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total Runs
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {repStats && (repStats as any).totalWorkouts > 0 && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="p-3 bg-yellow-500/10 rounded-full">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {(repStats as any).totalReps}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total Reps
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements Section */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Milestones you've reached on your fitness journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(overallStats as any)?.totalCompletedWorkouts >= 1 && (
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <div className="p-3 bg-blue-500/10 rounded-full mb-2">
                        <Trophy className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="font-medium text-center">First Workout</p>
                      <p className="text-xs text-muted-foreground text-center">
                        Completed your first workout
                      </p>
                    </div>
                  )}

                  {(overallStats as any)?.totalCompletedWorkouts >= 10 && (
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <div className="p-3 bg-green-500/10 rounded-full mb-2">
                        <Trophy className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="font-medium text-center">Consistent</p>
                      <p className="text-xs text-muted-foreground text-center">
                        Completed 10 workouts
                      </p>
                    </div>
                  )}

                  {(overallStats as any)?.totalCompletedWorkouts >= 50 && (
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <div className="p-3 bg-yellow-500/10 rounded-full mb-2">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                      </div>
                      <p className="font-medium text-center">Dedicated</p>
                      <p className="text-xs text-muted-foreground text-center">
                        Completed 50 workouts
                      </p>
                    </div>
                  )}

                  {runStats && (runStats as any).totalMiles >= 10 && (
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <div className="p-3 bg-purple-500/10 rounded-full mb-2">
                        <Trophy className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="font-medium text-center">Runner</p>
                      <p className="text-xs text-muted-foreground text-center">
                        Ran 10+ miles
                      </p>
                    </div>
                  )}

                  {(!overallStats ||
                    (overallStats as any)?.totalCompletedWorkouts === 0) && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      Complete workouts to unlock achievements!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
