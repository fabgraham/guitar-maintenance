# Change Management: Supabase → Railway Postgres

## Why

Supabase free tier pauses after 7 days of inactivity, making the app unreliable for occasional personal use. Railway Postgres has no such pause behavior.

## Architecture (after migration)

- Next.js app stays on Vercel, deployment unchanged
- Railway provides only a Postgres database (no Railway API service)
- Client-side code calls Next.js API routes; API routes call Railway Postgres server-side
- `src/utils/storage.ts` and the `useReducer` state machine are untouched (localStorage fallback stays)

## Checklist

### 1. Dependencies (`package.json`)
- [ ] Remove `@supabase/supabase-js`
- [ ] Add `pg` and `@types/pg`

### 2. Delete
- [ ] `src/utils/supabase.ts` — no longer needed

### 3. Create `src/lib/db.ts`
```ts
import { Pool } from 'pg';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
});
```

### 4. Create Next.js API routes under `src/app/api/`

| File | Methods | Notes |
|------|---------|-------|
| `guitars/route.ts` | GET, POST | list all / create |
| `guitars/[id]/route.ts` | PUT, DELETE | update / delete |
| `maintenance-logs/route.ts` | GET, POST | list all / create |
| `maintenance-logs/[id]/route.ts` | PUT, DELETE | update / delete |

All routes import `pool` from `src/lib/db.ts` and use raw SQL.

Column name mapping (DB ↔ JS):
- `guitar_id` ↔ `guitarId`
- `maintenance_date` ↔ `maintenanceDate`
- `type_of_work` ↔ `typeOfWork`
- `created_at` ↔ `createdAt`
- `updated_at` ↔ `updatedAt`

### 5. Rewrite `src/hooks/useAppState.tsx`
- [ ] Remove all Supabase imports and calls
- [ ] Replace `useEffect` DB load with `fetch('/api/guitars')` + `fetch('/api/maintenance-logs')`
- [ ] Replace `syncGuitarToSupabase` / `deleteGuitarFromSupabase` etc. with `fetch()` calls to API routes
- [ ] Keep `useReducer`, `saveToStorage`, and localStorage fallback as-is
- [ ] Seeding: check via `/api/guitars` returning empty array, then POST each seed record

### 6. Update `.env.local`
- [x] Remove `NEXT_PUBLIC_SUPABASE_URL`
- [x] Remove `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] Add `DATABASE_URL=<Railway Postgres connection string>`

### 7. Vercel (manual — no code change)
- [x] Project Settings → Environment Variables: remove the two Supabase vars
- [x] Add `DATABASE_URL` pointing at the Railway Postgres URL

### 8. Railway (manual — no code change)
- [ ] Create a new Railway project
- [ ] Provision a Postgres plugin
- [ ] Run schema DDL:
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

## Files touched

| File | Action |
|------|--------|
| `package.json` | Edit |
| `src/utils/supabase.ts` | Delete |
| `src/lib/db.ts` | Create (new) |
| `src/app/api/guitars/route.ts` | Create (new) |
| `src/app/api/guitars/[id]/route.ts` | Create (new) |
| `src/app/api/maintenance-logs/route.ts` | Create (new) |
| `src/app/api/maintenance-logs/[id]/route.ts` | Create (new) |
| `src/hooks/useAppState.tsx` | Rewrite |
| `.env.local` | Edit |

## Files NOT touched

- `src/utils/storage.ts` — still used for localStorage fallback
- All components, pages, and types — no changes needed
- `vercel.json`, `next.config.js` — no changes needed
