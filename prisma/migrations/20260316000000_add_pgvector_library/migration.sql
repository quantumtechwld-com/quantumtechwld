-- Migration: S6 Similar Projects Library
-- Cria tabela ReferenceProject com embedding armazenado como JSON (TEXT).
-- Similaridade calculada na aplicação (cosine similarity em TypeScript).
-- Quando a base crescer, migrar o campo para vector(768) com pgvector.

CREATE TABLE "ReferenceProject" (
    "id"              TEXT NOT NULL,
    "title"           TEXT NOT NULL,
    "description"     TEXT NOT NULL,
    "projectType"     TEXT NOT NULL,
    "features"        TEXT[] NOT NULL,
    "techStack"       TEXT[] NOT NULL,
    "complexityScore" INTEGER NOT NULL,
    "hoursActual"     INTEGER NOT NULL,
    "budgetRange"     TEXT NOT NULL,
    "briefingId"      TEXT,
    "embedding"       TEXT NOT NULL, -- JSON array de 768 floats
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferenceProject_pkey" PRIMARY KEY ("id")
);

-- Chave única para briefingId (um briefing = um projeto de referência)
CREATE UNIQUE INDEX "ReferenceProject_briefingId_key" ON "ReferenceProject"("briefingId");

-- FK para Briefing (opcional)
ALTER TABLE "ReferenceProject" ADD CONSTRAINT "ReferenceProject_briefingId_fkey"
    FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
