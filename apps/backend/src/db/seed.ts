import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { seed } from 'drizzle-seed';
import * as schema from './schema';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
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

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Clearing existing data...');
  await db.delete(schema.workoutInstances);
  await db.delete(schema.workoutTemplates);
  await db.delete(schema.workouts);
  await db.delete(schema.session);
  await db.delete(schema.account);
  await db.delete(schema.verification);
  await db.delete(schema.user);

  // Create test user
  console.log('👤 Creating test user...');
  const userId = randomUUID();
  const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);

  await db.insert(schema.user).values({
    id: userId,
    name: 'Test User',
    email: TEST_USER_EMAIL,
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create account with password for test user
  await db.insert(schema.account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: 'credential',
    userId: userId,
    password: hashedPassword,
    accessToken: null,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    scope: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Test user created successfully!');
  console.log('📧 Email: test@ralphie.fitness');
  console.log('🔑 Password: TestPassword123!');

  // Create workout templates
  console.log('🏋️ Creating workout templates...');

  // Run workout templates
  const runTemplates = [
    { name: '5K Run', distance: 3.1, description: 'Standard 5 kilometer run' },
    { name: '10K Run', distance: 6.2, description: 'Standard 10 kilometer run' },
    { name: 'Half Marathon', distance: 13.1, description: 'Half marathon distance' },
    { name: 'Easy 2 Mile', distance: 2.0, description: 'Easy recovery run' },
    { name: 'Sprint Mile', distance: 1.0, description: 'Fast mile sprint' },
  ];

  const runTemplateIds: string[] = [];
  for (const template of runTemplates) {
    const templateId = randomUUID();
    runTemplateIds.push(templateId);
    await db.insert(schema.workoutTemplates).values({
      id: templateId,
      userId: userId,
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

  // Reps workout templates
  const repsTemplates = [
    { name: 'Push-ups', targetReps: 50, description: 'Standard push-ups' },
    { name: 'Sit-ups', targetReps: 100, description: 'Standard sit-ups' },
    { name: 'Squats', targetReps: 75, description: 'Bodyweight squats' },
    { name: 'Pull-ups', targetReps: 20, description: 'Dead hang pull-ups' },
    { name: 'Burpees', targetReps: 30, description: 'Full burpees' },
    { name: 'Lunges', targetReps: 40, description: 'Walking lunges (per leg)' },
  ];

  const repsTemplateIds: string[] = [];
  for (const template of repsTemplates) {
    const templateId = randomUUID();
    repsTemplateIds.push(templateId);
    await db.insert(schema.workoutTemplates).values({
      id: templateId,
      userId: userId,
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

  // Time workout templates
  const timeTemplates = [
    { name: 'Plank', targetDuration: 120, description: 'Standard plank hold' },
    { name: 'Wall Sit', targetDuration: 90, description: 'Isometric wall sit' },
    { name: 'Side Plank (Left)', targetDuration: 60, description: 'Left side plank' },
    { name: 'Side Plank (Right)', targetDuration: 60, description: 'Right side plank' },
    { name: 'Dead Hang', targetDuration: 45, description: 'Dead hang from bar' },
  ];

  const timeTemplateIds: string[] = [];
  for (const template of timeTemplates) {
    const templateId = randomUUID();
    timeTemplateIds.push(templateId);
    await db.insert(schema.workoutTemplates).values({
      id: templateId,
      userId: userId,
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

  console.log(`✅ Created ${runTemplates.length + repsTemplates.length + timeTemplates.length} workout templates`);

  // Create workout instances (completed workouts over the past 6 months)
  console.log('📊 Creating workout instances...');

  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const workoutInstanceCount = 120;

  for (let i = 0; i < workoutInstanceCount; i++) {
    // Random date in the past 6 months
    const randomDate = new Date(
      sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime())
    );

    // 85% chance of completion
    const isCompleted = Math.random() < 0.85;

    // Randomly select a template type
    const templateType = Math.random() < 0.33 ? 'run' : Math.random() < 0.5 ? 'reps' : 'time';

    let templateId: string;
    let duration: number | null = null;
    let lapTimes: number[] | null = null;
    let actualReps: number | null = null;
    let actualDuration: number | null = null;

    if (templateType === 'run') {
      templateId = runTemplateIds[Math.floor(Math.random() * runTemplateIds.length)];
      // Duration for runs: 5-15 minutes per mile
      const miles = runTemplates.find((t, idx) => runTemplateIds[idx] === templateId)?.distance || 3;
      duration = Math.floor(miles * (300 + Math.random() * 600)); // 5-15 min per mile in seconds

      // Generate lap times (roughly equal splits)
      const numLaps = Math.floor(miles);
      if (numLaps > 0) {
        lapTimes = Array.from({ length: numLaps }, () =>
          Math.floor(duration! / numLaps + (Math.random() - 0.5) * 60)
        );
      }
    } else if (templateType === 'reps') {
      templateId = repsTemplateIds[Math.floor(Math.random() * repsTemplateIds.length)];
      const targetReps = repsTemplates.find((t, idx) => repsTemplateIds[idx] === templateId)?.targetReps || 50;
      // Actual reps: 70-110% of target
      actualReps = Math.floor(targetReps * (0.7 + Math.random() * 0.4));
    } else {
      templateId = timeTemplateIds[Math.floor(Math.random() * timeTemplateIds.length)];
      const targetDuration = timeTemplates.find((t, idx) => timeTemplateIds[idx] === templateId)?.targetDuration || 60;
      // Actual duration: 60-120% of target
      actualDuration = Math.floor(targetDuration * (0.6 + Math.random() * 0.6));
    }

    const notes = Math.random() < 0.3 ? [
      'Felt great!',
      'Struggled a bit today',
      'New personal record!',
      'Weather was perfect',
      'Need to improve form',
      'Solid workout',
    ][Math.floor(Math.random() * 6)] : null;

    await db.insert(schema.workoutInstances).values({
      id: randomUUID(),
      templateId,
      userId,
      completed: isCompleted,
      completedAt: isCompleted ? randomDate : null,
      duration,
      lapTimes: lapTimes ? lapTimes : undefined,
      actualReps,
      actualDuration,
      notes,
      createdAt: randomDate,
      updatedAt: randomDate,
    });
  }

  console.log(`✅ Created ${workoutInstanceCount} workout instances`);

  // Create legacy workouts for backward compatibility
  console.log('🔄 Creating legacy workouts...');

  const legacyWorkoutCount = 30;
  for (let i = 0; i < legacyWorkoutCount; i++) {
    const randomDate = new Date(
      sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime())
    );

    const workoutTypes = [
      { name: 'Yoga Session', duration: 45, calories: 200 },
      { name: 'Cycling', duration: 60, calories: 400 },
      { name: 'Swimming', duration: 30, calories: 300 },
      { name: 'Weight Training', duration: 50, calories: 250 },
      { name: 'HIIT Cardio', duration: 25, calories: 350 },
    ];

    const workout = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];

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

  console.log(`✅ Created ${legacyWorkoutCount} legacy workouts`);

  // Use drizzle-seed to add some random users
  console.log('👥 Adding random users with drizzle-seed...');

  await seed(db, schema, { count: 10 }).refine((funcs) => ({
    user: {
      columns: {
        id: funcs.uuid(),
        name: funcs.fullName(),
        email: funcs.email(),
        emailVerified: funcs.boolean(),
        image: funcs.url(),
      },
    },
  }));

  console.log('✅ Added 10 random users');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test User Credentials:');
  console.log('   Email: test@ralphie.fitness');
  console.log('   Password: TestPassword123!');
  console.log('\nYou can now login with these credentials in the application.');

  await client.end();
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
