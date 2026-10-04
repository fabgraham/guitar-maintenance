# App improvements and deployment

**Date:** 4 October 2026  
**Live app:** https://guitar-maintenance.vercel.app

## What we changed

- Improved text readability and color contrast, including navigation and status badges.
- Made Dashboard show guitars needing service first, with a collection summary and clearer messages when a filter has no matches.
- Kept Collection as cards on phones and tablets, with a table on wider screens.
- Reduced mobile padding and kept the three status counters in a compact row.
- Restyled Settings to match the rest of the app, with clear backup controls and a separate section for clearing browser data.
- Added labels to mobile navigation and visible Actions buttons to maintenance entries.
- Made Collection links keyboard accessible, added visible focus indicators, and enlarged key buttons.
- Added dialog focus containment, Escape dismissal and focus restoration, plus labels on form fields and icon buttons.
- Added loading placeholders and fixed missing-guitar pages that could remain loading indefinitely.
- Improved backup-file validation and made failed API responses report sync failures.

The existing maintenance policy was kept: maintained through 120 days,
due soon at 121–180 days, and needs service after 180 days or without
maintenance history. Settings now explains these thresholds correctly.
Its restore, sample and clear tools still affect the browser's copy;
their wording now makes this clear.

## Preview and original version

The improvements were developed on `preview/app-improvements` and reviewed
locally using `npm run preview`. This mode uses sample guitars, separate
browser storage and a separate build folder. It skips API requests and
blocks database access, so preview edits do not affect the live collection.

The original version is preserved locally and on GitHub as
`backup/before-app-improvements`, at commit `a1450f2`.
Full preview and branch-switching instructions are in `PREVIEW.md`.

## Checks completed

- Production build, TypeScript and ESLint passed.
- Browser checks covered Dashboard, Collection, Settings and Guitar Detail at phone, tablet and desktop widths, including both sidebar states and long guitar names.
- Automated accessibility checks passed on those views and the Add Guitar dialog.
- Preview checks passed for adding, editing, deleting, exporting, clearing, restoring backups and retaining edits after a refresh.
- Preview made no API requests and left normal browser data untouched.

## Publishing and real data

After approval, the changes were merged into `main` and pushed to GitHub.
Vercel successfully deployed production commit `53635a9`, which includes
the app improvements in `3e1ee09` and a documentation update.

The live app uses the existing PostgreSQL database. Read-only checks before
and after deployment confirmed that all **13 guitars and 40 maintenance
entries** were unchanged. The updated Dashboard was verified live, with
preview mode disabled. No database schema changes were made.

## Returning to the old app

We can restore the code from the backup branch in a new commit on `main`
and push it to trigger another deployment. This keeps the Git history and
restores the old appearance and behavior. It does not restore an older
database snapshot; the existing collection remains in the database.
