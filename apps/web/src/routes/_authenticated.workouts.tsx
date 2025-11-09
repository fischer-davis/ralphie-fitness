import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/workouts")({
  component: WorkoutsPage,
});

function WorkoutsPage() {
  const { data: session } = useSession();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  const [currentLapInput, setCurrentLapInput] = useState("");

  const { data: templates } = trpc.workoutTemplates.getAll.useQuery(
    { userId: session?.user.id || "" },
    { enabled: !!session?.user.id }
  );

  const { data: instances, refetch: refetchInstances } = trpc.workoutInstances.getAll.useQuery(
    { userId: session?.user.id || "", limit: 20 },
    { enabled: !!session?.user.id }
  );

  const createInstanceMutation = trpc.workoutInstances.create.useMutation({
    onSuccess: () => {
      refetchInstances();
      setSelectedTemplate(null);
      setLapTimes([]);
      setCurrentLapInput("");
    },
  });

  const markCompleteMutation = trpc.workoutInstances.markComplete.useMutation({
    onSuccess: () => {
      refetchInstances();
    },
  });

  const template = templates?.find((t) => t.id === selectedTemplate);

  const handleAddLap = () => {
    const lapTime = parseFloat(currentLapInput);
    if (!isNaN(lapTime) && lapTime > 0) {
      setLapTimes([...lapTimes, lapTime]);
      setCurrentLapInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user.id || !selectedTemplate || !template) return;

    const formData = new FormData(e.currentTarget);
    const notes = formData.get("notes") as string;

    const baseData = {
      templateId: selectedTemplate,
      userId: session.user.id,
      notes: notes || undefined,
      completedAt: new Date().toISOString(),
    };

    if (template.type === "run") {
      const duration = parseInt(formData.get("duration") as string);
      createInstanceMutation.mutate({
        ...baseData,
        completed: true,
        duration,
        lapTimes: lapTimes.length > 0 ? lapTimes : undefined,
      });
    } else if (template.type === "reps") {
      const actualReps = parseInt(formData.get("actualReps") as string);
      createInstanceMutation.mutate({
        ...baseData,
        completed: true,
        actualReps,
      });
    } else if (template.type === "time") {
      const actualDuration = parseInt(formData.get("actualDuration") as string);
      createInstanceMutation.mutate({
        ...baseData,
        completed: true,
        actualDuration,
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold">My Workouts</h1>
        </div>
      </header>
      <main className="container mx-auto p-4">
        {!selectedTemplate && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Select a workout to record</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates?.map((t) => (
                <Card key={t.id} className="cursor-pointer hover:border-primary" onClick={() => setSelectedTemplate(t.id)}>
                  <CardHeader>
                    <CardTitle>{t.name}</CardTitle>
                    <CardDescription>
                      {t.type === "run" && `${t.distance} miles`}
                      {t.type === "reps" && `${t.targetReps} reps`}
                      {t.type === "time" && formatDuration(t.targetDuration || 0)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm">Record Workout</Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {templates && templates.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No templates available</CardTitle>
                  <CardDescription>
                    Create some workout templates first to get started!
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        )}

        {selectedTemplate && template && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Record: {template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {template.type === "run" && (
                  <>
                    <div>
                      <Label htmlFor="duration">Total Duration (seconds)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        required
                        placeholder="Total time in seconds"
                      />
                    </div>

                    <div>
                      <Label>Lap Times (optional)</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={currentLapInput}
                          onChange={(e) => setCurrentLapInput(e.target.value)}
                          placeholder="Lap time in seconds"
                        />
                        <Button type="button" onClick={handleAddLap}>
                          Add Lap
                        </Button>
                      </div>
                      {lapTimes.length > 0 && (
                        <div className="text-sm">
                          Laps: {lapTimes.map((t, i) => `${i + 1}. ${t}s`).join(", ")}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {template.type === "reps" && (
                  <div>
                    <Label htmlFor="actualReps">Reps Completed</Label>
                    <Input
                      id="actualReps"
                      name="actualReps"
                      type="number"
                      required
                      placeholder={`Target: ${template.targetReps}`}
                    />
                  </div>
                )}

                {template.type === "time" && (
                  <div>
                    <Label htmlFor="actualDuration">Duration (seconds)</Label>
                    <Input
                      id="actualDuration"
                      name="actualDuration"
                      type="number"
                      required
                      placeholder={`Target: ${template.targetDuration}s`}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="How did it feel?"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createInstanceMutation.isPending}>
                    {createInstanceMutation.isPending ? "Saving..." : "Save Workout"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setLapTimes([]);
                      setCurrentLapInput("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>
          <div className="space-y-4">
            {instances?.map((item) => {
              const inst = item.instance;
              const tmpl = item.template;
              if (!tmpl) return null;

              return (
                <Card key={inst.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{tmpl.name}</span>
                      {inst.completed && (
                        <span className="text-xs font-normal px-2 py-1 bg-green-500/10 text-green-600 rounded">
                          Completed
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {formatDate(inst.completedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tmpl.type === "run" && (
                      <div>
                        <p>Distance: {tmpl.distance} miles</p>
                        {inst.duration && <p>Time: {formatDuration(inst.duration)}</p>}
                        {inst.lapTimes && (
                          <p className="text-sm text-muted-foreground">
                            Laps: {(inst.lapTimes as number[]).length}
                          </p>
                        )}
                      </div>
                    )}
                    {tmpl.type === "reps" && (
                      <div>
                        <p>Reps: {inst.actualReps || 0} / {tmpl.targetReps}</p>
                      </div>
                    )}
                    {tmpl.type === "time" && (
                      <div>
                        <p>
                          Duration: {formatDuration(inst.actualDuration || 0)} /{" "}
                          {formatDuration(tmpl.targetDuration || 0)}
                        </p>
                      </div>
                    )}
                    {inst.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">{inst.notes}</p>
                    )}
                    {!inst.completed && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          markCompleteMutation.mutate({
                            id: inst.id,
                            userId: session?.user.id || "",
                          });
                        }}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {instances && instances.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No workouts yet</CardTitle>
                <CardDescription>
                  Start recording your workouts above!
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
