-- Add new OrderStatus enum values
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'IN_REVIEW';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'REVIEW_APPROVED';

-- Add delivery fields to Order table
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryNote" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryLinks" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "finalDeliveryNote" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "finalDeliveryUrl" TEXT;
