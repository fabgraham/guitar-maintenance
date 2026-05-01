# Handoff: Guitar Maintenance Redesign

## Overview
A full visual redesign of the Guitar Maintenance web app — covering three main views: Dashboard, Inventory, and Guitar Detail. The goal was a sleek, minimal Apple-style UI with a cool slate light theme, replacing the original basic white/blue layout.

## About the Design Files
The file `Guitar Maintenance.html` in this bundle is a **high-fidelity design reference built in HTML/React**. It is a prototype showing the intended look, feel, and interactions — not production code to copy directly.

Your task is to **recreate these designs inside the existing Next.js + Tailwind codebase**, using its established patterns, components, and Supabase data layer. Match the visual design as closely as possible while preserving all existing functionality (auth, Supabase sync, optimistic updates, toast notifications, etc.).

## Fidelity
**High-fidelity.** All colors, typography, spacing, border radii, hover states, and interactions are final. Recreate pixel-precisely using the existing Tailwind config and component structure.

---

## Design Tokens

### Colors
```
Background:       #f0f2f5
Surface (cards):  #ffffff
Surface 2:        #e8ecf2
Surface 3:        #d4dae8
Border:           rgba(0,20,60,0.08)
Border strong:    rgba(0,20,60,0.14)

Text primary:     #181e2e
Text secondary:   #5c6680
Text muted:       #a0a8bc

Accent (blue):    #4d7cf6
Accent dim:       rgba(77,124,246,0.1)

Status — Good:    #16a34a  /  bg rgba(22,163,74,0.10)
Status — Warning: #c47a00  /  bg rgba(196,122,0,0.10)
Status — Urgent:  #d42020  /  bg rgba(212,32,32,0.10)
```

### Typography
```
Font family:  'Space Grotesk', sans-serif  (Google Fonts)
Mono:         'Space Mono', monospace       (used for large numbers only)

Page heading:     28px / 700 / tracking -0.02em
Section label:    11px / 600 / uppercase / tracking 0.10em  (muted color)
Card title:       15px / 600
Body:             13–14px / 400–500
Badge:            11px / 600 / tracking 0.02em
Stat number:      38px / 700 / Space Mono
```

### Spacing & Radius
```
Page padding:    28px
Card padding:    18px 20px  (comfortable) / 14px 18px  (compact)
Card gap:        8px
Card radius:     14px
Badge radius:    99px (pill)
Button radius:   9–10px
Input radius:    9px
Sidebar width:   200px
```

### Shadows
```
Cards:     none (use border only)
Modal:     0 20px 60px rgba(0,20,60,0.15)
```

---

## Status Thresholds (updated from original)
```
Good (Maintained):   0 – 90 days since last maintenance
Due Soon:            91 – 180 days
Needs Service:       181+ days
```
Note: thresholds were updated from the previous 60/90 day values.

---

## Screens

### 1. Sidebar Navigation
**Layout:** Fixed left sidebar, 200px wide. On mobile (< 680px) hide the sidebar and show a bottom tab bar instead.

**Sidebar collapse toggle:**
- A toggle button lives in the top-right of the sidebar header
- **Expanded:** shows hamburger icon (☰), full 200px width with labels
- **Collapsed:** shows X icon, shrinks to 56px icon-only mode. Nav labels hidden; tooltips appear on hover
- Collapse state persists in `localStorage` key `sb-collapsed`
- Transition: `width 0.22s cubic-bezier(0.4,0,0.2,1)`
- On mobile (< 680px): sidebar is hidden entirely; bottom tab bar replaces it


- Logo area (26px top padding): text "Guitar" (14px/700) + "MAINTENANCE" (10px/600 uppercase muted) — no icon
- Nav items: Dashboard, Inventory, Settings. Each 9px 12px padding, 9px radius. Active state: accent color text + `accent×0.18` background. Hover: `rgba(0,0,0,0.04)` background.
- Footer: small muted text showing guitar count, 14px padding, top border

**Bottom tab bar (mobile):** flex row, 3 equal items. Active item uses accent color. Icons: Home, List, Settings (Lucide). Labels below icon at 10px.

**Sidebar background:** `#e8ecf2` (Surface 2)

---

### 2. Dashboard
**Layout:** Full-height flex column. Header area (fixed, no scroll) + scrollable guitar list below.

**Header (28px padding):**
- Overline label: "OVERVIEW" in muted 11px uppercase
- Page title: "Dashboard" 28px/700
- Sort dropdown (top-right): `background #e8ecf2`, border, 9px radius

**Stat cards row (3 columns, 10px gap, below header):**
Each card: `background #ffffff`, `border 1px solid rgba(0,20,60,0.08)`, 14px radius, 18px 20px padding, cursor pointer.
- Label: 11px uppercase muted, 8px margin-bottom
- Number: 38px Space Mono, status color
- Hover: background changes to status tint, border to `statusColor×0.44`
- Active (filtered): same hover style persisted

**Section label row:** "All guitars · N" in 10px uppercase muted. "Show all" link-button in accent color when filter is active.

**Guitar card rows (8px gap):**
- Background `#ffffff`, border `rgba(0,20,60,0.08)`, 14px radius, 18px 20px padding
- Left accent bar: 2px wide, `statusColor`, 20% top/bottom inset, opacity 0.4 → 1 on hover
- Content: maker+model (15px/600) + status badge, below: last maintenance notes or year (12px muted)
- Right: formatted date (12px muted) + "Xd ago" (11px/600 status color)
- Chevron right icon (muted) at far right
- Hover: background `#e8ecf2`, border stronger, cursor pointer → navigate to Guitar Detail

---

### 3. Inventory
**Layout:** Same header pattern. Scrollable table below.

**Header:** "COLLECTION" overline + "Inventory" title + "Add Guitar" button (accent bg, white text, 9px 16px padding, 10px radius).

**Table:**
- Container: `background #ffffff`, `border 1px solid rgba(0,20,60,0.08)`, 14px radius, overflow hidden
- Header row: 4-column grid `1fr 130px 140px 32px`, 10px 16px padding, 10px muted uppercase labels
- Data rows: same grid, 14px 16px padding, bottom border between rows, hover `#e8ecf2`
- Columns: Guitar (maker+model bold, year muted below), Last Maintenance (date), Status (badge), chevron

**Add Guitar modal:**
- Backdrop: `rgba(0,20,60,0.18)` with `backdrop-filter: blur(4px)`
- Modal card: `#ffffff`, 16px radius, 28px padding, max-width 420px, shadow `0 20px 60px rgba(0,20,60,0.15)`
- Fields: Maker (required), Model (required), Year (optional number input)
- Input style: `background #e8ecf2`, border, 9px radius, 9px 13px padding
- Submit button disabled + grayed until Maker + Model are filled

---

### 4. Guitar Detail
**Layout:** Fixed header section + scrollable history below.

**Header (24px 28px padding, bottom border):**
- Back button: 34×34px, 9px radius, `#e8ecf2` bg, back arrow icon
- Maker overline (11px uppercase muted) + Model name (22px/700, `white-space: nowrap`) + Status badge inline
- Delete button: 34×34px, urgent tint bg, urgent border, trash icon

**Last Maintenance summary card:**
- Background `#e8ecf2`, 12px radius, 16px 18px padding, border `rgba(0,20,60,0.14)`
- 2-column grid: left = details, right = day counter
- Left: "LAST MAINTENANCE" overline, date (15px/600) + " — X days ago" (13px muted), Type and Notes rows (13px muted)
- Right: large number (34px Space Mono, status color) + "days" label below

**History section:**
- "HISTORY · N" label (11px uppercase muted) + "Add Entry" button (accent)
- Timeline: vertical line 1px `rgba(0,20,60,0.14)` running through nodes
- Each node: 33×33 circle. Latest = accent fill + accent border + glow. Others = `#e8ecf2` + border
- Log card: `#ffffff`, border (latest gets `accent×0.33` border), 11px radius, 12px 15px padding
  - Header row: type name (14px/600) + "LATEST" pill (accent tint, 9px uppercase) + date (muted) + edit + delete icons
  - Notes: 13px muted below

**Add/Edit entry form (inline, above timeline):**
- `#ffffff` bg, border, 12px radius, 18px padding
- Grid: type input (flex 1) + date input (150px) on one row; notes input full width below
- Save / Cancel buttons

---

## Key Behavior Changes vs Original

| Original | Redesign |
|---|---|
| "Recently Maintained" badge | "Maintained" (green) |
| "Needs Maintenance" badge | "Needs Service" (red) |
| `stringSpecs` field | Removed — replaced by `year` |
| Urgent threshold: 90 days | 180 days |
| Warning threshold: 60 days | 90 days |
| Sidebar always shows labels | Collapsed → icon-only option removed |
| Dashboard guitar rows are `<Link>` | Same, but styled as cards |

---

## Responsive Behavior
- **≥ 680px**: Left sidebar (200px) + main content area
- **< 680px**: No sidebar; bottom tab bar with Home / Inventory / Settings

---

## Files in This Package
- `Guitar Maintenance.html` — Full hi-fi interactive prototype (all 3 pages, Add Guitar modal, timeline, tweaks panel)
- `README.md` — This document

---

## Implementation Notes
1. Replace the current Tailwind `primary-*` color scale with the new token values above (or extend `tailwind.config.js`)
2. Add Space Grotesk + Space Mono to `layout.tsx` via Google Fonts `<link>`
3. The sidebar's Guitar/Maintenance branding: text only, no icon
4. The "Add Guitar" form drops `stringSpecs` — update the Supabase schema and `Guitar` type if not already done (the latest codebase already has `year` instead of `stringSpecs`)
5. Status threshold logic is in `src/utils/maintenance.ts` — already updated in the latest codebase (180/90 days)
