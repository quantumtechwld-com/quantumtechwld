/**
 * Reenvia a proposta do pedido JACOB26-3QX6E ao cliente com o valor correto (R$850,00).
 *
 * Uso no VPS:
 *   node --env-file=/home/deploy/quantum-agency/.env.production.local \
 *        --experimental-strip-types /tmp/resend-proposal-jacob26.ts
 *
 * O que faz:
 *   1. Cria um OrderProposal (v1, status SENT) com estimatedValue=850 BRL
 *   2. Atualiza Order: status=PROPOSAL_SENT, estimatedValue=850, BRL, sem FX
 *   3. NÃO toca o OrderFinancial (já corrigido: R$850, 2x R$425 MANUAL_PIX)
 *   4. Envia email ao cliente ana@jacobscom.com.br
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Carrega .env.production.local manualmente se DATABASE_URL não estiver no processo
if (!process.env.DATABASE_URL) {
  const envPath = resolve(process.cwd(), ".env.production.local");
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx < 0) continue;
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import nodemailer from "nodemailer";

const ORDER_ID  = "cmp46uyvb0000fp1ov3jdcmu3";
const ORDER_REF = "JACOB26-3QX6E";
const BASE_URL  = process.env.AUTH_URL ?? "https://quantumtechwld.com";

// ── DB ───────────────────────────────────────────────────────────────────────
const isLocal = process.env.DATABASE_URL?.includes("localhost") ?? false;
const pool    = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma  = new PrismaClient({ adapter } as any);

// ── Email ────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_SERVER_HOST,
  port:   Number(process.env.EMAIL_SERVER_PORT ?? 465),
  secure: Number(process.env.EMAIL_SERVER_PORT ?? 465) === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

async function main() {
  // 1. Buscar dados do pedido
  const order = await prisma.order.findUnique({
    where: { id: ORDER_ID },
    include: { client: { select: { name: true, email: true } } },
  });

  if (!order) throw new Error(`Pedido ${ORDER_REF} não encontrado.`);
  if (!order.productionInfo) throw new Error("productionInfo vazio — não é possível enviar proposta.");

  console.log(`\n📋 Pedido : ${order.orderRef}`);
  console.log(`   Cliente : ${order.client.name} <${order.client.email}>`);
  console.log(`   Status  : ${order.status}`);
  console.log(`   Info    : ${order.productionInfo.slice(0, 80)}...`);
  console.log();

  // 2. Criar OrderProposal (v1, SENT, 850 BRL)
  const lastProposal = await prisma.orderProposal.findFirst({
    where:   { orderId: ORDER_ID },
    orderBy: { version: "desc" },
  });
  const nextVersion = lastProposal ? lastProposal.version + 1 : 1;

  const proposal = await prisma.orderProposal.create({
    data: {
      orderId:         ORDER_ID,
      version:         nextVersion,
      status:          "SENT",
      sentAt:          new Date(),
      productionInfo:  order.productionInfo,
      estimatedValue:  850,
    },
  });
  console.log(`✅ OrderProposal criado: v${nextVersion} | id: ${proposal.id}`);

  // 3. Atualizar Order (status → PROPOSAL_SENT, valores corretos BRL sem conversão)
  await prisma.order.update({
    where: { id: ORDER_ID },
    data: {
      status:             "PROPOSAL_SENT",
      estimatedValue:     850,
      contractCurrency:   "BRL",
      contractFxRate:     null,
      contractFxLockedAt: null,
      respondedAt:        new Date(),
    },
  });
  console.log(`✅ Order atualizado: PROPOSAL_SENT | estimatedValue=850 BRL | FxRate=null`);

  // 4. Enviar email ao cliente
  const orderUrl   = `${BASE_URL}/portal/orders/${ORDER_ID}`;
  const clientName = order.client.name ?? "Cliente";
  const prodInfo   = order.productionInfo ?? "";
  const clientEmail = order.client.email as string;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <div style="text-align:center;margin-bottom:28px">
        <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px">QUANTUM<span style="color:#0ea5e9">.</span>TECH</span>
      </div>
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px">Proposta recebida ✦</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá ${clientName},</p>
      <p style="color:#94a3b8;margin:0 0 24px">
        A equipe avaliou o seu pedido e enviou uma proposta de produção atualizada.
      </p>
      <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Valor estimado</p>
        <p style="color:#fff;font-weight:700;font-size:28px;margin:0 0 16px">R$ 850,00</p>
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Pagamento</p>
        <p style="color:#94a3b8;font-size:14px;margin:0 0 16px">2 parcelas de R$ 425,00 via PIX</p>
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Informações de produção</p>
        <p style="color:#94a3b8;font-size:14px;margin:0;white-space:pre-line">${prodInfo.slice(0, 500)}${prodInfo.length > 500 ? "…" : ""}</p>
      </div>
      <a href="${orderUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver proposta e responder →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #ffffff10">
        Quantum Technology · quantumtechwld.com
      </p>
    </div>
  `;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM ?? "Quantum Tech <noreply@quantumtechwld.com>",
    to:      clientEmail,
    subject: "Proposta recebida — R$ 850,00",
    html,
    text:    `Olá ${clientName}, você recebeu uma proposta de produção no valor de R$ 850,00 (2x R$425 PIX). Acesse: ${orderUrl}`,
  });
  console.log(`✅ Email enviado para: ${clientEmail}`);
  console.log(`\n🎉 Pedido ${ORDER_REF} reenviado com sucesso!\n`);
}

main()
  .catch((err) => {
    console.error("❌ Erro:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect().then(() => pool.end()));
