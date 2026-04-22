-- AlterTable: add optional dueDate to PaymentInstallment
ALTER TABLE "PaymentInstallment" ADD COLUMN "dueDate" TIMESTAMP(3);
