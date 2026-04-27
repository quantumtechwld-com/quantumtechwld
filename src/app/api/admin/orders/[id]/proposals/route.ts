/**
 * POST /api/admin/orders/[id]/proposals
 * Cria ou atualiza proposta de um pedido (admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import {
  createProposal,
  sendProposal,
  createRevision,
  getLatestProposal,
} from "@/services/proposals/ProposalService";

const proposalSchema = z.object({
  productionInfo: z.string().min(10, "Informação de produção deve ter ao menos 10 caracteres"),
  estimatedValue: z.number().positive("Valor estimado deve ser positivo"),
  adminNote: z.string().optional(),
  action: z.enum(["draft", "send"]).default("draft"),
  isRevision: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const validated = proposalSchema.parse(body);

    // Verificar se é revisão ou nova proposta
    let proposal;

    if (validated.isRevision) {
      // Criar nova versão (revisão)
      proposal = await createRevision({
        orderId,
        productionInfo: validated.productionInfo,
        estimatedValue: validated.estimatedValue,
        adminNote: validated.adminNote,
        createdByAdminId: session.user.id,
      });
    } else {
      // Verificar se já existe proposta em rascunho
      const existingDraft = await getLatestProposal(orderId);
      
      if (existingDraft?.status === "DRAFT") {
        // Atualizar rascunho existente (não implementado ainda - retorna erro)
        return NextResponse.json(
          { error: "Já existe rascunho. Use PUT para atualizar ou envie a proposta." },
          { status: 400 }
        );
      }

      // Criar nova proposta
      proposal = await createProposal({
        orderId,
        productionInfo: validated.productionInfo,
        estimatedValue: validated.estimatedValue,
        adminNote: validated.adminNote,
        createdByAdminId: session.user.id,
      });
    }

    // Se action=send, enviar imediatamente
    if (validated.action === "send") {
      proposal = await sendProposal({ proposalId: proposal.id });

      // Email será enviado pelo endpoint PATCH /api/orders/[id]
      // quando o OrderAdminActions chamar a ação "propose"
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
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[POST /api/admin/orders/[id]/proposals]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar proposta" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/orders/[id]/proposals
 * Lista histórico de propostas (admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const { getProposalHistory } = await import("@/services/proposals/ProposalService");
    
    const history = await getProposalHistory(orderId);

    return NextResponse.json({
      ok: true,
      proposals: history.map((p) => ({
        id: p.id,
        version: p.version,
        status: p.status,
        productionInfo: p.productionInfo,
        estimatedValue: p.estimatedValue,
        adminNote: p.adminNote,
        sentAt: p.sentAt,
        reviewedAt: p.reviewedAt,
        clientResponse: p.clientResponse,
        clientNote: p.clientNote,
        createdByAdmin: p.createdByAdmin
          ? {
              name: p.createdByAdmin.name,
              email: p.createdByAdmin.email,
            }
          : null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/orders/[id]/proposals]", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico de propostas" },
      { status: 500 }
    );
  }
}
