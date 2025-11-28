# App Structure Guide

## Overview
This is a Next.js 14 application using the App Router pattern. Understanding this structure will help you navigate and maintain the codebase.

## Main Application Structure

### Homepage/Dashboard
**[src/app/page.tsx](../../src/app/page.tsx)** is your homepage/dashboard - this is the main entry point when you visit `http://localhost:3000/`

### How Next.js App Router Works

```
src/app/
├── page.tsx          → Homepage (http://localhost:3000/)
├── layout.tsx        → Root layout wrapper
├── inventory/
│   └── page.tsx      → /inventory route
├── guitar/[id]/
│   └── page.tsx      → /guitar/1, /guitar/2, etc.
└── settings/
    └── page.tsx      → /settings route
```

### Route Mapping

Each `page.tsx` file becomes a route:

- **`app/page.tsx`** = `/` (your dashboard)
- **`app/inventory/page.tsx`** = `/inventory`
- **`app/guitar/[id]/page.tsx`** = `/guitar/:id` (dynamic route - `:id` can be any guitar ID)
- **`app/settings/page.tsx`** = `/settings`

### Key Files & Their Roles

#### Pages
- **[src/app/page.tsx](../../src/app/page.tsx)** - Dashboard showing all guitars with maintenance status
- **[src/app/inventory/page.tsx](../../src/app/inventory/page.tsx)** - Guitar collection management (CRUD)
- **[src/app/guitar/[id]/page.tsx](../../src/app/guitar/[id]/page.tsx)** - Individual guitar detail with maintenance history
- **[src/app/settings/page.tsx](../../src/app/settings/page.tsx)** - Application settings

#### Layout & Configuration
- **[src/app/layout.tsx](../../src/app/layout.tsx)** - Root layout that wraps everything, provides HTML structure, navigation, and app-wide providers (AppProvider)
- **[src/app/globals.css](../../src/app/globals.css)** - Global styles and Tailwind configuration

#### Components
Located in `src/components/`:
- **GuitarRow.tsx** - Guitar card display on dashboard
- **GuitarList.tsx** - Table view in inventory page
- **GuitarForm.tsx** - Add/edit guitar modal form
- **MaintenanceLogForm.tsx** - Add/edit maintenance log modal
- **MaintenanceLogList.tsx** - Display maintenance history
- **Navigation.tsx** - Sidebar navigation
- **ConfirmDialog.tsx** - Confirmation modals for delete actions

#### State Management
- **[src/hooks/useAppState.tsx](../../src/hooks/useAppState.tsx)** - Centralized state using React Context + useReducer
  - Manages guitars and maintenance logs
  - Handles Supabase sync and localStorage fallback
  - Provides dispatch actions for CRUD operations

#### Utilities
Located in `src/utils/`:
- **maintenance.ts** - Calculate maintenance status, status colors/text
- **storage.ts** - localStorage helpers
- **supabase.ts** - Supabase client setup
- **seedData.ts** - Initial seed data for guitars
- **cn.ts** - Tailwind class name utility

#### Types
- **[src/types/index.ts](../../src/types/index.ts)** - TypeScript interfaces for Guitar, MaintenanceLog, AppState, etc.

## Running the App Locally

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Navigate to `http://localhost:3000`

3. **You'll see:**
   The Dashboard page ([src/app/page.tsx](../../src/app/page.tsx))

## Important Notes

- **No traditional `index.html`**: Next.js generates HTML automatically from your `page.tsx` files
- **`layout.tsx` is the wrapper**: Provides HTML structure, navigation, and app-wide providers
- **`src/app/page.tsx`** is essentially your "index" file
- **Dynamic routes**: Use `[id]` folder naming for dynamic segments (e.g., `/guitar/[id]/`)
- **Client components**: Files starting with `'use client'` are client-side components
- **Server components**: Files without `'use client'` are server components (default in App Router)

## Data Flow

1. **AppProvider** ([src/hooks/useAppState.tsx](../../src/hooks/useAppState.tsx)) loads data on mount
2. Data is fetched from **Supabase** (if configured) or **localStorage**
3. If no data exists, **seed data** is loaded
4. State updates trigger **automatic saves** to both Supabase and localStorage
5. All components access state via `useAppState()` hook

## Deployment

The app is configured for deployment on **Vercel**:
- Push to GitHub triggers automatic deployment
- [vercel.json](../../vercel.json) is minimal (empty `{}`) - Vercel auto-detects Next.js
- Environment variables for Supabase should be set in Vercel dashboard
