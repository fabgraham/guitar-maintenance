# Changelog

Release history for Guitar Maintenance. Newest versions come first.

- **Version numbers:** `MAJOR.MINOR.PATCH`. New features raise MINOR and fixes raise PATCH.
- **Dates:** `YYYY-MM-DD`.
- **Each release:** add an entry here and set the same version in `package.json`.
- **Earlier entries:** 0.1.0 to 0.4.0 were written on 2026-10-31 from the git history, so their dates are commit dates.

---

## 0.5.0 — 2026-10-31

**Requires a database change.** Run `db/migrations/2026-10-31-guitar-archive.sql` before deploying. If the code goes first, `/api/guitars` fails.

### Added
- Guitar archive for sold guitars. **Move to archive** on a guitar's page records the date sold and an optional price, and keeps its maintenance history.
- **Current / Archive** filter on the Collection page. The archive is sorted newest sold first.
- Read-only page for archived guitars, with **Edit sale details** and **Restore to collection**.
- Migration folder at `db/migrations/` and this changelog, which replaces `CHANGES.md`.

### Changed
- Archived guitars no longer appear on the Dashboard or in guitar counts.

### Fixed
- A failed load now shows a visible error banner. It used to show old data with no warning, which hid a production outage after the 2026-10-22 database password rotation.
- The app no longer falls back to the built-in seed list when it can't load the collection.
- The app no longer writes seed data to the database when the collection is empty.

---

## 0.4.0 — 2026-10-04

### Added
- `npm run preview`: an isolated local preview with sample data and no database access.
- Sorting on the Collection page (2026-09-23).

### Changed
- Better readability, keyboard focus and dialog behaviour.
- Collection shown as cards on phones and tablets and as a table on wider screens.
- Settings reorganised into panels, with backup controls and a separate clear-data section.
- Loading placeholders replace empty-state flashes.

---

## 0.3.0 — 2026-06-26

Moved the database from Supabase to Railway Postgres.

### Why
Supabase's free tier pauses after 7 days of inactivity, which made the app unreliable for occasional personal use. Railway Postgres has no such pause.

### Architecture
- The Next.js app stays on Vercel. Railway only provides the Postgres database.
- Client code calls Next.js API routes, and those routes call Postgres server-side using raw SQL through `src/lib/db.ts`.
- `@supabase/supabase-js` and `src/utils/supabase.ts` were removed, and `pg` was added.
- `src/utils/storage.ts` and the `useReducer` state were kept, including the browser copy.

### API routes

| File | Methods | Purpose |
|------|---------|---------|
| `src/app/api/guitars/route.ts` | GET, POST | List all, create |
| `src/app/api/guitars/[id]/route.ts` | PUT, DELETE | Update, delete |
| `src/app/api/maintenance-logs/route.ts` | GET, POST | List all, create |
| `src/app/api/maintenance-logs/[id]/route.ts` | PUT, DELETE | Update, delete |

Database columns map to JavaScript names: `guitar_id` ↔ `guitarId`, `maintenance_date` ↔ `maintenanceDate`, `type_of_work` ↔ `typeOfWork`, `created_at` ↔ `createdAt`, `updated_at` ↔ `updatedAt`.

### Configuration
- `.env.local`: removed `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and added `DATABASE_URL`.
- Vercel: removed the Supabase variables and added `DATABASE_URL`.

### Schema

```sql
CREATE TABLE IF NOT EXISTS guitars (
  id TEXT PRIMARY KEY,
  maker TEXT NOT NULL,
  model TEXT NOT NULL,
  year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id TEXT PRIMARY KEY,
  guitar_id TEXT NOT NULL REFERENCES guitars(id) ON DELETE CASCADE,
  maintenance_date TIMESTAMPTZ NOT NULL,
  type_of_work TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Also changed
- Maintenance status intervals adjusted.

---

## 0.2.0 — 2026-04-22

### Added
- Sort by last updated (2026-03-09).

### Changed
- Redesign with a slate theme and the Space Grotesk font.
- Mobile improvements for iPhone: top navigation, larger form text and fully visible guitar cards.
- Sidebar navigation on desktop.
- Guitar cards are clickable across the whole card.

---

## 0.1.0 — 2025-11-28

First release.

### Added
- Dashboard with maintenance status for each guitar.
- Guitar inventory and maintenance logs.
- Supabase storage with a browser copy as a fallback.
- Toast notifications (2025-12-01).
- Notes and sorting on the Dashboard (2026-01-03).
