-- Migração de dados: Order → OrderProposal v1
-- Converte productionInfo e estimatedValue existentes em OrderProposal versão 1

-- Inserir OrderProposal v1 para todos os pedidos que têm productionInfo OU estimatedValue
INSERT INTO "OrderProposal" (
  id,
  "orderId",
  version,
  status,
  "productionInfo",
  "estimatedValue",
  "adminNote",
  "sentAt",
  "reviewedAt",
  "clientResponse",
  "createdByAdminId",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid() AS id,
  "id" AS "orderId",
  1 AS version,
  -- Determinar status baseado no status do pedido
  CASE 
    WHEN status = 'PROPOSAL_SENT' THEN 'SENT'::"OrderProposalStatus"
    WHEN status = 'APPROVED' THEN 'APPROVED'::"OrderProposalStatus"
    WHEN status = 'REVISION' THEN 'REVISION'::"OrderProposalStatus"
    WHEN status = 'REJECTED' THEN 'REJECTED'::"OrderProposalStatus"
    WHEN status IN ('IN_PRODUCTION', 'IN_REVIEW', 'REVIEW_APPROVED', 'COMPLETED') THEN 'APPROVED'::"OrderProposalStatus"
    ELSE 'DRAFT'::"OrderProposalStatus"
  END AS status,
  -- Production info (se nulo, usar texto padrão)
  COALESCE("productionInfo", 'Sem informação de produção (migrado)') AS "productionInfo",
  -- Estimated value (se nulo, usar 0)
  COALESCE("estimatedValue", 0) AS "estimatedValue",
  "adminNote",
  -- Sent at: usar respondedAt se a proposta foi enviada
  CASE 
    WHEN status IN ('PROPOSAL_SENT', 'APPROVED', 'REVISION', 'REJECTED', 'IN_PRODUCTION', 'IN_REVIEW', 'REVIEW_APPROVED', 'COMPLETED') 
    THEN "respondedAt"
    ELSE NULL
  END AS "sentAt",
  -- Reviewed at: usar respondedAt se houve resposta do cliente
  CASE
    WHEN status IN ('APPROVED', 'REVISION', 'REJECTED', 'IN_PRODUCTION', 'IN_REVIEW', 'REVIEW_APPROVED', 'COMPLETED')
    THEN "respondedAt"
    ELSE NULL
  END AS "reviewedAt",
  -- Client response
  CASE
    WHEN status = 'APPROVED' OR status IN ('IN_PRODUCTION', 'IN_REVIEW', 'REVIEW_APPROVED', 'COMPLETED') THEN 'approved'
    WHEN status = 'REVISION' THEN 'revision'
    WHEN status = 'REJECTED' THEN 'rejected'
    ELSE NULL
  END AS "clientResponse",
  "createdByAdminId",
  "createdAt",
  "updatedAt"
FROM "Order"
WHERE
  -- Apenas pedidos que têm productionInfo OU estimatedValue
  ("productionInfo" IS NOT NULL OR "estimatedValue" IS NOT NULL)
  -- E ainda não têm OrderProposal (evitar duplicação se script rodar 2x)
  AND NOT EXISTS (
    SELECT 1 FROM "OrderProposal" op WHERE op."orderId" = "Order".id
  );

-- Verificação: quantos OrderProposals foram criados?
SELECT COUNT(*) AS "propostas_criadas" FROM "OrderProposal" WHERE version = 1;
