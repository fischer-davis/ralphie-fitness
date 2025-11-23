# Ralphie Fitness Backend

This is the backend API for Ralphie Fitness, built with Hono, tRPC, and Drizzle ORM.

## Database Seeding

The database can be seeded with test data using the `db:seed` command. This will populate the database with a test user and sample workout data.

### Running the Seed Script

```bash
npm run db:seed
```

This will:
- Clear all existing data
- Create a test user with login credentials
- Generate 16 workout templates (runs, reps, and time-based workouts)
- Create 120 workout instances with realistic data spanning 6 months
- Add 30 legacy workouts
- Add 10 random users

### Test User Credentials

You can login to the application with the following credentials:

**Email:** `test@ralphie.fitness`
**Password:** `TestPassword123!`

This test user has extensive workout history including:
- Multiple 5K, 10K, and half marathon runs
- Various strength training workouts (push-ups, sit-ups, squats, pull-ups, etc.)
- Time-based exercises (planks, wall sits, dead hangs)
- Legacy workout data for backward compatibility

### Database Scripts

- `npm run db:generate` - Generate migrations from schema
- `npm run db:migrate` - Run pending migrations
- `npm run db:push` - Push schema directly (dev only)
- `npm run db:studio` - Open Drizzle Studio GUI
- `npm run db:seed` - Seed database with test data

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env` file with the following variables:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ralphie_fitness
BETTER_AUTH_SECRET=your-secret-key-change-in-production
BETTER_AUTH_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
PORT=3001
```

## Authentication

Authentication is handled by better-auth with email/password support. The API routes are automatically mounted at `/api/auth/*`.

## API

The API uses tRPC for type-safe endpoints. All tRPC routes are available at `/trpc/*`.
