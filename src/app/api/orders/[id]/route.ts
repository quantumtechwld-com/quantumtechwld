import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  sendMail,
  tplOrderProposalSent,
  tplOrderApprovedAdmin,
  tplOrderRevisionAdmin,
  tplOrderInProduction,
  tplOrderCompleted,
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

    // Só o dono ou admin pode ver
    if (session.user.role !== "ADMIN" && order.client.email !== session.user.email) {
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
};

type ApiError = { error: string; status: number };

function buildAdminUpdateData(
  body: PatchBody,
): Record<string, unknown> | ApiError {
  switch (body.action) {
    case "propose":
      if (!body.productionInfo?.trim()) return { error: "Informações de produção obrigatórias.", status: 422 };
      if (body.estimatedValue == null || body.estimatedValue < 0) return { error: "Valor estimado inválido.", status: 422 };
      return {
        status:         "PROPOSAL_SENT",
        productionInfo: body.productionInfo.trim(),
        estimatedValue: body.estimatedValue,
        adminNote:      body.adminNote?.trim() ?? null,
        respondedAt:    new Date(),
      };
    case "start_production": return { status: "IN_PRODUCTION" };
    case "complete":         return { status: "COMPLETED" };
    case "admin_reject":
      if (!body.adminNote?.trim()) return { error: "O motivo da recusa é obrigatório.", status: 422 };
      return { status: "REJECTED", estimatedValue: null, adminNote: body.adminNote.trim() };
    default:                 return { error: "Acção inválida.", status: 422 };
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
    default:       return { error: "Acção inválida.", status: 422 };
  }
}

function isApiError(v: Record<string, unknown>): v is ApiError {
  return typeof v.error === "string" && typeof v.status === "number";
}

const ADMIN_ACTIONS = new Set(["propose", "start_production", "complete", "admin_reject"]);

/**
 * Valida autorização e devolve os dados a persistir (ou um ApiError).
 * Centraliza os 3 checks de role/ownership fora do handler principal.
 */
function resolveActionData(
  body: PatchBody,
  order: { status: string },
  isAdmin: boolean,
  isOwner: boolean,
): Record<string, unknown> | ApiError {
  if (!isAdmin && !isOwner) return { error: "Acesso negado.", status: 403 };
  const isAdminAction = ADMIN_ACTIONS.has(body.action);
  if (isAdminAction && !isAdmin)  return { error: "Apenas admin.", status: 403 };
  if (!isAdminAction && !isOwner) return { error: "Apenas o dono do pedido.", status: 403 };
  return isAdminAction ? buildAdminUpdateData(body) : buildClientUpdateData(body, order);
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
  updated: { type: string; title?: string | null; estimatedValue?: number | null; productionInfo?: string | null };
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
    complete: () => sendMail({
      to: clientEmail,
      subject: "[DevFlow] Pedido concluído",
      html: tplOrderCompleted({ clientName, orderType: updated.type, orderTitle, orderUrl }),
    }),
    approve: () => sendMail({
      to: adminEmail,
      subject: "[DevFlow] Pedido aprovado pelo cliente",
      html: tplOrderApprovedAdmin({ clientEmail, orderType: updated.type, adminUrl: adminOrderUrl }),
    }),
    revision: () => sendMail({
      to: adminEmail,
      subject: "[DevFlow] Revisão solicitada pelo cliente",
      html: tplOrderRevisionAdmin({ clientEmail, orderType: updated.type, adminNote, adminUrl: adminOrderUrl }),
    }),
  };

  const fn = adminActions[action];
  if (fn && (clientEmail || adminEmail)) {
    fn().catch((e: unknown) => console.error(`[email:${action}]`, e));
  }
}

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
      include: { client: { select: { id: true, name: true, email: true } } },
    });
    if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = order.client.email === session.user.email;

    const result = resolveActionData(body, order, isAdmin, isOwner);
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
    const clientName  = (updated.client.name ?? "") as string;

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
