import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { workoutTemplates } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const workoutTypeSchema = z.enum(['run', 'reps', 'time']);

const createTemplateSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  type: workoutTypeSchema,
  description: z.string().optional(),
  distance: z.number().positive().optional(),
  targetReps: z.number().positive().int().optional(),
  targetDuration: z.number().positive().int().optional(),
});

const updateTemplateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  distance: z.number().positive().optional(),
  targetReps: z.number().positive().int().optional(),
  targetDuration: z.number().positive().int().optional(),
});

export const workoutTemplatesRouter = router({
  // Get all templates for a user
  getAll: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(workoutTemplates)
        .where(eq(workoutTemplates.userId, input.userId));
    }),

  // Get a specific template
  getById: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [template] = await ctx.db
        .select()
        .from(workoutTemplates)
        .where(
          and(
            eq(workoutTemplates.id, input.id),
            eq(workoutTemplates.userId, input.userId)
          )
        );
      return template;
    }),

  // Create a new template
  create: publicProcedure
    .input(createTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const id = randomUUID();
      const [template] = await ctx.db
        .insert(workoutTemplates)
        .values({
          id,
          userId: input.userId,
          name: input.name,
          type: input.type,
          description: input.description,
          distance: input.distance,
          targetReps: input.targetReps,
          targetDuration: input.targetDuration,
        })
        .returning();

      return template;
    }),

  // Update an existing template
  update: publicProcedure
    .input(updateTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, userId, ...updates } = input;

      const [template] = await ctx.db
        .update(workoutTemplates)
        .set(updates)
        .where(
          and(
            eq(workoutTemplates.id, id),
            eq(workoutTemplates.userId, userId)
          )
        )
        .returning();

      return template;
    }),

  // Delete a template
  delete: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(workoutTemplates)
        .where(
          and(
            eq(workoutTemplates.id, input.id),
            eq(workoutTemplates.userId, input.userId)
          )
        );

      return { success: true };
    }),
});
