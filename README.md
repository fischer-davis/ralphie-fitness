# Ralphie Fitness

A modern, full-stack fitness tracking application built with React, Hono, and TypeScript. Available on web and mobile (React Native).

## Tech Stack

### Frontend (Web)
- **React 18** with **Vite** for fast development
- **Tailwind CSS v4** for styling
- **shadcn/ui** for beautiful, accessible UI components
- **tRPC** for type-safe API calls
- **TanStack Query** (React Query) for data fetching
- **better-auth** for authentication

### Mobile (React Native)
- **React Native 0.74** for iOS and Android
- **React Navigation** for native navigation
- **tRPC** for type-safe API calls
- **TanStack Query** (React Query) for data fetching
- **better-auth** for authentication

### Backend
- **Hono** - Fast, lightweight web framework
- **TypeScript** for type safety
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **tRPC** for type-safe API endpoints
- **better-auth** for authentication

### Development Tools
- **Ultracite** - Fast linting and formatting (built on Biome)
- **Turborepo** - Monorepo build system
- **TypeScript** - Full type safety across the stack

## Project Structure

```
ralphie-fitness/
├── apps/
│   ├── web/              # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   │   └── ui/       # shadcn/ui components
│   │   │   └── lib/          # Utilities, tRPC, auth clients
│   │   ├── tailwind.config.js
│   │   └── components.json   # shadcn/ui config
│   │
│   ├── mobile/           # React Native mobile app
│   │   ├── src/
│   │   │   ├── components/   # React Native components
│   │   │   ├── screens/      # App screens
│   │   │   ├── navigation/   # React Navigation setup
│   │   │   └── lib/          # Utilities, tRPC, auth clients
│   │   ├── ios/              # iOS native project
│   │   ├── android/          # Android native project
│   │   └── App.tsx           # Root component
│   │
│   └── backend/          # Hono backend
│       ├── src/
│       │   ├── db/           # Database schema and connection
│       │   ├── trpc/         # tRPC routers and context
│       │   ├── routes/       # API routes (auth, tRPC)
│       │   ├── auth/         # better-auth configuration
│       │   └── index.ts      # Server entry point
│       ├── drizzle/          # Database migrations
│       └── drizzle.config.ts # Drizzle ORM config
│
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── eslint-config/        # Shared ESLint config
│   └── typescript-config/    # Shared TypeScript config
│
├── biome.json                # Ultracite/Biome config
└── turbo.json                # Turborepo config
```

## Getting Started

### Prerequisites

- Node.js 18+ (Node 22 recommended)
- PostgreSQL database
- npm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ralphie-fitness
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   **Backend** (`apps/backend/.env`):
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

   Edit `apps/backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ralphie_fitness
   PORT=3001
   NODE_ENV=development
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=http://localhost:3001
   FRONTEND_URL=http://localhost:5173
   ```

   **Frontend** (`apps/web/.env`):
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

   Edit `apps/web/.env`:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. **Set up the database**

   Create the database:
   ```bash
   createdb ralphie_fitness
   ```

   Push the schema to the database:
   ```bash
   cd apps/backend
   npm run db:push
   ```

   Or generate and run migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start development servers**
   ```bash
   # From root directory - starts web frontend and backend
   npm run dev
   ```

   The web frontend will be available at `http://localhost:5173`

   The backend will be available at `http://localhost:3001`

### Mobile App Setup

To set up and run the mobile app:

1. **Complete native setup**

   See [apps/mobile/NATIVE_SETUP.md](apps/mobile/NATIVE_SETUP.md) for detailed instructions on initializing the iOS and Android projects.

2. **Install mobile dependencies**
   ```bash
   cd apps/mobile
   npm install

   # iOS only
   cd ios && pod install && cd ..
   ```

3. **Start the mobile app**
   ```bash
   # Start Metro bundler
   npm start

   # In another terminal, run:
   npm run ios     # For iOS
   npm run android # For Android
   ```

For detailed mobile app documentation, see [apps/mobile/README.md](apps/mobile/README.md).

## Development

### Available Scripts

From the root directory:

```bash
npm run dev          # Start all development servers
npm run build        # Build all apps
npm run lint         # Lint and check code formatting
npm run format       # Auto-fix linting and formatting issues
npm run format:check # Check formatting without fixing
```

### Database Management

From `apps/backend` directory:

```bash
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema directly to database (dev only)
npm run db:studio    # Open Drizzle Studio (visual database browser)
```

### Adding shadcn/ui Components

shadcn/ui is pre-configured. To add components:

```bash
cd apps/web
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
# etc.
```

Components are installed to `apps/web/src/components/ui/`

## Features

### Type-Safe API with tRPC

The backend and frontend share types automatically through tRPC:

**Backend** (`apps/backend/src/trpc/routers/workouts.ts`):
```typescript
export const workoutsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(workouts);
  }),
});
```

**Frontend** (any component):
```typescript
import { trpc } from '@/lib/trpc';

function Workouts() {
  const { data } = trpc.workouts.getAll.useQuery();
  // data is fully typed!
}
```

### Authentication with better-auth

Authentication is configured and ready to use:

```typescript
import { useSession, signIn, signOut } from '@/lib/auth';

function MyComponent() {
  const { data: session } = useSession();

  // Sign in with email/password
  await signIn.email({ email, password });

  // Sign out
  await signOut();
}
```

### Database with Drizzle ORM

The database schema is defined in `apps/backend/src/db/schema.ts`:

- **users** - User accounts
- **sessions** - Authentication sessions
- **accounts** - OAuth provider accounts
- **verification_tokens** - Email verification
- **workouts** - Example fitness tracking table

Add new tables or modify existing ones in the schema file, then run migrations.

## Tech Documentation

- **Hono**: [https://hono.dev](https://hono.dev)
- **tRPC**: [https://trpc.io](https://trpc.io)
- **Drizzle ORM**: [https://orm.drizzle.team](https://orm.drizzle.team)
- **better-auth**: [https://www.better-auth.com](https://www.better-auth.com)
- **shadcn/ui**: [https://ui.shadcn.com](https://ui.shadcn.com)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)
- **Ultracite**: [https://www.ultracite.ai](https://www.ultracite.ai)

## Development Guide

For detailed development guidelines, see [CLAUDE.md](./CLAUDE.md).

## License

MIT
