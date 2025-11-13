import { pgTable, text, timestamp, boolean, integer, pgEnum, real, jsonb } from "drizzle-orm/pg-core";

// Better-auth generated schema
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Application-specific tables

// Workout type enum
export const workoutTypeEnum = pgEnum('workout_type', ['run', 'reps', 'time']);

// Workout templates - reusable workout definitions
export const workoutTemplates = pgTable('workout_templates', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: workoutTypeEnum('type').notNull(),
  description: text('description'),

  // Type-specific fields
  // For 'run' type
  distance: real('distance'), // in miles

  // For 'reps' type (push-ups, sit-ups, squats, etc.)
  targetReps: integer('target_reps'),

  // For 'time' type (planks, etc.)
  targetDuration: integer('target_duration'), // in seconds

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Workout instances - records of completed workouts
export const workoutInstances = pgTable('workout_instances', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull().references(() => workoutTemplates.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),

  // Completion tracking
  completed: boolean('completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),

  // Type-specific result fields
  // For 'run' type
  duration: integer('duration'), // in seconds
  lapTimes: jsonb('lap_times').$type<number[]>(), // array of lap times in seconds

  // For 'reps' type
  actualReps: integer('actual_reps'),

  // For 'time' type
  actualDuration: integer('actual_duration'), // in seconds

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Legacy workouts table (keeping for backward compatibility)
export const workouts = pgTable('workouts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  duration: integer('duration'), // in minutes
  caloriesBurned: integer('calories_burned'),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
