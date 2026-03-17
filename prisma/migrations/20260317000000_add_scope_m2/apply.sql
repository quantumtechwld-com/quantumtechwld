CREATE TABLE IF NOT EXISTS "Scope" (
  id TEXT NOT NULL,
  "briefingId" TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  "userStories" JSONB NOT NULL DEFAULT '[]',
  screens JSONB NOT NULL DEFAULT '[]',
  integrations JSONB NOT NULL DEFAULT '[]',
  "techRecommended" JSONB NOT NULL DEFAULT '[]',
  "hoursEstimate" INTEGER NOT NULL DEFAULT 0,
  "costMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "costMax" DOUBLE PRECISION NOT NULL DEFAULT 0,
  confidence INTEGER NOT NULL DEFAULT 0,
  "generatedBy" TEXT NOT NULL DEFAULT 'gemini-flash-latest',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Scope_pkey" PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS "Scope_briefingId_key" ON "Scope"("briefingId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Scope_briefingId_fkey'
  ) THEN
    ALTER TABLE "Scope" ADD CONSTRAINT "Scope_briefingId_fkey"
    FOREIGN KEY ("briefingId") REFERENCES "Briefing"(id) ON DELETE CASCADE;
  END IF;
END $$;
