# Taccuino — Agent Guidelines

## Project Overview
Taccuino is a lightweight note-taking app built with React 19, TypeScript, Vite 7, Tailwind CSS v4, and shadcn/ui (New York style).

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
- Format with Prettier before committing.

## Pull Requests
- Keep PRs focused on a single concern. If a PR does multiple things, split it.
- PR title must match the commit convention format.

## Testing
- Run `npm run build` before any commit to catch type errors and build failures.
- Run `npm run lint` before any commit.
- All tests must pass before committing.

## Project Structure
```
src/
  components/     # Reusable components
    ui/           # shadcn/ui primitives (do not edit manually)
  hooks/          # Custom React hooks
  lib/            # Utility functions, helpers
  pages/          # Page-level components (one per route)
  types/          # Shared TypeScript types
  App.tsx         # Root component
  main.tsx        # Entry point
```

## What Not To Do
- Do not modify `src/components/ui/` — those are shadcn primitives managed by the framework.
- Do not add new dependencies without asking the user first.
- Do not add routing (react-router) unless explicitly requested.
- Do not add a backend/server. Keep everything client-side and use `localStorage` for persistence.
