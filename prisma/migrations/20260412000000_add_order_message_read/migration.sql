-- CreateTable
CREATE TABLE "OrderMessageRead" (
    "orderId"    TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderMessageRead_pkey" PRIMARY KEY ("orderId","userId")
);
