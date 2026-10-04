# Review the app improvements locally

The original app is saved on `backup/before-app-improvements` at commit
`a1450f2`. `main` still points to that version. The improvements live on
`preview/app-improvements`. No branch has been pushed.

## Start the improved preview

```sh
git switch preview/app-improvements
npm ci
npm run preview
```

Open http://127.0.0.1:3000. The **Local preview** banner confirms that you
are using sample data. Add, edit, delete, import and clear actions affect
only this browser's preview collection. They persist when you refresh.
Settings → Load Samples restores the starting sample collection.

Preview mode skips API requests and refuses database access on the server,
even if a live `DATABASE_URL` is present. It uses its own browser storage key
and build folder. The preview is bound to this computer's loopback address.
Use `npm run preview` for this isolated mode; `npm run dev` uses the app's
normal data connections.

## Return to the original code

Stop the preview with Ctrl+C before switching branches:

```sh
git switch backup/before-app-improvements
```

To return to the improvements:

```sh
git switch preview/app-improvements
npm run preview
```

Commit or stash any new edits before switching. The backup branch contains
the original code, so it does not have the new isolated preview command.
Switching branches restores code, not database contents.

## What changed

- Darker, more readable text and status colors, with visible keyboard focus.
- Dashboard service priorities and distinct empty-filter messages.
- Collection cards on phones and tablets, plus a table on wider screens.
- Compact status counters and reduced phone padding.
- Settings panels, backup controls and a separate clear-data section.
- Labeled mobile navigation, visible maintenance actions and larger buttons.
- Dialog focus containment, Escape dismissal and focus restoration.
- Loading placeholders instead of empty-state flashes.
- Settings reflects the existing thresholds: maintained through 120 days,
  due soon at 121–180 days, needs service after 180 days or without history.

Settings' restore, sample and clear tools operate on the browser's copy,
as they did before. Their wording now explains this. Production database
schemas and the maintenance policy have not changed.

## Publish only after review

Review on phone and desktop widths, and try adding a guitar and a
maintenance entry. When the result is approved, merge the preview branch
into the production branch and push using the existing deployment workflow.
Build for production using `npm run build` without `NEXT_PUBLIC_LOCAL_PREVIEW`.

## Validation

- Production build, TypeScript and ESLint passed.
- Browser checks covered the four main views at 320, 375, 640, 768, 1024 and
  1440 pixels, including expanded and collapsed desktop navigation.
- Automated WCAG A/AA checks passed on Dashboard, Collection, Settings,
  Guitar Detail and the Add Guitar dialog.
- Add, edit, delete, export, clear, import and reload persistence passed
  with sample data. Long guitar names and missing-guitar routes were checked.
- Preview made zero API requests and left the normal browser data key
  unchanged. The server database guard and maintenance boundary dates passed.

Browser checks used temporary tools outside this repository. The live
database was not accessed during these checks.
