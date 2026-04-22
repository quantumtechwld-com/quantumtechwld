-- AlterTable
ALTER TABLE "Order" ADD COLUMN "referenceLinks" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
