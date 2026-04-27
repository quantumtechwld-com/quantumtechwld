-- CreateEnum
CREATE TYPE "OrderProposalStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REVISION', 'REJECTED', 'SUPERSEDED');

-- CreateTable
CREATE TABLE "OrderProposal" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "OrderProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "productionInfo" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION NOT NULL,
    "adminNote" TEXT,
    "sentAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "clientResponse" TEXT,
    "clientNote" TEXT,
    "createdByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderProposal_orderId_idx" ON "OrderProposal"("orderId");

-- CreateIndex
CREATE INDEX "OrderProposal_createdByAdminId_idx" ON "OrderProposal"("createdByAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderProposal_orderId_version_key" ON "OrderProposal"("orderId", "version");

-- AddForeignKey
ALTER TABLE "OrderProposal" ADD CONSTRAINT "OrderProposal_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProposal" ADD CONSTRAINT "OrderProposal_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
