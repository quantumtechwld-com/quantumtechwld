-- M2: Cérebro de Arquitetura — tabela de escopo técnico gerado por IA
CREATE TABLE "Scope" (
  "id"              TEXT NOT NULL,
  "briefingId"      TEXT NOT NULL,
  "features"        JSONB NOT NULL,
  "userStories"     JSONB NOT NULL,
  "screens"         JSONB NOT NULL,
  "integrations"    JSONB NOT NULL,
  "techRecommended" JSONB NOT NULL,
  "hoursEstimate"   INTEGER NOT NULL,
  "costMin"         DOUBLE PRECISION NOT NULL,
  "costMax"         DOUBLE PRECISION NOT NULL,
  "confidence"      INTEGER NOT NULL,
  "generatedBy"     TEXT NOT NULL DEFAULT 'gemini-flash-latest',
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Scope_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Scope_briefingId_key" ON "Scope"("briefingId");

ALTER TABLE "Scope"
  ADD CONSTRAINT "Scope_briefingId_fkey"
  FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
