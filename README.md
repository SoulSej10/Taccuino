# Taccuino

A modern, full-stack note-taking application built with React, TypeScript, and Neon PostgreSQL.

## Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS v4, shadcn/ui
- **Editor:** TipTap (rich text)
- **Backend:** Express 5, Prisma ORM
- **Database:** Neon PostgreSQL
- **Icons:** lucide-react

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/SoulSej10/Taccuino.git
cd Taccuino

# 2. Install dependencies
npm install

# 3. Create .env file (copy from example)
cp .env.example .env
# Then edit .env with your Neon connection string

# 4. Sync database schema
npx prisma db push

# 5. Start development (frontend + API server)
npm run dev
```

The frontend runs on **http://localhost:5173** and the API on **http://localhost:3001**.

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `PORT` | API server port (default: 3001) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both frontend and API server |
| `npm run dev:client` | Start Vite dev server only |
| `npm run dev:server` | Start Express API server only |
| `npm run build` | Type-check and build frontend |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed demo data |

## API Structure

```
GET    /api/notes          — List/filter/search notes
POST   /api/notes          — Create note
GET    /api/notes/:id      — Get note with relations
PUT    /api/notes/:id      — Update note
DELETE /api/notes/:id      — Soft delete (trash)
POST   /api/notes/:id/restore    — Restore from trash
POST   /api/notes/:id/duplicate  — Duplicate note
POST   /api/notes/:id/archive    — Archive note
POST   /api/notes/:id/pin        — Toggle pin
POST   /api/notes/:id/favorite   — Toggle favorite
POST   /api/notes/:id/move       — Move to notebook
POST   /api/notes/bulk           — Bulk actions
GET    /api/notes/:id/versions   — Version history
GET    /api/notebooks       — List notebooks
POST   /api/notebooks       — Create notebook
PUT    /api/notebooks/:id   — Update notebook
DELETE /api/notebooks/:id   — Delete notebook
GET    /api/tags            — List tags
POST   /api/tags            — Create tag
PUT    /api/tags/:id        — Update tag
DELETE /api/tags/:id        — Delete tag
GET    /api/settings        — Get settings
PUT    /api/settings        — Update settings
GET    /api/search?q=       — Unified search
```

## Database

The schema includes 13 models with proper indexes, foreign keys, and cascading deletes:

- **User** / **Profile** — Account management (extensible)
- **Notebook** — Tree structure via self-referencing `parentId`
- **Tag** — Tree structure, many-to-many with notes via `NoteTag`
- **Note** — Core entity with status (active/archived/trashed), pin, favorite
- **NoteVersion** — Full version history for every note change
- **Reminder** — Time-based reminders with priority
- **Task** — Checklists within notes
- **Attachment** — File metadata with provider-agnostic storage
- **ActivityLog** — Audit trail
- **Settings** — Per-user application preferences
- **Template** — Reusable note templates
