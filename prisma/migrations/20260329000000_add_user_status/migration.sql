-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- AlterTable: adiciona coluna nullable, define ACTIVE para todos os utilizadores existentes,
-- depois impõe NOT NULL e define PENDING como default para novos registos
ALTER TABLE "User" ADD COLUMN "status" "UserStatus";
UPDATE "User" SET "status" = 'ACTIVE';
ALTER TABLE "User" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'PENDING';
