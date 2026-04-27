import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessOrder } from "@/lib/auth/canAccessOrder";
import {
  sendMail,
  tplOrderProposalSent,
  tplOrderApprovedAdmin,
  tplOrderRevisionAdmin,
  tplOrderInProduction,
  tplOrderCompleted,
  tplOrderInReview,
  tplOrderReviewApprovedAdmin,
} from "@/lib/email";
import { appUrl } from "@/lib/app-url";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/orders/[id] ────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: { client: { select: { id: true, name: true, email: true } } },
    });

    if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

    if (!canAccessOrder(order, session.user)) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/orders/[id]]", err);
    return NextResponse.json(
      { error: "Erro ao carregar pedido.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

type PatchBody = {
  action: string;
  productionInfo?: string;
  estimatedValue?: number;
  adminNote?: string;
  deliveryNote?: string;
  deliveryLinks?: string[];
  finalDeliveryNote?: string;
  finalDeliveryUrl?: string;
  downPaymentPct?: number;   // 0 = pagamento único; 1-99 = % de entrada
  paymentMethod?: string;    // STRIPE | MANUAL_PIX | MANUAL_TRANSFER | MANUAL_OTHER
  entryDueDate?: string | null;  // ISO 8601 — prazo da 1.ª parcela
  finalDueDate?: string | null;  // ISO 8601 — prazo da 2.ª parcela
};

type ApiError = { error: string; status: number };

const SAFE_URL_RE = /^https?:\/\//i;
const MAX_TEXT_LEN = 4000;
const MAX_URL_LEN  = 2048;

function isSafeUrl(url: string): boolean {
  return SAFE_URL_RE.test(url) && url.length <= MAX_URL_LEN;
}

function buildSubmitReviewData(body: PatchBody): Record<string, unknown> | ApiError {
  const note = body.deliveryNote?.trim() ?? "";
  if (!note)                       return { error: "Descrição do trabalho realizado é obrigatória.", status: 422 };
  if (note.length > MAX_TEXT_LEN)  return { error: "Descrição do trabalho demasiado longa.", status: 422 };
  const links = (body.deliveryLinks ?? []).map((l) => l.trim()).filter(Boolean);
  if (links.length > 20)           return { error: "Máximo de 20 links por entrega.", status: 422 };
  if (links.some((l) => !isSafeUrl(l))) return { error: "Todos os links devem começar com https:// ou http://.", status: 422 };
  return { status: "IN_REVIEW", deliveryNote: note, deliveryLinks: links, respondedAt: new Date() };
}

function buildCompleteData(body: PatchBody): Record<string, unknown> | ApiError {
  const finalUrl  = body.finalDeliveryUrl?.trim()  ?? null;
  const finalNote = body.finalDeliveryNote?.trim()  ?? null;
  if (finalUrl  && !isSafeUrl(finalUrl))           return { error: "URL do resultado final inválida. Use https:// ou http://.", status: 422 };
  if (finalNote && finalNote.length > MAX_TEXT_LEN) return { error: "Nota final demasiado longa.", status: 422 };
  return { status: "COMPLETED", finalDeliveryNote: finalNote, finalDeliveryUrl: finalUrl };
}

function buildAdminUpdateData(
  body: PatchBody,
): Record<string, unknown> | ApiError {
  switch (body.action) {
    case "propose": {
      const info = body.productionInfo?.trim() ?? "";
      if (!info)                      return { error: "Informações de produção obrigatórias.", status: 422 };
      if (info.length > MAX_TEXT_LEN) return { error: "Informações de produção demasiado longas.", status: 422 };
      if (body.estimatedValue == null || body.estimatedValue < 0) return { error: "Valor estimado inválido.", status: 422 };
      return { status: "PROPOSAL_SENT", productionInfo: info, estimatedValue: body.estimatedValue, adminNote: body.adminNote?.trim() ?? null, respondedAt: new Date() };
    }
    case "start_production": return { status: "IN_PRODUCTION" };
    case "submit_review":    return buildSubmitReviewData(body);
    case "complete":         return buildCompleteData(body);
    case "reopen":           return { status: "REVISION", adminNote: null };
    case "admin_reject": {
      const reason = body.adminNote?.trim() ?? "";
      if (!reason)                      return { error: "O motivo da recusa é obrigatório.", status: 422 };
      if (reason.length > MAX_TEXT_LEN) return { error: "Motivo de recusa demasiado longo.", status: 422 };
      return { status: "REJECTED", estimatedValue: null, adminNote: reason };
    }
    default: return { error: "Acção inválida.", status: 422 };
  }
}

function buildClientUpdateData(
  body: PatchBody,
  order: { status: string },
): Record<string, unknown> | ApiError {
  switch (body.action) {
    case "approve":
      if (order.status !== "PROPOSAL_SENT") return { error: "Só é possível aprovar uma proposta enviada.", status: 422 };
      return { status: "APPROVED" };
    case "revision":
      if (order.status !== "PROPOSAL_SENT") return { error: "Só é possível pedir revisão de uma proposta enviada.", status: 422 };
      return { status: "REVISION", adminNote: body.adminNote?.trim() ?? null };
    case "reject": return { status: "REJECTED" };
    case "approve_review":
      if (order.status !== "IN_REVIEW") return { error: "Só é possível aprovar uma entrega em revisão.", status: 422 };
      return { status: "REVIEW_APPROVED" };
    case "request_correction":
      if (order.status !== "IN_REVIEW") return { error: "Só é possível pedir correção de uma entrega em revisão.", status: 422 };
      return { status: "IN_PRODUCTION", adminNote: body.adminNote?.trim() ?? null };
    default:       return { error: "Acção inválida.", status: 422 };
  }
}

function isApiError(v: Record<string, unknown>): v is ApiError {
  return typeof v.error === "string" && typeof v.status === "number";
}

const ADMIN_ONLY_ACTIONS  = new Set(["propose", "admin_reject"]);
const DEVELOPER_ACTIONS   = new Set(["start_production", "submit_review", "complete", "reopen"]);
const ALL_ADMIN_ACTIONS   = new Set([...ADMIN_ONLY_ACTIONS, ...DEVELOPER_ACTIONS]);

/**
 * Valida autorização e devolve os dados a persistir (ou um ApiError).
 * Centraliza os 3 checks de role/ownership fora do handler principal.
 */
function resolveActionData(
  body: PatchBody,
  order: { status: string },
  isAdmin: boolean,
  isOwner: boolean,
  isDeveloper: boolean,
): Record<string, unknown> | ApiError {
  if (!isAdmin && !isDeveloper && !isOwner) return { error: "Acesso negado.", status: 403 };
  const isAdminOnlyAction = ADMIN_ONLY_ACTIONS.has(body.action);
  const isDevAction       = DEVELOPER_ACTIONS.has(body.action);
  const isPrivilegedAction = ALL_ADMIN_ACTIONS.has(body.action);
  if (isAdminOnlyAction && !isAdmin)             return { error: "Apenas admin.", status: 403 };
  if (isDevAction && !isAdmin && !isDeveloper)   return { error: "Apenas admin ou developer.", status: 403 };
  if (!isPrivilegedAction && !isOwner)           return { error: "Apenas o dono do pedido.", status: 403 };
  return isPrivilegedAction ? buildAdminUpdateData(body) : buildClientUpdateData(body, order);
}

/**
 * Executa o update com optimistic lock (WHERE inclui status atual).
 * Retorna null se o estado mudou entretanto (race condition detectada).
 */
async function updateOrderWithLock(
  id: string,
  currentStatus: string,
  data: Record<string, unknown>,
) {
  try {
    return await db.order.update({
      where: { id, status: currentStatus },
      data,
      include: { client: { select: { name: true, email: true } } },
    });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2025") return null; // race condition
    throw e;
  }
}

type EmailContext = {
  action: string;
  updated: { type: string; title?: string | null; estimatedValue?: number | null; productionInfo?: string | null; finalDeliveryUrl?: string | null };
  clientEmail: string;
  clientName: string;
  adminEmail: string;
  orderUrl: string;
  adminOrderUrl: string;
  adminNote: string;
};

function dispatchPostUpdateEmail(ctx: EmailContext) {
  const { action, updated, clientEmail, clientName, adminEmail, orderUrl, adminOrderUrl, adminNote } = ctx;
  const orderTitle = updated.title ?? "";
  const adminActions: Record<string, () => Promise<void>> = {
    propose: () => sendMail({
      to: clientEmail,
      subject: "[DevFlow] Proposta de produção recebida",
      html: tplOrderProposalSent({ clientName, orderType: updated.type, orderTitle, estimatedValue: updated.estimatedValue ?? 0, productionInfo: updated.productionInfo ?? "", orderUrl }),
    }),
    start_production: () => sendMail({
      to: clientEmail,
      subject: "[DevFlow] O seu pedido está em produção",
      html: tplOrderInProduction({ clientName, orderType: updated.type, orderTitle, orderUrl }),
    }),
    submit_review: () => sendMail({
      to: clientEmail,
      subject: "[DevFlow] Entrega pronta — avalie o trabalho realizado",
      html: tplOrderInReview({ clientName, orderType: updated.type, orderTitle, orderUrl }),
    }),
    complete: () => sendMail({
      to: clientEmail,
      subject: "[DevFlow] Pedido concluído",
      html: tplOrderCompleted({ clientName, orderType: updated.type, orderTitle, orderUrl, finalDeliveryUrl: updated.finalDeliveryUrl ?? undefined }),
    }),
    approve: () => sendMail({
      to: adminEmail,
      subject: "[DevFlow] Pedido aprovado pelo cliente",
      html: tplOrderApprovedAdmin({ clientEmail, orderType: updated.type, adminUrl: adminOrderUrl }),
    }),
    approve_review: () => sendMail({
      to: adminEmail,
      subject: "[DevFlow] Cliente aprovou a entrega",
      html: tplOrderReviewApprovedAdmin({ clientEmail, orderType: updated.type, adminUrl: adminOrderUrl }),
    }),
    revision: () => sendMail({
      to: adminEmail,
      subject: "[DevFlow] Revisão solicitada pelo cliente",
      html: tplOrderRevisionAdmin({ clientEmail, orderType: updated.type, adminNote, adminUrl: adminOrderUrl }),
    }),
    request_correction: () => sendMail({
      to: adminEmail,
      subject: "[DevFlow] Cliente pediu correção na entrega",
      html: tplOrderRevisionAdmin({ clientEmail, orderType: updated.type, adminNote, adminUrl: adminOrderUrl }),
    }),
  };

  const fn = adminActions[action];
  if (fn && (clientEmail || adminEmail)) {
    fn().catch((e: unknown) => console.error(`[email:${action}]`, e));
  }
}

async function createOrReplaceOrderFinancial(
  orderId: string,
  totalCents: number,
  downPaymentPct: number,
  method: string,
  dueDates?: { entry?: string | null; final?: string | null },
): Promise<void> {
  // Remove financeiro anterior (re-proposta) — cascade apaga installments
  await db.orderFinancial.deleteMany({ where: { orderId } });

  const entryCents = downPaymentPct > 0 ? Math.round(totalCents * downPaymentPct / 100) : totalCents;

  type InstallmentDraft = { sequence: number; amountCents: number; method: string; dueDate?: Date | null };
  const installments: InstallmentDraft[] =
    downPaymentPct > 0
      ? [
          { sequence: 1, amountCents: entryCents,              method, dueDate: dueDates?.entry  ? new Date(dueDates.entry)  : null },
          { sequence: 2, amountCents: totalCents - entryCents, method, dueDate: dueDates?.final ? new Date(dueDates.final) : null },
        ]
      : [{ sequence: 1, amountCents: totalCents, method }];

  await db.orderFinancial.create({
    data: {
      orderId,
      totalAmountCents: totalCents,
      downPaymentPct,
      paidCents: 0,
      status: "PENDING",
      installments: {
        create: installments.map(({ sequence, amountCents, method: m, dueDate }) => ({
          sequence,
          amountCents,
          method: m,
          status: "PENDING",
          ...(dueDate ? { dueDate } : {}),
        })),
      },
    },
  });
}

// ─── Financeiro: criar/substituir OrderFinancial + parcelas ─────────────────
// ─── PATCH /api/orders/[id] ──────────────────────────────────────────────────
// Admin: { action: "propose", productionInfo, estimatedValue, adminNote? }
//        { action: "start_production" | "complete" | "admin_reject" }
// Cliente: { action: "approve" | "revision" | "reject", adminNote? }
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as PatchBody;

    const order = await db.order.findUnique({
      where: { id },
      include: { 
        client: { select: { id: true, name: true, email: true } },
        organization: { select: { name: true } },
      },
    });
    if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

    const isAdmin     = session.user.role === "ADMIN";
    const isDeveloper = session.user.role === "DEVELOPER";
    const isOwner     = canAccessOrder(order, session.user);

    const result = resolveActionData(body, order, isAdmin, isOwner, isDeveloper);
    if (isApiError(result)) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    // Optimistic lock: WHERE inclui o status atual — se outro worker já tiver
    // avançado o estado, updateOrderWithLock retorna null e devolvemos 409.
    const updated = await updateOrderWithLock(id, order.status, result);
    if (!updated) {
      return NextResponse.json(
        { error: "Estado do pedido foi alterado entretanto. Recarregue a página e tente novamente." },
        { status: 409 },
      );
    }

    const baseUrl    = appUrl();
    const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_SERVER_USER ?? "";
    const clientEmail = updated.client.email as string;
    const clientName  = (updated.organization?.name ?? updated.client.name ?? "") as string;

    dispatchPostUpdateEmail({
      action:       body.action,
      updated,
      clientEmail,
      clientName,
      adminEmail,
      orderUrl:     `${baseUrl}/portal/orders/${id}`,
      adminOrderUrl: `${baseUrl}/admin/orders/${id}`,
      adminNote:    body.adminNote ?? "",
    });

    // Quando o admin envia proposta, criar OrderProposal versionada + OrderFinancial
    if (body.action === "propose") {
      // Criar proposta versionada
      const { createProposal, sendProposal: sendProposalService } = await import("@/services/proposals/ProposalService");
      
      const newProposal = await createProposal({
        orderId: id,
        productionInfo: body.productionInfo ?? "",
        estimatedValue: body.estimatedValue ?? 0,
        adminNote: body.adminNote,
        createdByAdminId: session.user.id,
      });

      // Enviar proposta (atualiza status, mas Order já está com PROPOSAL_SENT do update anterior)
      await sendProposalService({ proposalId: newProposal.id });

      // Criar/actualizar OrderFinancial se houver valor
      if (updated.estimatedValue != null && updated.estimatedValue > 0) {
        const totalCents = Math.round(updated.estimatedValue * 100);
        const pct = Math.max(0, Math.min(99, Math.round(body.downPaymentPct ?? 0)));
        const method = body.paymentMethod ?? "STRIPE";
        await createOrReplaceOrderFinancial(id, totalCents, pct, method, { entry: body.entryDueDate, final: body.finalDueDate });
      }
    }

    return NextResponse.json({ order: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PATCH /api/orders/[id]]", err);
    return NextResponse.json(
      { error: "Erro ao actualizar pedido.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}
