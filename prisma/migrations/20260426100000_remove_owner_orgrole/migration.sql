-- Converter membros com role OWNER para ADMIN antes de remover o valor do enum
UPDATE "OrganizationMember" SET "role" = 'ADMIN' WHERE "role" = 'OWNER';

-- Recriar o enum sem OWNER (PostgreSQL não suporta DROP VALUE diretamente)
ALTER TYPE "OrgRole" RENAME TO "OrgRole_old";
CREATE TYPE "OrgRole" AS ENUM ('ADMIN', 'MEMBER');

-- Migrar a coluna para o novo tipo
ALTER TABLE "OrganizationMember"
  ALTER COLUMN "role" TYPE "OrgRole" USING "role"::text::"OrgRole",
  ALTER COLUMN "role" SET DEFAULT 'MEMBER';

DROP TYPE "OrgRole_old";
