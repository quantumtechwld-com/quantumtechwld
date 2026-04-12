-- Adiciona campo locale ao User para personalização de idioma no portal
-- Padrão "pt", aceita "pt", "en", "es"
ALTER TABLE "User" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'pt';
