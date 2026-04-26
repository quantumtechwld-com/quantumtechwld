-- Converter membros com role OWNER para ADMIN antes de remover o valor do enum
UPDATE "OrganizationMember" SET "role" = 'ADMIN' WHERE "role" = 'OWNER';

-- Recriar o enum sem OWNER (PostgreSQL não suporta DROP VALUE diretamente)
ALTER TYPE "OrgRole" RENAME TO "OrgRole_old";
CREATE TYPE "OrgRole" AS ENUM ('ADMIN', 'MEMBER');

-- Remover DEFAULT antes de alterar o tipo (o DEFAULT referencia o tipo antigo e bloqueia o cast)
ALTER TABLE "OrganizationMember" ALTER COLUMN "role" DROP DEFAULT;

-- Migrar a coluna para o novo tipo
ALTER TABLE "OrganizationMember"
  ALTER COLUMN "role" TYPE "OrgRole" USING "role"::text::"OrgRole";

-- Re-definir DEFAULT com o novo tipo
ALTER TABLE "OrganizationMember" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

DROP TYPE "OrgRole_old";
