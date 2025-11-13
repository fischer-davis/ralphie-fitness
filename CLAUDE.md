# Ralphie Fitness - Claude Development Guide

## Overview

Ralphie Fitness is a full-stack fitness tracking application built with modern web technologies. This monorepo uses Turborepo for workspace management and includes a React frontend and a Hono backend.

## Project Structure

```
ralphie-fitness/
├── apps/
│   ├── web/              # React + Vite frontend
│   └── backend/          # Hono + TypeScript backend
├── packages/
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
└── biome.json            # Ultracite/Biome configuration
```

## Tech Stack

### Frontend (`apps/web`)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (configured)
- **State Management**: TanStack Query (React Query)
- **API Client**: tRPC React Query
- **Authentication**: better-auth client
- **Type Safety**: TypeScript 5.5.4

### Backend (`apps/backend`)
- **Runtime**: Node.js with tsx for development
- **Framework**: Hono (lightweight web framework)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: better-auth
- **API**: tRPC for type-safe API
- **Type Safety**: TypeScript 5.7.2

### Development Tools
- **Linting/Formatting**: Ultracite (built on Biome)
- **Package Manager**: npm with workspaces
- **Monorepo Tool**: Turborepo

## Database Schema

The application includes the following tables:

- **users**: User accounts with email/password authentication
- **sessions**: Active user sessions
- **accounts**: OAuth provider accounts
- **verification_tokens**: Email verification tokens
- **workouts**: Fitness workout tracking (example feature)

## Getting Started

### Prerequisites
- Node.js 18+ (Node 22 recommended)
- PostgreSQL database
- npm package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

**Backend** (`apps/backend/.env`):
```bash
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your database credentials and secrets
```

**Frontend** (`apps/web/.env`):
```bash
cp apps/web/.env.example apps/web/.env
# Edit .env with your API URL
```

3. Set up the database:
```bash
# Navigate to backend
cd apps/backend

# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

4. Start development servers:
```bash
# From root directory
npm run dev

# Or start individually:
# Frontend (from root)
npm run dev --filter web

# Backend (from root)
npm run dev --filter backend
```

## Development Workflow

### Running Commands

```bash
# Run dev servers for all apps
npm run dev

# Build all apps
npm run build

# Lint/format code
npm run lint
npm run format

# Run linting check without fixing
npm run format:check
```

### Database Operations

```bash
# From apps/backend directory
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Run migrations
npm run db:push      # Push schema directly (dev only)
npm run db:studio    # Open Drizzle Studio GUI
npm run db:seed      # Seed database with test data
```

### Database Seeding

The database includes a comprehensive seed script that populates test data:

```bash
cd apps/backend
npm run db:seed
```

This will create:
- **Test user** with login credentials (see below)
- **16 workout templates** (5 runs, 6 reps workouts, 5 time-based exercises)
- **120 workout instances** with realistic data over 6 months
- **30 legacy workouts** for backward compatibility
- **10 random users** for testing

**Test User Login:**
- **Email**: `test@ralphie.fitness`
- **Password**: `TestPassword123!`

The test user has extensive workout history including runs, strength training, and time-based exercises.

### Adding shadcn/ui Components

shadcn/ui is configured in the web app. To add components:

```bash
cd apps/web
npx shadcn@latest add button
npx shadcn@latest add card
# etc.
```

Components will be added to `apps/web/src/components/ui/`

## API Development

### Backend tRPC Router

The backend uses tRPC for type-safe APIs. Routers are located in:
- `apps/backend/src/trpc/routers/`

Example router structure:
```typescript
// apps/backend/src/trpc/routers/example.ts
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const exampleRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(yourTable);
  }),

  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(yourTable).values(input);
    }),
});
```

Add to main router in `apps/backend/src/trpc/router.ts`

### Frontend tRPC Usage

**IMPORTANT**: This project uses tRPC v11 with the `createTRPCContext` pattern. Always follow this pattern:

```typescript
import { useTRPC } from '@/lib/trpc';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Queries: Use queryOptions() with useQuery()
  const myQueryOptions = trpc.example.getAll.queryOptions({
    /* inputs */
  });
  const { data } = useQuery(myQueryOptions);

  // Mutations: Use mutationOptions() with useMutation()
  const myMutationOptions = trpc.example.create.mutationOptions({
    onSuccess: () => {
      // Invalidate queries using queryKey()
      queryClient.invalidateQueries({
        queryKey: trpc.example.getAll.queryKey(),
      });
    },
  });
  const myMutation = useMutation(myMutationOptions);

  // Use the mutation
  const handleSubmit = () => {
    myMutation.mutate({ name: 'example' });
  };

  return (
    <div>
      {data && <pre>{JSON.stringify(data)}</pre>}
      <button onClick={handleSubmit}>Create</button>
    </div>
  );
}
```

**Key Points**:
- Always use `const trpc = useTRPC()` at the top of your component
- Use `trpc.procedure.queryOptions()` with `useQuery()` from TanStack Query
- Use `trpc.procedure.mutationOptions()` with `useMutation()` from TanStack Query
- Use `trpc.procedure.queryKey()` for cache invalidation with `queryClient.invalidateQueries()`
- Import `useQuery`, `useMutation`, and `useQueryClient` from `@tanstack/react-query`
- Never import and use `trpc` directly - always use the `useTRPC()` hook

**Reference**: [tRPC TanStack Query Documentation](https://trpc.io/docs/client/tanstack-react-query/usage)

## Authentication

### Backend Setup

Authentication is handled by better-auth. Configuration is in:
- `apps/backend/src/auth/config.ts`

Routes are automatically mounted at `/api/auth/*`

### Frontend Usage

```typescript
import { useSession, signIn, signOut } from '@/lib/auth';

function MyComponent() {
  const { data: session } = useSession();

  if (!session) {
    return <button onClick={() => signIn.email({ email, password })}>
      Sign In
    </button>;
  }

  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

## Environment Variables

### Backend Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret for session signing
- `BETTER_AUTH_URL`: Backend URL (default: http://localhost:3001)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)
- `PORT`: Server port (default: 3001)

### Frontend Required Variables
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001)

## Code Quality

This project uses Ultracite for linting and formatting, which is built on Biome (a fast Rust-based tool).

- Configuration: `biome.json`
- Run checks: `npm run lint`
- Auto-fix: `npm run format`

## Directory Conventions

- **Components**: `apps/web/src/components/`
- **UI Components**: `apps/web/src/components/ui/` (shadcn)
- **API Routes**: `apps/backend/src/routes/`
- **tRPC Routers**: `apps/backend/src/trpc/routers/`
- **Database Schema**: `apps/backend/src/db/schema.ts`
- **Utilities**: `apps/web/src/lib/` or `apps/backend/src/lib/`

## Type Safety

The project is fully type-safe from database to frontend:

1. **Database**: Drizzle schema defines types
2. **Backend**: TypeScript ensures type safety
3. **tRPC**: Shares types between backend and frontend
4. **Frontend**: Full autocomplete and type checking

## Common Tasks

### Adding a New Feature

1. Update database schema in `apps/backend/src/db/schema.ts`
2. Generate and run migrations
3. Create tRPC router in `apps/backend/src/trpc/routers/`
4. Export router in `apps/backend/src/trpc/router.ts`
5. Use in frontend components with full type safety

### Adding a New Page/Route

1. Create component in `apps/web/src/components/` or `apps/web/src/pages/`
2. Use shadcn components for UI
3. Connect to backend via tRPC hooks
4. Style with Tailwind CSS

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `apps/backend/.env`
- Verify database exists: `createdb ralphie_fitness`

### CORS Issues
- Ensure `FRONTEND_URL` is set correctly in backend `.env`
- Check frontend is running on expected port (5173)

### Type Errors
- Ensure all dependencies are installed: `npm install`
- Rebuild TypeScript: `npm run build`
- Check TypeScript versions match across workspace

## Additional Resources

- [Hono Documentation](https://hono.dev)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [better-auth Documentation](https://www.better-auth.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Ultracite Documentation](https://www.ultracite.ai)

## Notes for AI Assistants

- Always run `npm run format` before committing
- **tRPC Usage**: Always use `const trpc = useTRPC()` hook in components, never import `trpc` directly
- **tRPC Queries**: Use `useQuery(trpc.procedure.queryOptions({ ... }))` pattern
- **tRPC Mutations**: Use `useMutation(trpc.procedure.mutationOptions({ ... }))` pattern
- **Cache Invalidation**: Use `queryClient.invalidateQueries({ queryKey: trpc.procedure.queryKey() })`
- Database migrations should be generated, not hand-written
- Follow the existing code patterns for consistency
- Use shadcn components when building UI - they're already configured
- Environment variables are required for both apps to function
