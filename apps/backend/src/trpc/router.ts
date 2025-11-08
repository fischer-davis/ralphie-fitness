import { router } from './trpc';
import { healthRouter } from './routers/health';
import { workoutsRouter } from './routers/workouts';

export const appRouter = router({
  health: healthRouter,
  workouts: workoutsRouter,
});

export type AppRouter = typeof appRouter;
