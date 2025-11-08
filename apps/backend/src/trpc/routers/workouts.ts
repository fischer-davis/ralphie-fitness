import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { workouts } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const workoutsRouter = router({
  getAll: publicProcedure
    .input(z.object({ userId: z.string().uuid() }).optional())
    .query(async ({ ctx, input }) => {
      if (input?.userId) {
        return await ctx.db.select().from(workouts).where(eq(workouts.userId, input.userId));
      }
      return await ctx.db.select().from(workouts);
    }),

  create: publicProcedure
    .input(z.object({
      userId: z.string().uuid(),
      name: z.string().min(1),
      description: z.string().optional(),
      duration: z.number().optional(),
      caloriesBurned: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [workout] = await ctx.db.insert(workouts).values({
        userId: input.userId,
        name: input.name,
        description: input.description,
        duration: input.duration,
        caloriesBurned: input.caloriesBurned,
      }).returning();

      return workout;
    }),
});
