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
    case "admin_reject":     return { status: "REJECTED" };
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

type EmailContext = {
  action: string;
  updated: { type: string; estimatedValue?: number | null; productionInfo?: string | null };
  clientEmail: string;
  clientName: string;
  adminEmail: string;
  orderUrl: string;
  adminOrderUrl: string;
  adminNote: string;
};

function dispatchPostUpdateEmail(ctx: EmailContext) {
  const { action, updated, clientEmail, clientName, adminEmail, orderUrl, adminOrderUrl, adminNote } = ctx;
  const adminActions: Record<string, () => Promise<void>> = {
    propose: () => sendMail({
      to: clientEmail,
      subject: "[DevFlow] Proposta de produção recebida",
      html: tplOrderProposalSent({ clientName, orderType: updated.type, estimatedValue: updated.estimatedValue ?? 0, productionInfo: updated.productionInfo ?? "", orderUrl }),
    }),
    start_production: () => sendMail({
      to: clientEmail,
      subject: "[DevFlow] O seu pedido está em produção",
      html: tplOrderInProduction({ clientName, orderType: updated.type, orderUrl }),
    }),
    complete: () => sendMail({
      to: clientEmail,
      subject: "[DevFlow] Pedido concluído",
      html: tplOrderCompleted({ clientName, orderType: updated.type, orderUrl }),
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

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const adminActions = new Set(["propose", "start_production", "complete", "admin_reject"]);
    if (adminActions.has(body.action) && !isAdmin) {
      return NextResponse.json({ error: "Apenas admin." }, { status: 403 });
    }
    if (!adminActions.has(body.action) && !isOwner) {
      return NextResponse.json({ error: "Apenas o dono do pedido." }, { status: 403 });
    }

    const result = adminActions.has(body.action)
      ? buildAdminUpdateData(body)
      : buildClientUpdateData(body, order);

    if (isApiError(result)) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const updated = await db.order.update({
      where: { id },
      data: result,
      include: { client: { select: { name: true, email: true } } },
    });

    const baseUrl    = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
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
