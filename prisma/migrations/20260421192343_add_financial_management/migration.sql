-- CreateEnum
CREATE TYPE "FinancialStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'MANUAL_PIX', 'MANUAL_TRANSFER', 'MANUAL_OTHER');

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deliveryLinks" DROP DEFAULT;

-- CreateTable
CREATE TABLE "OrderFinancial" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "totalAmountCents" INTEGER NOT NULL,
    "downPaymentPct" INTEGER NOT NULL DEFAULT 0,
    "paidCents" INTEGER NOT NULL DEFAULT 0,
    "status" "FinancialStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderFinancial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentInstallment" (
    "id" TEXT NOT NULL,
    "financialId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'STRIPE',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripeSessionId" TEXT,
    "stripePaymentIntent" TEXT,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "confirmedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderFinancial_orderId_key" ON "OrderFinancial"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentInstallment_stripeSessionId_key" ON "PaymentInstallment"("stripeSessionId");

-- CreateIndex
CREATE INDEX "PaymentInstallment_financialId_idx" ON "PaymentInstallment"("financialId");

-- CreateIndex
CREATE INDEX "PaymentInstallment_stripeSessionId_idx" ON "PaymentInstallment"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "OrderFinancial" ADD CONSTRAINT "OrderFinancial_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentInstallment" ADD CONSTRAINT "PaymentInstallment_financialId_fkey" FOREIGN KEY ("financialId") REFERENCES "OrderFinancial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
