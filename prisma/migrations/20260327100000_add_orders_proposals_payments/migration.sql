-- M3: Proposal + ProposalComment
-- M4: Order + OrderMessage
-- M7: Payment
-- M10: OrderRating

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'REVISION', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING', 'EVALUATING', 'PROPOSAL_SENT', 'APPROVED', 'REVISION', 'REJECTED', 'IN_PRODUCTION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable Proposal
CREATE TABLE "Proposal" (
    "id"         TEXT NOT NULL,
    "briefingId" TEXT NOT NULL,
    "version"    INTEGER NOT NULL DEFAULT 1,
    "status"     "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "content"    TEXT NOT NULL,
    "summary"    TEXT NOT NULL,
    "hoursTotal" INTEGER NOT NULL,
    "costMin"    DOUBLE PRECISION NOT NULL,
    "costMax"    DOUBLE PRECISION NOT NULL,
    "clientNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Proposal_briefingId_key" ON "Proposal"("briefingId");

ALTER TABLE "Proposal"
    ADD CONSTRAINT "Proposal_briefingId_fkey"
    FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable ProposalComment
CREATE TABLE "ProposalComment" (
    "id"         TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "authorId"   TEXT NOT NULL,
    "excerpt"    TEXT NOT NULL,
    "body"       TEXT NOT NULL,
    "resolved"   BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalComment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProposalComment"
    ADD CONSTRAINT "ProposalComment_proposalId_fkey"
    FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProposalComment"
    ADD CONSTRAINT "ProposalComment_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable Order
CREATE TABLE "Order" (
    "id"             TEXT NOT NULL,
    "clientId"       TEXT NOT NULL,
    "type"           TEXT NOT NULL,
    "description"    TEXT NOT NULL,
    "urgency"        TEXT NOT NULL DEFAULT 'normal',
    "attachments"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status"         "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "productionInfo" TEXT,
    "estimatedValue" DOUBLE PRECISION,
    "adminNote"      TEXT,
    "respondedAt"    TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Order"
    ADD CONSTRAINT "Order_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable OrderMessage
CREATE TABLE "OrderMessage" (
    "id"        TEXT NOT NULL,
    "orderId"   TEXT NOT NULL,
    "authorId"  TEXT NOT NULL,
    "body"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderMessage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "OrderMessage"
    ADD CONSTRAINT "OrderMessage_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderMessage"
    ADD CONSTRAINT "OrderMessage_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable Payment
CREATE TABLE "Payment" (
    "id"                  TEXT NOT NULL,
    "orderId"             TEXT NOT NULL,
    "stripeSessionId"     TEXT NOT NULL,
    "stripePaymentIntent" TEXT,
    "amountCents"         INTEGER NOT NULL,
    "currency"            TEXT NOT NULL DEFAULT 'eur',
    "status"              "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt"              TIMESTAMP(3),
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"           TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");
CREATE UNIQUE INDEX "Payment_stripeSessionId_key" ON "Payment"("stripeSessionId");

ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable OrderRating
CREATE TABLE "OrderRating" (
    "id"        TEXT NOT NULL,
    "orderId"   TEXT NOT NULL,
    "score"     INTEGER NOT NULL,
    "comment"   TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderRating_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderRating_orderId_key" ON "OrderRating"("orderId");

ALTER TABLE "OrderRating"
    ADD CONSTRAINT "OrderRating_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
