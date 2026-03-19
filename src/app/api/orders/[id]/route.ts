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

// ─── PATCH /api/orders/[id] ──────────────────────────────────────────────────
// Admin: { action: "propose", productionInfo, estimatedValue, adminNote? }
//        { action: "start_production" }
//        { action: "complete" }
// Cliente: { action: "approve" | "revision" | "reject", adminNote? }
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as {
      action: string;
      productionInfo?: string;
      estimatedValue?: number;
      adminNote?: string;
    };

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

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_SERVER_USER ?? "";

    let updateData: Record<string, unknown> = {};

    // ── Acções do admin ──────────────────────────────────────────────────────
    if (body.action === "propose") {
      if (!isAdmin) return NextResponse.json({ error: "Apenas admin." }, { status: 403 });
      if (!body.productionInfo?.trim()) {
        return NextResponse.json({ error: "Informações de produção obrigatórias." }, { status: 422 });
      }
      if (body.estimatedValue == null || body.estimatedValue < 0) {
        return NextResponse.json({ error: "Valor estimado inválido." }, { status: 422 });
      }
      updateData = {
        status:         "PROPOSAL_SENT",
        productionInfo: body.productionInfo.trim(),
        estimatedValue: body.estimatedValue,
        adminNote:      body.adminNote?.trim() ?? null,
        respondedAt:    new Date(),
      };
    } else if (body.action === "start_production") {
      if (!isAdmin) return NextResponse.json({ error: "Apenas admin." }, { status: 403 });
      updateData = { status: "IN_PRODUCTION" };
    } else if (body.action === "complete") {
      if (!isAdmin) return NextResponse.json({ error: "Apenas admin." }, { status: 403 });
      updateData = { status: "COMPLETED" };
    } else if (body.action === "admin_reject") {
      if (!isAdmin) return NextResponse.json({ error: "Apenas admin." }, { status: 403 });
      updateData = { status: "REJECTED" };

    // ── Acções do cliente ────────────────────────────────────────────────────
    } else if (body.action === "approve") {
      if (!isOwner) return NextResponse.json({ error: "Apenas o dono do pedido." }, { status: 403 });
      if (order.status !== "PROPOSAL_SENT") {
        return NextResponse.json({ error: "Só é possível aprovar uma proposta enviada." }, { status: 422 });
      }
      updateData = { status: "APPROVED" };
    } else if (body.action === "revision") {
      if (!isOwner) return NextResponse.json({ error: "Apenas o dono do pedido." }, { status: 403 });
      if (order.status !== "PROPOSAL_SENT") {
        return NextResponse.json({ error: "Só é possível pedir revisão de uma proposta enviada." }, { status: 422 });
      }
      updateData = { status: "REVISION", adminNote: body.adminNote?.trim() ?? null };
    } else if (body.action === "reject") {
      if (!isOwner) return NextResponse.json({ error: "Apenas o dono do pedido." }, { status: 403 });
      updateData = { status: "REJECTED" };
    } else {
      return NextResponse.json({ error: "Acção inválida." }, { status: 422 });
    }

    const updated = await db.order.update({
      where: { id },
      data: updateData,
      include: { client: { select: { name: true, email: true } } },
    });

    // ── Emails pós-actualização ──────────────────────────────────────────────
    const orderUrl = `${baseUrl}/portal/orders/${id}`;
    const adminOrderUrl = `${baseUrl}/admin/orders/${id}`;
    const clientEmail = updated.client.email as string;
    const clientName = (updated.client.name ?? "") as string;

    if (body.action === "propose" && clientEmail) {
      sendMail({
        to: clientEmail,
        subject: "[DevFlow] Proposta de produção recebida",
        html: tplOrderProposalSent({
          clientName,
          orderType:      updated.type,
          estimatedValue: updated.estimatedValue ?? 0,
          productionInfo: updated.productionInfo ?? "",
          orderUrl,
        }),
      }).catch((e: unknown) => console.error("[tplOrderProposalSent]", e));
    } else if (body.action === "approve" && adminEmail) {
      sendMail({
        to: adminEmail,
        subject: "[DevFlow] Pedido aprovado pelo cliente",
        html: tplOrderApprovedAdmin({
          clientEmail,
          orderType: updated.type,
          adminUrl:  adminOrderUrl,
        }),
      }).catch((e: unknown) => console.error("[tplOrderApprovedAdmin]", e));
    } else if (body.action === "revision" && adminEmail) {
      sendMail({
        to: adminEmail,
        subject: "[DevFlow] Revisão solicitada pelo cliente",
        html: tplOrderRevisionAdmin({
          clientEmail,
          orderType: updated.type,
          adminNote: body.adminNote ?? "",
          adminUrl:  adminOrderUrl,
        }),
      }).catch((e: unknown) => console.error("[tplOrderRevisionAdmin]", e));
    } else if (body.action === "start_production" && clientEmail) {
      sendMail({
        to: clientEmail,
        subject: "[DevFlow] O seu pedido está em produção",
        html: tplOrderInProduction({
          clientName,
          orderType: updated.type,
          orderUrl,
        }),
      }).catch((e: unknown) => console.error("[tplOrderInProduction]", e));
    } else if (body.action === "complete" && clientEmail) {
      sendMail({
        to: clientEmail,
        subject: "[DevFlow] Pedido concluído",
        html: tplOrderCompleted({
          clientName,
          orderType: updated.type,
          orderUrl,
        }),
      }).catch((e: unknown) => console.error("[tplOrderCompleted]", e));
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
