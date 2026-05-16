/**
 * Corrige a moeda de um pedido criado erroneamente em EUR quando deveria ser BRL.
 *
 * Uso (consulta apenas):
 *   node --env-file=.env.local --experimental-strip-types scripts/fix-order-currency.ts JACOB26-3QX6E
 *
 * Uso (aplica correção):
 *   node --env-file=.env.local --experimental-strip-types scripts/fix-order-currency.ts JACOB26-3QX6E --fix
 *
 * O que corrige:
 *   - Order.contractCurrency  → "BRL"
 *   - Order.contractFxRate    → null  (sem conversão — moeda nativa)
 *   - Order.contractFxLockedAt → null
 *   - OrderFinancial.currency → "BRL"
 *   - PaymentInstallment.currency → "BRL" (todas as parcelas do pedido)
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const orderRef = process.argv[2];
const isDryRun = !process.argv.includes("--fix");

if (!orderRef) {
  console.error("Uso: scripts/fix-order-currency.ts <orderRef> [--fix]");
  process.exit(1);
}

const isLocal = process.env.DATABASE_URL?.includes("localhost") ?? false;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log(`\n🔍 Consultando pedido: ${orderRef}\n`);

  const order = await prisma.order.findUnique({
    where: { orderRef },
    include: {
      client: { select: { name: true, email: true } },
      financial: {
        include: {
          installments: true,
        },
      },
    },
  });

  if (!order) {
    console.error(`❌ Pedido com orderRef "${orderRef}" não encontrado.`);
    process.exit(1);
  }

  // ── Exibe estado atual ──────────────────────────────────────────────────
  console.log("📋 ESTADO ATUAL:");
  console.log(`   id              : ${order.id}`);
  console.log(`   orderRef        : ${order.orderRef}`);
  console.log(`   status          : ${order.status}`);
  console.log(`   cliente         : ${order.client?.name} <${order.client?.email}>`);
  console.log(`   estimatedValue  : ${order.estimatedValue}`);
  console.log(`   contractCurrency: ${order.contractCurrency ?? "(null — padrão EUR)"}`);
  console.log(`   contractFxRate  : ${order.contractFxRate ?? "(null)"}`);
  console.log(`   contractFxLockedAt: ${order.contractFxLockedAt ?? "(null)"}`);

  if (order.financial) {
    console.log(`\n💰 OrderFinancial:`);
    console.log(`   id             : ${order.financial.id}`);
    console.log(`   currency       : ${order.financial.currency}`);
    console.log(`   totalAmountCents: ${order.financial.totalAmountCents}  (= ${(order.financial.totalAmountCents / 100).toFixed(2)} ${order.financial.currency})`);
    console.log(`   status         : ${order.financial.status}`);

    if (order.financial.installments.length > 0) {
      console.log(`\n📦 Parcelas:`);
      for (const inst of order.financial.installments) {
        console.log(`   [${inst.sequence}] ${(inst.amountCents / 100).toFixed(2)} ${inst.currency}  status=${inst.status}  method=${inst.method}`);
      }
    }
  } else {
    console.log(`\n⚠️  Sem OrderFinancial associado.`);
  }

  // ── Mostra o que será corrigido ─────────────────────────────────────────
  console.log(`\n🔧 CORREÇÕES A APLICAR (moeda EUR → BRL):`);
  console.log(`   Order.contractCurrency    : "${order.contractCurrency}" → "BRL"`);
  console.log(`   Order.contractFxRate      : ${order.contractFxRate} → null`);
  console.log(`   Order.contractFxLockedAt  : ${order.contractFxLockedAt} → null`);
  if (order.financial) {
    console.log(`   OrderFinancial.currency   : "${order.financial.currency}" → "BRL"`);
    for (const inst of order.financial.installments) {
      console.log(`   Installment[${inst.sequence}].currency: "${inst.currency}" → "BRL"`);
    }
  }

  if (isDryRun) {
    console.log(`\n⚠️  MODO DRY-RUN — nenhuma alteração foi feita.`);
    console.log(`   Para aplicar, adicione o flag --fix ao comando.\n`);
    return;
  }

  // ── Aplica correção ─────────────────────────────────────────────────────
  console.log(`\n🚀 Aplicando correção...`);

  await prisma.$transaction(async (tx) => {
    // 1. Corrige Order
    await tx.order.update({
      where: { id: order.id },
      data: {
        contractCurrency: "BRL",
        contractFxRate: null,
        contractFxLockedAt: null,
      },
    });

    // 2. Corrige OrderFinancial
    if (order.financial) {
      await tx.orderFinancial.update({
        where: { id: order.financial.id },
        data: { currency: "BRL" },
      });

      // 3. Corrige cada parcela
      for (const inst of order.financial.installments) {
        await tx.paymentInstallment.update({
          where: { id: inst.id },
          data: { currency: "BRL" },
        });
      }
    }
  });

  console.log(`✅ Correção aplicada com sucesso ao pedido ${orderRef}.\n`);
}

main()
  .catch((err) => {
    console.error("❌ Erro:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect().then(() => pool.end()));
