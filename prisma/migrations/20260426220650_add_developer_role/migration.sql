-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'DEVELOPER';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "referenceLinks" DROP DEFAULT;
