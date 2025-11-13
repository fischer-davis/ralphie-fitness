import { router } from './trpc';
import { healthRouter } from './routers/health';
import { workoutsRouter } from './routers/workouts';
import { workoutTemplatesRouter } from './routers/workoutTemplates';
import { workoutInstancesRouter } from './routers/workoutInstances';
import { statsRouter } from './routers/stats';

export const appRouter = router({
  health: healthRouter,
  workouts: workoutsRouter,
  workoutTemplates: workoutTemplatesRouter,
  workoutInstances: workoutInstancesRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
