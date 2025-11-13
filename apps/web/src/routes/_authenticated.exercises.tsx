import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dumbbell, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/exercises")({
  component: ExercisesPage,
});

interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

// Sample exercise data - in a real app, this would come from the backend
const sampleExercises: Exercise[] = [
  {
    id: "1",
    name: "Push-ups",
    category: "Bodyweight",
    description: "A classic upper body exercise that targets chest, shoulders, and triceps.",
    muscleGroups: ["Chest", "Shoulders", "Triceps", "Core"],
    equipment: [],
    difficulty: "beginner",
  },
  {
    id: "2",
    name: "Squats",
    category: "Bodyweight",
    description: "A fundamental lower body exercise that builds leg and core strength.",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
    equipment: [],
    difficulty: "beginner",
  },
  {
    id: "3",
    name: "Pull-ups",
    category: "Bodyweight",
    description: "An effective back and bicep exercise performed on a horizontal bar.",
    muscleGroups: ["Back", "Biceps", "Forearms"],
    equipment: ["Pull-up Bar"],
    difficulty: "intermediate",
  },
  {
    id: "4",
    name: "Plank",
    category: "Core",
    description: "An isometric core exercise that builds endurance and stability.",
    muscleGroups: ["Core", "Shoulders", "Glutes"],
    equipment: [],
    difficulty: "beginner",
  },
  {
    id: "5",
    name: "Bench Press",
    category: "Strength",
    description: "A classic chest exercise performed with a barbell or dumbbells.",
    muscleGroups: ["Chest", "Shoulders", "Triceps"],
    equipment: ["Barbell", "Bench"],
    difficulty: "intermediate",
  },
  {
    id: "6",
    name: "Deadlift",
    category: "Strength",
    description: "A compound exercise that targets multiple muscle groups.",
    muscleGroups: ["Back", "Glutes", "Hamstrings", "Core"],
    equipment: ["Barbell"],
    difficulty: "advanced",
  },
  {
    id: "7",
    name: "Lunges",
    category: "Bodyweight",
    description: "A unilateral leg exercise that improves balance and leg strength.",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: [],
    difficulty: "beginner",
  },
  {
    id: "8",
    name: "Running",
    category: "Cardio",
    description: "A cardiovascular exercise that improves endurance and burns calories.",
    muscleGroups: ["Legs", "Core", "Cardiovascular"],
    equipment: [],
    difficulty: "beginner",
  },
];

const categories = ["All", "Bodyweight", "Strength", "Cardio", "Core"];
const difficulties = ["All", "beginner", "intermediate", "advanced"];

function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const filteredExercises = sampleExercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || exercise.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "All" || exercise.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-600";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-600";
      case "advanced":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Exercise Library</h1>
          <p className="text-muted-foreground">
            Browse and learn about different exercises to add to your workouts
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <div className="flex gap-2">
                {difficulties.map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty(difficulty)}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Dumbbell className="h-8 w-8 text-primary" />
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(
                      exercise.difficulty
                    )}`}
                  >
                    {exercise.difficulty}
                  </span>
                </div>
                <CardTitle>{exercise.name}</CardTitle>
                <CardDescription className="text-xs">
                  {exercise.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {exercise.description}
                </p>

                <div>
                  <h4 className="text-xs font-medium mb-1">Muscle Groups</h4>
                  <div className="flex flex-wrap gap-1">
                    {exercise.muscleGroups.map((muscle) => (
                      <span
                        key={muscle}
                        className="text-xs px-2 py-1 bg-secondary rounded"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                {exercise.equipment.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium mb-1">Equipment</h4>
                    <div className="flex flex-wrap gap-1">
                      {exercise.equipment.map((item) => (
                        <span
                          key={item}
                          className="text-xs px-2 py-1 bg-primary/10 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No exercises found</CardTitle>
              <CardDescription>
                Try adjusting your search or filters
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
