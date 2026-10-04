# App improvements

Review date: 3 October 2026.

These suggestions are based on inspection of the project source and design notes. They have not been verified in a browser. The app already has a cohesive slate-and-blue style, rounded surfaces, and a useful maintenance timeline; refine that foundation rather than replacing it.

## First priorities

Start with Settings consistency, text contrast, and responsive spacing. These offer the biggest visible improvement without a full redesign.

## 1. Improve readability

Dates, notes, navigation, and labels frequently use pale `#a0a8bc` at 10–12px. Darken useful secondary information toward `#5c6680`, and use 13–14px for dates and notes. Check text contrast against each background before settling on the final colors.

## 2. Finish styling Settings

`src/app/settings/page.tsx` uses `card` and `btn` classes that are not defined in the stylesheet. Give Settings the same white panels, borders, spacing, and buttons as the other pages. Place destructive actions in a separate section.

## 3. Make the tablet layout less cramped

At 640px, the sidebar consumes 200px while the dashboard switches to a four-column table. Keep cards until there is enough content width for the table. Reduce mobile page padding from 28px to 16px, and keep the three status counters compact rather than stacking three large cards.

Check narrow phones, tablet widths, and both expanded and collapsed sidebar states. Long guitar names and maintenance notes should remain readable without causing horizontal overflow.

## 4. Give Dashboard a clearer purpose

Dashboard and Collection currently show similar tables. Make Dashboard emphasise guitars needing attention, with a short summary such as “2 guitars need service.” Keep Collection focused on browsing and managing instruments.

## 5. Make interactions easier to discover

Add visible labels to mobile navigation and a clear “Actions” control on maintenance entries. Edit and delete controls currently require tapping an otherwise unmarked card.

Restore input focus indicators, make collection rows keyboard accessible, and enlarge the 34px guitar-detail buttons to roughly 44px. Give icon-only buttons accessible names. Ensure dialogs support keyboard focus and dismissal.

## 6. Polish loading and empty states

The dashboard shows “No guitars in your collection” even when a filter simply has no matches. Distinguish an empty collection from an empty filtered result: for example, use “No guitars need service” when that filter has no matches, with a way to show all guitars.

Show skeletons while loading rather than briefly displaying an empty collection or zero counts. Align Settings’ maintenance explanation with the actual thresholds in `src/utils/maintenance.ts`: maintained through 120 days, due soon from 121–180 days, and needs service after 180 days. The existing design notes describe different thresholds, so confirm the intended policy before changing the calculation.
