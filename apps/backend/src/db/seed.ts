import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { seed } from 'drizzle-seed';
import * as schema from './schema';
import { randomUUID } from 'crypto';
import { hashPassword } from 'better-auth/crypto';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ralphie_fitness';

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance
const db = drizzle(client, { schema });

/**
 * Test User Credentials:
 * Email: test@ralphie.fitness
 * Password: TestPassword123!
 */
const TEST_USER_EMAIL = 'test@ralphie.fitness';
const TEST_USER_PASSWORD = 'TestPassword123!';
// Keep the same password for every seeded user so you can log in as any of them
const SEEDED_USER_PASSWORD = TEST_USER_PASSWORD;

const runTemplates = [
  { name: '5K Run', distance: 3.1, description: 'Standard 5 kilometer run' },
  { name: '10K Run', distance: 6.2, description: 'Standard 10 kilometer run' },
  { name: 'Half Marathon', distance: 13.1, description: 'Half marathon distance' },
  { name: 'Easy 2 Mile', distance: 2.0, description: 'Easy recovery run' },
  { name: 'Sprint Mile', distance: 1.0, description: 'Fast mile sprint' },
  { name: 'Tempo 4 Mile', distance: 4.0, description: 'Steady tempo pace' },
];

const repsTemplates = [
  { name: 'Push-ups', targetReps: 50, description: 'Standard push-ups' },
  { name: 'Sit-ups', targetReps: 100, description: 'Standard sit-ups' },
  { name: 'Squats', targetReps: 75, description: 'Bodyweight squats' },
  { name: 'Pull-ups', targetReps: 20, description: 'Dead hang pull-ups' },
  { name: 'Burpees', targetReps: 30, description: 'Full burpees' },
  { name: 'Lunges', targetReps: 40, description: 'Walking lunges (per leg)' },
  { name: 'Kettlebell Swings', targetReps: 60, description: 'Explosive hip hinge' },
];

const timeTemplates = [
  { name: 'Plank', targetDuration: 120, description: 'Standard plank hold' },
  { name: 'Wall Sit', targetDuration: 90, description: 'Isometric wall sit' },
  { name: 'Side Plank (Left)', targetDuration: 60, description: 'Left side plank' },
  { name: 'Side Plank (Right)', targetDuration: 60, description: 'Right side plank' },
  { name: 'Dead Hang', targetDuration: 45, description: 'Dead hang from bar' },
  { name: 'Farmer Carry', targetDuration: 180, description: 'Loaded carry endurance' },
];

const workoutNotes = [
  'Felt great!',
  'Struggled a bit today',
  'New personal record!',
  'Weather was perfect',
  'Need to improve form',
  'Solid workout',
  'Focused on breathing',
  'Tried a new warmup',
];

const WORKOUT_INSTANCES_PER_USER = 150;
const LEGACY_WORKOUTS_PER_USER = 40;
const RANDOM_USER_COUNT = 10;

type UserTemplateSet = {
  run: Array<{ id: string; definition: (typeof runTemplates)[number] }>;
  reps: Array<{ id: string; definition: (typeof repsTemplates)[number] }>;
  time: Array<{ id: string; definition: (typeof timeTemplates)[number] }>;
};

function randomDateInRange(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

async function createCredentialAccount(userId: string, passwordHash: string) {
  await db.insert(schema.account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: passwordHash,
    accessToken: null,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    scope: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function createWorkoutTemplatesForUser(userId: string): Promise<UserTemplateSet> {
  const run: UserTemplateSet['run'] = [];
  for (const template of runTemplates) {
    const id = randomUUID();
    run.push({ id, definition: template });
    await db.insert(schema.workoutTemplates).values({
      id,
      userId,
      name: template.name,
      type: 'run',
      description: template.description,
      distance: template.distance,
      targetReps: null,
      targetDuration: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const reps: UserTemplateSet['reps'] = [];
  for (const template of repsTemplates) {
    const id = randomUUID();
    reps.push({ id, definition: template });
    await db.insert(schema.workoutTemplates).values({
      id,
      userId,
      name: template.name,
      type: 'reps',
      description: template.description,
      distance: null,
      targetReps: template.targetReps,
      targetDuration: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const time: UserTemplateSet['time'] = [];
  for (const template of timeTemplates) {
    const id = randomUUID();
    time.push({ id, definition: template });
    await db.insert(schema.workoutTemplates).values({
      id,
      userId,
      name: template.name,
      type: 'time',
      description: template.description,
      distance: null,
      targetReps: null,
      targetDuration: template.targetDuration,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return { run, reps, time };
}

async function createWorkoutInstancesForUser(
  userId: string,
  templates: UserTemplateSet,
  now: Date,
  sixMonthsAgo: Date
) {
  for (let i = 0; i < WORKOUT_INSTANCES_PER_USER; i++) {
    const randomDate = randomDateInRange(sixMonthsAgo, now);
    const templateTypeRoll = Math.random();

    let templateId: string;
    let duration: number | null = null;
    let lapTimes: number[] | null = null;
    let actualReps: number | null = null;
    let actualDuration: number | null = null;

    if (templateTypeRoll < 0.33 && templates.run.length) {
      const template = pickRandom(templates.run);
      templateId = template.id;
      const miles = template.definition.distance || 3;
      duration = Math.floor(miles * (300 + Math.random() * 600)); // 5-15 min per mile in seconds
      const numLaps = Math.max(1, Math.round(miles));
      lapTimes = Array.from({ length: numLaps }, () =>
        Math.floor(duration / numLaps + (Math.random() - 0.5) * 60)
      );
    } else if (templateTypeRoll < 0.66 && templates.reps.length) {
      const template = pickRandom(templates.reps);
      templateId = template.id;
      const targetReps = template.definition.targetReps || 50;
      actualReps = Math.floor(targetReps * (0.7 + Math.random() * 0.4)); // 70-110%
    } else {
      const template = pickRandom(templates.time);
      templateId = template.id;
      const targetDuration = template.definition.targetDuration || 60;
      actualDuration = Math.floor(targetDuration * (0.6 + Math.random() * 0.6)); // 60-120%
    }

    const notes = Math.random() < 0.3 ? pickRandom(workoutNotes) : null;

    await db.insert(schema.workoutInstances).values({
      id: randomUUID(),
      templateId,
      userId,
      completed: true,
      completedAt: randomDate,
      duration,
      lapTimes: lapTimes || undefined,
      actualReps,
      actualDuration,
      notes,
      createdAt: randomDate,
      updatedAt: randomDate,
    });
  }
}

async function createLegacyWorkoutsForUser(userId: string, now: Date, sixMonthsAgo: Date) {
  const workoutTypes = [
    { name: 'Yoga Session', duration: 45, calories: 200 },
    { name: 'Cycling', duration: 60, calories: 400 },
    { name: 'Swimming', duration: 30, calories: 300 },
    { name: 'Weight Training', duration: 50, calories: 250 },
    { name: 'HIIT Cardio', duration: 25, calories: 350 },
    { name: 'Rowing', duration: 35, calories: 320 },
    { name: 'Stair Climb', duration: 20, calories: 220 },
  ];

  for (let i = 0; i < LEGACY_WORKOUTS_PER_USER; i++) {
    const randomDate = randomDateInRange(sixMonthsAgo, now);
    const workout = pickRandom(workoutTypes);

    await db.insert(schema.workouts).values({
      id: randomUUID(),
      userId,
      name: workout.name,
      description: `Completed ${workout.name.toLowerCase()}`,
      duration: workout.duration,
      caloriesBurned: workout.calories + Math.floor((Math.random() - 0.5) * 100),
      completedAt: randomDate,
      createdAt: randomDate,
      updatedAt: randomDate,
    });
  }
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Clearing existing data...');
  try {
    await db.delete(schema.workoutInstances);
    await db.delete(schema.workoutTemplates);
    await db.delete(schema.workouts);
    await db.delete(schema.session);
    await db.delete(schema.account);
    await db.delete(schema.verification);
    await db.delete(schema.user);
  } catch (error) {
    console.log('⚠️  Some tables may not exist yet, will create fresh data...');
  }

  // Create test user
  console.log('👤 Creating test user...');
  const testUserId = randomUUID();
  const testUserPasswordHash = await hashPassword(TEST_USER_PASSWORD);
  const seededUserPasswordHash =
    SEEDED_USER_PASSWORD === TEST_USER_PASSWORD
      ? testUserPasswordHash
      : await hashPassword(SEEDED_USER_PASSWORD);

  try {
    await db.insert(schema.user).values({
      id: testUserId,
      name: 'Test User',
      email: TEST_USER_EMAIL,
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error: any) {
    if (error.code === '42P01') {
      console.error('\n❌ ERROR: Database tables do not exist!');
      console.error('Please run the following command first to create the database schema:');
      console.error('  npm run db:push');
      console.error('\nOr if you have migrations:');
      console.error('  npm run db:migrate\n');
      await client.end();
      process.exit(1);
    }
    throw error;
  }

  // Use drizzle-seed to add some random users
  console.log(`👥 Adding ${RANDOM_USER_COUNT} random users with drizzle-seed...`);

  await seed(db as any, schema, { count: RANDOM_USER_COUNT }).refine((funcs) => ({
    user: {
      columns: {
        id: funcs.uuid(),
        name: funcs.fullName(),
        email: funcs.email(),
        emailVerified: funcs.boolean(),
        image: funcs.default({ defaultValue: null }),
      },
    },
  }));

  const users = await db.select().from(schema.user);
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  let totalTemplates = 0;
  let totalInstances = 0;
  let totalLegacyWorkouts = 0;

  console.log(`📊 Creating accounts and workout data for ${users.length} users...`);

  for (const user of users) {
    const isTestUser = user.email === TEST_USER_EMAIL;
    const passwordHash = isTestUser ? testUserPasswordHash : seededUserPasswordHash;

    await createCredentialAccount(user.id, passwordHash);
    const templates = await createWorkoutTemplatesForUser(user.id);
    totalTemplates += templates.run.length + templates.reps.length + templates.time.length;

    await createWorkoutInstancesForUser(user.id, templates, now, sixMonthsAgo);
    totalInstances += WORKOUT_INSTANCES_PER_USER;

    await createLegacyWorkoutsForUser(user.id, now, sixMonthsAgo);
    totalLegacyWorkouts += LEGACY_WORKOUTS_PER_USER;
  }

  console.log(`✅ Added ${totalTemplates} workout templates (${users.length} users)`);
  console.log(`✅ Added ${totalInstances} workout instances (${WORKOUT_INSTANCES_PER_USER} per user)`);
  console.log(`✅ Added ${totalLegacyWorkouts} legacy workouts (${LEGACY_WORKOUTS_PER_USER} per user)`);
  console.log(`✅ Added ${RANDOM_USER_COUNT} random users`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test User Credentials:');
  console.log('   Email: test@ralphie.fitness');
  console.log('   Password: TestPassword123!');
  console.log(`\n💡 All seeded users share the same password for convenience: ${SEEDED_USER_PASSWORD}`);
  console.log('\nYou can now login with any of these credentials in the application.');

  await client.end();
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
