# Repository Guidelines

## Project Structure & Module Organization
- `apps/web/` (Vite + React) keeps shadcn primitives in `src/components/ui`, feature components in `src/components`, and shared hooks/utilities in `src/lib`.
- `apps/backend/` (Hono) stores REST/tRPC routes in `src/routes` and `src/trpc`, Drizzle schema and seeds in `src/db`, and migrations in `drizzle/`.
- `packages/ui`, `packages/eslint-config`, and `packages/typescript-config` house UI/tooling presets, while root `turbo.json`, `biome.json`, and `CLAUDE.md` document pipelines and style rules you must honor before reorganizing anything.

## Build, Test, and Development Commands
- `npm run dev` launches frontend + backend via Turborepo; scope to one target with `npx turbo run dev --filter=web` or `--filter=backend`.
- `npm run build` compiles all workspaces; run the same command inside `apps/web` or `apps/backend` when isolating failures.
- Ultracite commands: `npm run lint`, `npm run format`, and `npm run format:check`; run them before every commit.
- `apps/backend` supplies `npm run db:generate|db:migrate|db:push|db:seed|db:studio`; no repo-wide `test` exists yet, so run suites from the owning workspace and note the command in your PR.

## Coding Style & Naming Conventions
- Biome enforces 2-space indentation, single-quoted TypeScript, double-quoted JSX, trailing `es5` commas, and mandatory semicolons—run `npm run format`.
- Use PascalCase for React components/files, camelCase for functions/variables, and snake_case only for PostgreSQL tables managed through Drizzle migrations.
- Keep shared UI in `packages/ui` and import frontend modules via the `@/` alias rather than deep relative paths.
- Follow the TRPC + TanStack Query conventions in `CLAUDE.md`: call `useTRPC()`, trust the generated keys, and invalidate caches through TanStack helpers.

## Testing Guidelines
- Automated tests are being rolled out; colocate new specs as `*.test.ts(x)` next to the module or under `apps/*/src/__tests__/`.
- Frontend work should lean on Vitest + Testing Library, and backend handlers on Hono request helpers or supertest-style clients—add the needed deps within your PR.
- Seed-dependent tests must run `npm run db:seed`; list every lint/test/manual command you executed in the PR body.

## Commit & Pull Request Guidelines
- Follow the Conventional Commit pattern seen in history (`feat:`, `fix:`, `chore:`) with short, imperative subjects.
- Every PR needs a concise summary, test command list, linked issue IDs, and UI screenshots or recordings when the UX changes.
- Call out schema or env updates explicitly and include upgrade steps such as `cd apps/backend && npm run db:migrate`.

## Security & Configuration Tips
- Copy `.env.example` files inside `apps/backend` and `apps/web`, fill `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `FRONTEND_URL`, and `VITE_API_URL`, and keep secrets local.
