import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "@/lib/auth";
import { useTRPC } from "@/lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const Route = createFileRoute("/_authenticated/templates")({
  component: TemplatesPage,
});

type WorkoutType = "run" | "reps" | "time";

function TemplatesPage() {
  const { data: session } = useSession();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const templatesQueryOptions = trpc.workoutTemplates.getAll.queryOptions({
    userId: session?.user.id || "",
  });
  const { data: templates } = useQuery(templatesQueryOptions);

  const createMutationOptions = trpc.workoutTemplates.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.workoutTemplates.getAll.queryKey(),
      });
      setShowCreateForm(false);
      setWorkoutType(null);
    },
  });
  const createMutation = useMutation(createMutationOptions);

  const deleteMutationOptions = trpc.workoutTemplates.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.workoutTemplates.getAll.queryKey(),
      });
    },
  });
  const deleteMutation = useMutation(deleteMutationOptions);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user.id || !workoutType) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const baseData = {
      userId: session.user.id,
      name,
      description: description || undefined,
      type: workoutType,
    };

    if (workoutType === "run") {
      const distance = parseFloat(formData.get("distance") as string);
      createMutation.mutate({ ...baseData, distance });
    } else if (workoutType === "reps") {
      const targetReps = parseInt(formData.get("targetReps") as string);
      createMutation.mutate({ ...baseData, targetReps });
    } else if (workoutType === "time") {
      const targetDuration = parseInt(formData.get("targetDuration") as string);
      createMutation.mutate({ ...baseData, targetDuration });
    }
  };

  const getTemplateDetails = (template: typeof templates[0]) => {
    if (template.type === "run" && template.distance) {
      return `${template.distance} miles`;
    } else if (template.type === "reps" && template.targetReps) {
      return `${template.targetReps} reps`;
    } else if (template.type === "time" && template.targetDuration) {
      return `${Math.floor(template.targetDuration / 60)}m ${template.targetDuration % 60}s`;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold">Workout Templates</h1>
        </div>
      </header>
      <main className="container mx-auto p-4">
        {!showCreateForm && (
          <div className="mb-4">
            <Button onClick={() => setShowCreateForm(true)}>
              Create New Template
            </Button>
          </div>
        )}

        {showCreateForm && !workoutType && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Choose Workout Type</CardTitle>
              <CardDescription>
                Select the type of workout you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button onClick={() => setWorkoutType("run")}>Run</Button>
              <Button onClick={() => setWorkoutType("reps")}>
                Reps (Push-ups, Sit-ups, etc.)
              </Button>
              <Button onClick={() => setWorkoutType("time")}>
                Time-based (Planks, etc.)
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}

        {showCreateForm && workoutType && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                Create {workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Workout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Workout Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g., Morning Run, 100 Push-ups"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Add notes about this workout"
                  />
                </div>

                {workoutType === "run" && (
                  <div>
                    <Label htmlFor="distance">Distance (miles)</Label>
                    <Input
                      id="distance"
                      name="distance"
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g., 3.1"
                    />
                  </div>
                )}

                {workoutType === "reps" && (
                  <div>
                    <Label htmlFor="targetReps">Target Reps</Label>
                    <Input
                      id="targetReps"
                      name="targetReps"
                      type="number"
                      required
                      placeholder="e.g., 50"
                    />
                  </div>
                )}

                {workoutType === "time" && (
                  <div>
                    <Label htmlFor="targetDuration">Target Duration (seconds)</Label>
                    <Input
                      id="targetDuration"
                      name="targetDuration"
                      type="number"
                      required
                      placeholder="e.g., 60"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Template"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setWorkoutType(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates?.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{template.name}</span>
                  <span className="text-xs font-normal px-2 py-1 bg-primary/10 rounded">
                    {template.type}
                  </span>
                </CardTitle>
                <CardDescription>
                  {getTemplateDetails(template)}
                  {template.description && (
                    <div className="mt-2">{template.description}</div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    // TODO: Navigate to workout recording page
                    console.log("Start workout:", template.id);
                  }}
                >
                  Start Workout
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this template?")) {
                      deleteMutation.mutate({
                        id: template.id,
                        userId: session?.user.id || "",
                      });
                    }
                  }}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates && templates.length === 0 && !showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>No templates yet</CardTitle>
              <CardDescription>
                Create your first workout template to get started!
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
