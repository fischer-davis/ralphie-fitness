import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { workoutInstances, workoutTemplates } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const statsRouter = router({
  // Get overall stats for a user
  getOverallStats: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get total completed workouts
      const [totalWorkouts] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(workoutInstances)
        .where(
          and(
            eq(workoutInstances.userId, input.userId),
            eq(workoutInstances.completed, true)
          )
        );

      return {
        totalCompletedWorkouts: totalWorkouts.count,
      };
    }),

  // Get run-specific stats
  getRunStats: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const runInstances = await ctx.db
        .select({
          distance: workoutTemplates.distance,
          duration: workoutInstances.duration,
          completedAt: workoutInstances.completedAt,
        })
        .from(workoutInstances)
        .innerJoin(
          workoutTemplates,
          eq(workoutInstances.templateId, workoutTemplates.id)
        )
        .where(
          and(
            eq(workoutInstances.userId, input.userId),
            eq(workoutTemplates.type, 'run'),
            eq(workoutInstances.completed, true)
          )
        );

      // Calculate stats
      const totalMiles = runInstances.reduce((sum, run) => sum + (run.distance || 0), 0);
      const totalRuns = runInstances.length;
      const durations = runInstances.filter((r) => r.duration).map((r) => r.duration as number);
      const avgDuration =
        durations.length > 0
          ? durations.reduce((sum, d) => sum + d, 0) / durations.length
          : 0;

      // Get data points for chart (last 30 runs)
      const chartData = runInstances
        .slice(0, 30)
        .reverse()
        .map((run) => ({
          date: run.completedAt?.toISOString() || '',
          duration: run.duration || 0,
          distance: run.distance || 0,
        }));

      return {
        totalMiles,
        totalRuns,
        avgDuration, // in seconds
        chartData,
      };
    }),

  // Get rep-based workout stats (push-ups, sit-ups, squats)
  getRepStats: publicProcedure
    .input(z.object({ userId: z.string(), templateId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(workoutInstances.userId, input.userId),
        eq(workoutTemplates.type, 'reps'),
        eq(workoutInstances.completed, true),
      ];

      if (input.templateId) {
        conditions.push(eq(workoutInstances.templateId, input.templateId));
      }

      const repInstances = await ctx.db
        .select({
          templateName: workoutTemplates.name,
          actualReps: workoutInstances.actualReps,
          targetReps: workoutTemplates.targetReps,
          completedAt: workoutInstances.completedAt,
        })
        .from(workoutInstances)
        .innerJoin(
          workoutTemplates,
          eq(workoutInstances.templateId, workoutTemplates.id)
        )
        .where(and(...conditions));

      const totalReps = repInstances.reduce((sum, rep) => sum + (rep.actualReps || 0), 0);
      const totalWorkouts = repInstances.length;
      const avgReps = totalWorkouts > 0 ? totalReps / totalWorkouts : 0;

      // Get chart data
      const chartData = repInstances
        .slice(0, 30)
        .reverse()
        .map((rep) => ({
          date: rep.completedAt?.toISOString() || '',
          reps: rep.actualReps || 0,
          target: rep.targetReps || 0,
        }));

      return {
        totalReps,
        totalWorkouts,
        avgReps,
        chartData,
      };
    }),

  // Get time-based workout stats (planks, etc.)
  getTimeStats: publicProcedure
    .input(z.object({ userId: z.string(), templateId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(workoutInstances.userId, input.userId),
        eq(workoutTemplates.type, 'time'),
        eq(workoutInstances.completed, true),
      ];

      if (input.templateId) {
        conditions.push(eq(workoutInstances.templateId, input.templateId));
      }

      const timeInstances = await ctx.db
        .select({
          templateName: workoutTemplates.name,
          actualDuration: workoutInstances.actualDuration,
          targetDuration: workoutTemplates.targetDuration,
          completedAt: workoutInstances.completedAt,
        })
        .from(workoutInstances)
        .innerJoin(
          workoutTemplates,
          eq(workoutInstances.templateId, workoutTemplates.id)
        )
        .where(and(...conditions));

      const durations = timeInstances.filter((t) => t.actualDuration).map((t) => t.actualDuration as number);
      const totalDuration = durations.reduce((sum, d) => sum + d, 0);
      const totalWorkouts = timeInstances.length;
      const avgDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

      // Get chart data
      const chartData = timeInstances
        .slice(0, 30)
        .reverse()
        .map((time) => ({
          date: time.completedAt?.toISOString() || '',
          duration: time.actualDuration || 0,
          target: time.targetDuration || 0,
        }));

      return {
        totalDuration, // in seconds
        totalWorkouts,
        avgDuration, // in seconds
        chartData,
      };
    }),

  // Get recent workout activity
  getRecentActivity: publicProcedure
    .input(z.object({ userId: z.string(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const recentActivity = await ctx.db
        .select({
          instanceId: workoutInstances.id,
          templateName: workoutTemplates.name,
          workoutType: workoutTemplates.type,
          completed: workoutInstances.completed,
          completedAt: workoutInstances.completedAt,
          duration: workoutInstances.duration,
          actualReps: workoutInstances.actualReps,
          actualDuration: workoutInstances.actualDuration,
        })
        .from(workoutInstances)
        .innerJoin(
          workoutTemplates,
          eq(workoutInstances.templateId, workoutTemplates.id)
        )
        .where(eq(workoutInstances.userId, input.userId))
        .orderBy(sql`${workoutInstances.createdAt} DESC`)
        .limit(input.limit);

      return recentActivity;
    }),
});
