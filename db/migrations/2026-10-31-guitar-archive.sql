-- Adds sale details to guitars. A guitar with a sold_date is archived.
-- Run this BEFORE deploying the code that reads these columns, otherwise
-- /api/guitars fails. Existing rows and the current code are unaffected.
ALTER TABLE guitars
  ADD COLUMN IF NOT EXISTS sold_date date,
  ADD COLUMN IF NOT EXISTS sold_price numeric(10, 2);
