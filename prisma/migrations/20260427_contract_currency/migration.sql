ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "billingCurrency" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "billingCurrency" TEXT;

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "contractCurrency" TEXT,
  ADD COLUMN IF NOT EXISTS "contractFxRate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "contractFxLockedAt" TIMESTAMP(3);

ALTER TABLE "OrderFinancial"
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'EUR';

ALTER TABLE "PaymentInstallment"
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'EUR';

UPDATE "Payment"
SET "currency" = UPPER("currency")
WHERE "currency" IS NOT NULL;

UPDATE "OrderFinancial"
SET "currency" = 'EUR'
WHERE "currency" IS NULL OR "currency" = '';

UPDATE "PaymentInstallment"
SET "currency" = 'EUR'
WHERE "currency" IS NULL OR "currency" = '';

UPDATE "Order"
SET "contractCurrency" = 'EUR'
WHERE "contractCurrency" IS NULL AND "estimatedValue" IS NOT NULL;