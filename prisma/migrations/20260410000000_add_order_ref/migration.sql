-- Adiciona coluna orderRef (identificador único legível por humanos)
-- Formato: {5 INICIAIS}{AA}-{5 CHARS HASH}  ex: DAWGF26-A3K7M
ALTER TABLE "Order" ADD COLUMN "orderRef" TEXT;

CREATE UNIQUE INDEX "Order_orderRef_key" ON "Order"("orderRef");
