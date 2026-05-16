-- Correção: pedido JACOB26-3QX6E
-- Valor correto: R$850,00 em duas parcelas de R$425,00
-- IDs capturados em 2026-05-13 via check-order.sql

BEGIN;

-- 1. Remove taxa de câmbio EUR→BRL da Order (valor era BRL nativo)
UPDATE "Order"
SET
  "contractFxRate"     = NULL,
  "contractFxLockedAt" = NULL
WHERE "orderRef" = 'JACOB26-3QX6E';

-- 2. Corrige total do OrderFinancial (488317 cents → 85000 cents = R$850,00)
UPDATE "OrderFinancial"
SET "totalAmountCents" = 85000
WHERE id = 'cmp46uyvo0001fp1oly1bwgd9';

-- 3. Corrige parcela 1 (244159 → 42500 = R$425,00)
UPDATE "PaymentInstallment"
SET "amountCents" = 42500
WHERE id = 'cmp46uyvp0002fp1onhdg228b';

-- 4. Corrige parcela 2 (244158 → 42500 = R$425,00)
UPDATE "PaymentInstallment"
SET "amountCents" = 42500
WHERE id = 'cmp46uyvp0003fp1of5w75bzf';

COMMIT;

-- Verificação pós-correção
SELECT
  o."orderRef",
  o.status,
  o."contractCurrency",
  o."contractFxRate",
  o."contractFxLockedAt",
  f."totalAmountCents",
  f."totalAmountCents" / 100.0 AS total_brl,
  f.currency
FROM "Order" o
JOIN "OrderFinancial" f ON f."orderId" = o.id
WHERE o."orderRef" = 'JACOB26-3QX6E';

SELECT
  i.sequence,
  i."amountCents",
  i."amountCents" / 100.0 AS amount_brl,
  i.currency,
  i.status,
  i.method
FROM "PaymentInstallment" i
WHERE i."financialId" = 'cmp46uyvo0001fp1oly1bwgd9'
ORDER BY i.sequence;
