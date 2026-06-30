# Taccuino — Agent Guidelines

## Project Overview
Taccuino is a modern note-taking application with a React frontend and Express/Prisma backend on Neon PostgreSQL.

**Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS v4, shadcn/ui (New York style), TipTap editor
**Backend:** Express 5, Prisma ORM 6, Neon PostgreSQL

## Commit Convention
All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `docs:` — documentation only
- `style:` — formatting, missing semicolons, etc. (no code change)
- `chore:` — build tooling, dependencies, etc.

Format: `<type>: <short description>`

**Do not** use scope prefixes like `feat(scope):`.

## Code Quality
- **No commented-out code** — delete it entirely.
- **No console.log** in production code — use a proper logger if needed.
- **No `any` types** — prefer `unknown` and narrow with type guards.
- **No default exports** except for page components and entry points (`main.tsx`). Use named exports.
- **No barrel files** (`index.ts` that re-export) — import directly from the file.

## Testing
- Run `npm run build` before any commit to catch type errors and build failures.
- Run `npm run lint` before any commit.
- All tests must pass before committing.

## Project Structure
```
src/
  components/
    ui/           # shadcn/ui primitives (do not edit manually)
    common/       # Reusable: EmptyState, Skeleton, Toast, ConfirmDialog, LoadingScreen
    layout/       # AppLayout, Sidebar, Header, Workspace, StatusBar
    dashboard/    # Dashboard with widgets
    editor/       # TipTap rich editor, toolbar, dialogs
    notes/        # NoteList, NoteDetail
    search/       # CommandPalette
    settings/     # SettingsPage
  lib/
    api.ts        # API client (all backend calls)
    utils.ts      # cn() utility
  stores/
    appStore.tsx  # Global state with React Context + useReducer
  types/          # Shared TypeScript types
  App.tsx
  main.tsx
server/
  index.ts        # Express entry point (mounts routes, serves static)
  prisma.ts       # Prisma client singleton
  middleware/     # errorHandler, validate
  routes/         # notes, notebooks, tags, settings, search
  seed.ts         # Demo data seeder
prisma/
  schema.prisma   # Database schema (13 models)
  migrations/     # Migration history
```

## Data Flow
1. Components read state via `useAppState()` and call actions via `useAppActions()`
2. Actions call the API client (`src/lib/api.ts`) which makes fetch requests to `/api/*`
3. Vite proxies `/api` to the Express server at `localhost:3001`
4. Express routes use Prisma to query Neon PostgreSQL
5. On success, the local state is updated optimistically

## Development
```bash
npm run dev         # Starts both frontend (5173) and API server (3001)
npm run dev:client  # Frontend only
npm run dev:server  # API server only
npm run db:seed     # Seed demo data
```

## What Not To Do
- Do not modify `src/components/ui/` — those are shadcn primitives managed by the framework.
- Do not add new dependencies without asking the user first.
- Do not add routing (react-router) unless explicitly requested.
- Do not hardcode secrets — use environment variables via `.env`.
