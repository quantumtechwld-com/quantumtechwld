-- ============================================================
-- MIGRAÇÃO: Backfill organizationId em pedidos criados pelo admin
-- 
-- PROBLEMA: Pedidos criados via painel admin (/api/admin/orders)
-- eram criados com organizationId = NULL, mesmo quando o cliente
-- já pertencia a uma organização. Isso impedia que membros da
-- mesma organização visualizassem os pedidos históricos.
--
-- SOLUÇÃO: Atualiza Order.organizationId com o valor atual de
-- User.organizationId do cliente do pedido, para todos os pedidos
-- que ainda estão com organizationId = NULL.
--
-- SEGURO para re-executar (idempotente — WHERE organizationId IS NULL).
-- Não sobrescreve pedidos que já têm organizationId definido.
--
-- EXECUTAR VIA SSM (produção):
--   npx prisma db execute --stdin < scripts/backfill-order-organization.sql
-- ============================================================

BEGIN;

-- Preview: quantos pedidos serão atualizados
SELECT
  COUNT(*) AS pedidos_sem_organizacao,
  COUNT(DISTINCT u."organizationId") AS organizacoes_distintas
FROM "Order" o
JOIN "User" u ON u.id = o."clientId"
WHERE o."organizationId" IS NULL
  AND u."organizationId" IS NOT NULL;

-- Executar atualização
UPDATE "Order" o
SET "organizationId" = u."organizationId"
FROM "User" u
WHERE u.id = o."clientId"
  AND o."organizationId" IS NULL
  AND u."organizationId" IS NOT NULL;

-- Confirmar resultado
SELECT
  o."organizationId",
  org.name AS organizacao,
  COUNT(*) AS pedidos_migrados
FROM "Order" o
JOIN "Organization" org ON org.id = o."organizationId"
WHERE o."organizationId" IS NOT NULL
GROUP BY o."organizationId", org.name
ORDER BY pedidos_migrados DESC;

COMMIT;
