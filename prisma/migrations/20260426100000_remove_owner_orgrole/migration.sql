-- Converter membros com role OWNER para ADMIN (idempotente: sem OWNER na coluna, nenhuma linha é afetada)
UPDATE "OrganizationMember" SET "role" = 'ADMIN' WHERE "role"::text = 'OWNER';

-- Renomear OrgRole -> OrgRole_old (somente se OrgRole_old ainda não existir)
-- A primeira tentativa de apply pode ter executado este passo antes de falhar
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrgRole_old') THEN
    ALTER TYPE "OrgRole" RENAME TO "OrgRole_old";
  END IF;
END $$;

-- Criar novo OrgRole sem OWNER (somente se ainda não existir com os valores corretos)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrgRole') THEN
    CREATE TYPE "OrgRole" AS ENUM ('ADMIN', 'MEMBER');
  END IF;
END $$;

-- Migrar a coluna para o novo tipo (somente se ainda referenciar OrgRole_old)
-- DROP DEFAULT separado é obrigatório: PostgreSQL 42804 ocorre quando o DEFAULT
-- referencia o tipo antigo e o ALTER COLUMN TYPE tenta reescrevê-lo automaticamente
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'OrganizationMember'
      AND column_name = 'role'
      AND udt_name = 'OrgRole_old'
  ) THEN
    ALTER TABLE "OrganizationMember" ALTER COLUMN "role" DROP DEFAULT;
    ALTER TABLE "OrganizationMember" ALTER COLUMN "role" TYPE "OrgRole" USING "role"::text::"OrgRole";
    ALTER TABLE "OrganizationMember" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
  END IF;
END $$;

-- Remover o tipo antigo (somente se ainda existir)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrgRole_old') THEN
    DROP TYPE "OrgRole_old";
  END IF;
END $$;
