/**
 * Script de migração de dados: Order → OrderProposal v1
 *
 * Migra dados existentes de `Order.productionInfo` e `Order.estimatedValue`
 * para o novo modelo `OrderProposal` com versão 1.
 *
 * Execução: npm run tool:migrate-order-proposals
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const isLocal = process.env.DATABASE_URL?.includes("localhost") ?? false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🔄 Iniciando migração de propostas de pedidos...\n");

  // Buscar todos os pedidos que têm productionInfo OU estimatedValue
  const ordersWithProposal = await prisma.order.findMany({
    where: {
      OR: [
        { productionInfo: { not: null } },
        { estimatedValue: { not: null } },
      ],
    },
    select: {
      id: true,
      productionInfo: true,
      estimatedValue: true,
      adminNote: true,
      respondedAt: true,
      status: true,
      createdByAdminId: true,
    },
  });

  console.log(`📊 Encontrados ${ordersWithProposal.length} pedidos com propostas.\n`);

  if (ordersWithProposal.length === 0) {
    console.log("✅ Nenhum dado para migrar.");
    return;
  }

  let migratedCount = 0;
  let skippedCount = 0;
  const errors: Array<{ orderId: string; error: string }> = [];

  for (const order of ordersWithProposal) {
    try {
      // Verificar se já existe OrderProposal para este pedido
      const existingProposal = await prisma.orderProposal.findFirst({
        where: { orderId: order.id },
      });

      if (existingProposal) {
        console.log(`⏭️  Pedido ${order.id}: já tem proposta versionada (skip)`);
        skippedCount++;
        continue;
      }

      // Determinar status da proposta baseado no status do pedido
      let proposalStatus: "DRAFT" | "SENT" | "APPROVED" | "REVISION" | "REJECTED" = "DRAFT";
      let sentAt: Date | undefined = undefined;
      let reviewedAt: Date | undefined = undefined;
      let clientResponse: string | undefined = undefined;

      switch (order.status) {
        case "PROPOSAL_SENT":
          proposalStatus = "SENT";
          sentAt = order.respondedAt ?? undefined;
          break;
        case "APPROVED":
        case "IN_PRODUCTION":
        case "IN_REVIEW":
        case "REVIEW_APPROVED":
        case "COMPLETED":
          // Esses estados assumimos que a proposta foi aprovada
          proposalStatus = "APPROVED";
          sentAt = order.respondedAt ?? undefined;
          reviewedAt = order.respondedAt ?? undefined;
          clientResponse = "approved";
          break;
        case "REVISION":
          proposalStatus = "REVISION";
          sentAt = order.respondedAt ?? undefined;
          reviewedAt = order.respondedAt ?? undefined;
          clientResponse = "revision";
          break;
        case "REJECTED":
          proposalStatus = "REJECTED";
          sentAt = order.respondedAt ?? undefined;
          reviewedAt = order.respondedAt ?? undefined;
          clientResponse = "rejected";
          break;
      }

      // Criar OrderProposal versão 1
      await prisma.orderProposal.create({
        data: {
          orderId: order.id,
          version: 1,
          status: proposalStatus,
          productionInfo: order.productionInfo || "Sem informação de produção (migrado)",
          estimatedValue: order.estimatedValue || 0,
          adminNote: order.adminNote,
          sentAt,
          reviewedAt,
          clientResponse,
          createdByAdminId: order.createdByAdminId,
        },
      });

      console.log(`✅ Pedido ${order.id}: proposta v1 criada (status: ${proposalStatus})`);
      migratedCount++;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Erro ao migrar pedido ${order.id}: ${errorMessage}`);
      errors.push({ orderId: order.id, error: errorMessage });
    }
  }

  console.log(`\n📈 Resumo da migração:`);
  console.log(`   ✅ Migrados: ${migratedCount}`);
  console.log(`   ⏭️  Pulados: ${skippedCount}`);
  console.log(`   ❌ Erros: ${errors.length}`);

  if (errors.length > 0) {
    console.log(`\n❌ Erros encontrados:`);
    errors.forEach(({ orderId, error }) => {
      console.log(`   - ${orderId}: ${error}`);
    });
  }

  console.log(`\n✅ Migração concluída!`);
}

main()
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
