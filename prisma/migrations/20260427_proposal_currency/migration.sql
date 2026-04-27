ALTER TABLE "Proposal"
  ADD COLUMN IF NOT EXISTS "costCurrency" TEXT NOT NULL DEFAULT 'EUR';

UPDATE "Proposal"
SET "costCurrency" = 'EUR'
WHERE "costCurrency" IS NULL OR "costCurrency" = '';