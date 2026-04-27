/**
 * POST /api/orders/[id]/proposals/respond
 * Cliente responde à proposta (aprovar, pedir revisão ou rejeitar)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { respondToProposal, getActiveProposal } from "@/services/proposals/ProposalService";
import { canAccessOrder } from "@/lib/auth/canAccessOrder";
import { prisma } from "@/lib/prisma";

const responseSchema = z.object({
  response: z.enum(["approved", "revision", "rejected"]),
  clientNote: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id: orderId } = await params;

    // Buscar pedido para verificar permissão
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { client: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (!canAccessOrder(order, session.user)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Buscar proposta ativa
    const proposal = await getActiveProposal(orderId);
    if (!proposal) {
      return NextResponse.json({ error: "Nenhuma proposta ativa encontrada" }, { status: 404 });
    }

    if (proposal.status !== "SENT") {
      return NextResponse.json(
        { error: "Apenas propostas enviadas podem receber resposta" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = responseSchema.parse(body);

    const updatedProposal = await respondToProposal({
      proposalId: proposal.id,
      response: validated.response,
      clientNote: validated.clientNote,
    });

    // TODO: Enviar email ao admin notificando resposta do cliente
    // import { sendProposalResponseNotification } from "@/lib/email-templates/proposals";
    // await sendProposalResponseNotification(updatedProposal, validated.response);

    return NextResponse.json({
      ok: true,
      proposal: {
        id: updatedProposal.id,
        status: updatedProposal.status,
        clientResponse: updatedProposal.clientResponse,
        reviewedAt: updatedProposal.reviewedAt,
      },
      message:
        validated.response === "approved"
          ? "Proposta aprovada com sucesso!"
          : validated.response === "revision"
            ? "Solicitação de revisão enviada. Aguarde nova proposta."
            : "Proposta rejeitada.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[POST /api/orders/[id]/proposals/respond]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao responder proposta" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/[id]/proposals
 * Cliente visualiza proposta ativa
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id: orderId } = await params;

    // Buscar pedido para verificar permissão
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { client: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (!canAccessOrder(order, session.user)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const proposal = await getActiveProposal(orderId);

    if (!proposal) {
      return NextResponse.json(
        { error: "Nenhuma proposta disponível" },
        { status: 404 }
      );
    }

    // Cliente só vê propostas enviadas ou aprovadas
    if (proposal.status === "DRAFT" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Proposta ainda não foi enviada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      proposal: {
        id: proposal.id,
        version: proposal.version,
        status: proposal.status,
        productionInfo: proposal.productionInfo,
        estimatedValue: proposal.estimatedValue,
        sentAt: proposal.sentAt,
        reviewedAt: proposal.reviewedAt,
        clientResponse: proposal.clientResponse,
        createdAt: proposal.createdAt,
      },
    });
  } catch (error) {
    console.error("[GET /api/orders/[id]/proposals]", error);
    return NextResponse.json(
      { error: "Erro ao buscar proposta" },
      { status: 500 }
    );
  }
}
