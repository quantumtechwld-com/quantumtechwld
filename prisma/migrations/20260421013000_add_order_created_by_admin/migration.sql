ALTER TABLE "Order"
ADD COLUMN "createdByAdminId" TEXT;

CREATE INDEX "Order_createdByAdminId_idx" ON "Order"("createdByAdminId");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_createdByAdminId_fkey"
FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;