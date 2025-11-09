import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { workoutInstances, workoutTemplates } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const createInstanceSchema = z.object({
  templateId: z.string(),
  userId: z.string(),
  completed: z.boolean().default(false),
  completedAt: z.string().datetime().optional(),
  duration: z.number().positive().int().optional(), // in seconds
  lapTimes: z.array(z.number().positive()).optional(),
  actualReps: z.number().positive().int().optional(),
  actualDuration: z.number().positive().int().optional(), // in seconds
  notes: z.string().optional(),
});

const updateInstanceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  completed: z.boolean().optional(),
  completedAt: z.string().datetime().optional(),
  duration: z.number().positive().int().optional(),
  lapTimes: z.array(z.number().positive()).optional(),
  actualReps: z.number().positive().int().optional(),
  actualDuration: z.number().positive().int().optional(),
  notes: z.string().optional(),
});

export const workoutInstancesRouter = router({
  // Get all instances for a user
  getAll: publicProcedure
    .input(z.object({ userId: z.string(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const instances = await ctx.db
        .select({
          instance: workoutInstances,
          template: workoutTemplates,
        })
        .from(workoutInstances)
        .leftJoin(
          workoutTemplates,
          eq(workoutInstances.templateId, workoutTemplates.id)
        )
        .where(eq(workoutInstances.userId, input.userId))
        .orderBy(desc(workoutInstances.createdAt))
        .limit(input.limit);

      return instances;
    }),

  // Get instances for a specific template
  getByTemplate: publicProcedure
    .input(z.object({ templateId: z.string(), userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(workoutInstances)
        .where(
          and(
            eq(workoutInstances.templateId, input.templateId),
            eq(workoutInstances.userId, input.userId)
          )
        )
        .orderBy(desc(workoutInstances.createdAt));
    }),

  // Get a specific instance
  getById: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [instance] = await ctx.db
        .select({
          instance: workoutInstances,
          template: workoutTemplates,
        })
        .from(workoutInstances)
        .leftJoin(
          workoutTemplates,
          eq(workoutInstances.templateId, workoutTemplates.id)
        )
        .where(
          and(
            eq(workoutInstances.id, input.id),
            eq(workoutInstances.userId, input.userId)
          )
        );

      return instance;
    }),

  // Create a new workout instance
  create: publicProcedure
    .input(createInstanceSchema)
    .mutation(async ({ ctx, input }) => {
      const id = randomUUID();
      const [instance] = await ctx.db
        .insert(workoutInstances)
        .values({
          id,
          templateId: input.templateId,
          userId: input.userId,
          completed: input.completed,
          completedAt: input.completedAt ? new Date(input.completedAt) : null,
          duration: input.duration,
          lapTimes: input.lapTimes ? JSON.stringify(input.lapTimes) : null,
          actualReps: input.actualReps,
          actualDuration: input.actualDuration,
          notes: input.notes,
        })
        .returning();

      return instance;
    }),

  // Update an instance
  update: publicProcedure
    .input(updateInstanceSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, userId, ...updates } = input;

      const updateData: Record<string, unknown> = {};
      if (updates.completed !== undefined) updateData.completed = updates.completed;
      if (updates.completedAt) updateData.completedAt = new Date(updates.completedAt);
      if (updates.duration !== undefined) updateData.duration = updates.duration;
      if (updates.lapTimes) updateData.lapTimes = JSON.stringify(updates.lapTimes);
      if (updates.actualReps !== undefined) updateData.actualReps = updates.actualReps;
      if (updates.actualDuration !== undefined) updateData.actualDuration = updates.actualDuration;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const [instance] = await ctx.db
        .update(workoutInstances)
        .set(updateData)
        .where(
          and(
            eq(workoutInstances.id, id),
            eq(workoutInstances.userId, userId)
          )
        )
        .returning();

      return instance;
    }),

  // Mark an instance as complete
  markComplete: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [instance] = await ctx.db
        .update(workoutInstances)
        .set({
          completed: true,
          completedAt: new Date(),
        })
        .where(
          and(
            eq(workoutInstances.id, input.id),
            eq(workoutInstances.userId, input.userId)
          )
        )
        .returning();

      return instance;
    }),

  // Delete an instance
  delete: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(workoutInstances)
        .where(
          and(
            eq(workoutInstances.id, input.id),
            eq(workoutInstances.userId, input.userId)
          )
        );

      return { success: true };
    }),
});
