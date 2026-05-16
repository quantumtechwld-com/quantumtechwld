-- Consulta estado atual do pedido JACOB26-3QX6E
SELECT
  o.id,
  o."orderRef",
  o.status,
  o."estimatedValue",
  o."contractCurrency",
  o."contractFxRate",
  o."contractFxLockedAt",
  u.name  AS client_name,
  u.email AS client_email
FROM "Order" o
JOIN "User" u ON u.id = o."clientId"
WHERE o."orderRef" = 'JACOB26-3QX6E';

-- Consulta OrderFinancial
SELECT
  f.id,
  f."orderId",
  f.currency,
  f."totalAmountCents",
  f."totalAmountCents" / 100.0 AS total_value,
  f.status
FROM "OrderFinancial" f
JOIN "Order" o ON o.id = f."orderId"
WHERE o."orderRef" = 'JACOB26-3QX6E';

-- Consulta Parcelas
SELECT
  i.id,
  i.sequence,
  i."amountCents",
  i."amountCents" / 100.0 AS amount,
  i.currency,
  i.status,
  i.method
FROM "PaymentInstallment" i
JOIN "OrderFinancial" f ON f.id = i."financialId"
JOIN "Order" o ON o.id = f."orderId"
WHERE o."orderRef" = 'JACOB26-3QX6E';
