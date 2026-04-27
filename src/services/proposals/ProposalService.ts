/**
 * ProposalService — Gestão de propostas de pedidos com versionamento
 * 
 * Responsável por criar, enviar, revisar e gerenciar propostas de execução
 * e orçamento para pedidos, mantendo histórico completo de versões.
 */

import { prisma } from "@/lib/prisma";
import type { OrderProposalStatus, OrderStatus } from "@prisma/client";

export interface CreateProposalInput {
  orderId: string;
  productionInfo: string;
  estimatedValue: number;
  adminNote?: string;
  createdByAdminId?: string;
}

export interface SendProposalInput {
  proposalId: string;
}

export interface CreateRevisionInput {
  orderId: string;
  productionInfo: string;
  estimatedValue: number;
  adminNote?: string;
  createdByAdminId?: string;
  reason?: string; // motivo da revisão (do cliente)
}

export interface RespondToProposalInput {
  proposalId: string;
  response: "approved" | "revision" | "rejected";
  clientNote?: string;
}

/**
 * Cria uma nova proposta em rascunho para um pedido.
 * Se já existir proposta enviada, cria como nova versão.
 */
export async function createProposal(input: CreateProposalInput) {
  // Buscar última versão existente
  const lastProposal = await prisma.orderProposal.findFirst({
    where: { orderId: input.orderId },
    orderBy: { version: "desc" },
  });

  const nextVersion = lastProposal ? lastProposal.version + 1 : 1;

  const proposal = await prisma.orderProposal.create({
    data: {
      orderId: input.orderId,
      version: nextVersion,
      status: "DRAFT",
      productionInfo: input.productionInfo,
      estimatedValue: input.estimatedValue,
      adminNote: input.adminNote,
      createdByAdminId: input.createdByAdminId,
    },
    include: {
      order: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  return proposal;
}

/**
 * Envia proposta ao cliente.
 * Marca versões anteriores como SUPERSEDED se existirem.
 */
export async function sendProposal(input: SendProposalInput) {
  const proposal = await prisma.orderProposal.findUnique({
    where: { id: input.proposalId },
    include: {
      order: true,
    },
  });

  if (!proposal) {
    throw new Error("Proposta não encontrada");
  }

  if (proposal.status !== "DRAFT") {
    throw new Error("Apenas propostas em rascunho podem ser enviadas");
  }

  // Marcar versões anteriores como SUPERSEDED
  await prisma.orderProposal.updateMany({
    where: {
      orderId: proposal.orderId,
      version: { lt: proposal.version },
      status: { in: ["SENT", "DRAFT"] },
    },
    data: {
      status: "SUPERSEDED",
    },
  });

  // Atualizar proposta atual
  const updatedProposal = await prisma.orderProposal.update({
    where: { id: proposal.id },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
    include: {
      order: {
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              locale: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Atualizar status do pedido
  await prisma.order.update({
    where: { id: proposal.orderId },
    data: {
      status: "PROPOSAL_SENT",
      respondedAt: new Date(),
    },
  });

  return updatedProposal;
}

/**
 * Cria uma nova versão de proposta (revisão).
 * Marca a versão anterior como REVISION.
 */
export async function createRevision(input: CreateRevisionInput) {
  // Buscar última proposta
  const lastProposal = await prisma.orderProposal.findFirst({
    where: { orderId: input.orderId },
    orderBy: { version: "desc" },
  });

  if (!lastProposal) {
    throw new Error("Não existe proposta anterior para revisar");
  }

  // Marcar proposta anterior como REVISION se o status permitir
  if (lastProposal.status === "SENT") {
    await prisma.orderProposal.update({
      where: { id: lastProposal.id },
      data: {
        status: "REVISION",
        reviewedAt: new Date(),
        clientResponse: "revision",
        clientNote: input.reason,
      },
    });
  }

  // Criar nova versão
  const newProposal = await createProposal({
    orderId: input.orderId,
    productionInfo: input.productionInfo,
    estimatedValue: input.estimatedValue,
    adminNote: input.adminNote,
    createdByAdminId: input.createdByAdminId,
  });

  // Atualizar status do pedido
  await prisma.order.update({
    where: { id: input.orderId },
    data: {
      status: "REVISION",
    },
  });

  return newProposal;
}

/**
 * Cliente responde à proposta (aprovar, pedir revisão ou rejeitar).
 */
export async function respondToProposal(input: RespondToProposalInput) {
  const proposal = await prisma.orderProposal.findUnique({
    where: { id: input.proposalId },
    include: {
      order: true,
    },
  });

  if (!proposal) {
    throw new Error("Proposta não encontrada");
  }

  if (proposal.status !== "SENT") {
    throw new Error("Apenas propostas enviadas podem receber resposta");
  }

  const statusMap: Record<string, { proposalStatus: OrderProposalStatus; orderStatus: string }> = {
    approved: {
      proposalStatus: "APPROVED",
      orderStatus: "APPROVED",
    },
    revision: {
      proposalStatus: "REVISION",
      orderStatus: "REVISION",
    },
    rejected: {
      proposalStatus: "REJECTED",
      orderStatus: "REJECTED",
    },
  };

  const { proposalStatus, orderStatus } = statusMap[input.response];

  // Atualizar proposta
  const updatedProposal = await prisma.orderProposal.update({
    where: { id: input.proposalId },
    data: {
      status: proposalStatus,
      reviewedAt: new Date(),
      clientResponse: input.response,
      clientNote: input.clientNote,
    },
    include: {
      order: {
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Atualizar status do pedido
  await prisma.order.update({
    where: { id: proposal.orderId },
    data: {
      status: orderStatus as OrderStatus,
    },
  });

  return updatedProposal;
}

/**
 * Busca histórico completo de propostas de um pedido.
 */
export async function getProposalHistory(orderId: string) {
  const proposals = await prisma.orderProposal.findMany({
    where: { orderId },
    orderBy: { version: "desc" },
    include: {
      createdByAdmin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return proposals;
}

/**
 * Busca proposta ativa (última versão SENT, APPROVED ou DRAFT).
 */
export async function getActiveProposal(orderId: string) {
  const proposal = await prisma.orderProposal.findFirst({
    where: {
      orderId,
      status: { in: ["SENT", "APPROVED", "DRAFT"] },
    },
    orderBy: { version: "desc" },
    include: {
      createdByAdmin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return proposal;
}

/**
 * Busca última versão (independente do status).
 */
export async function getLatestProposal(orderId: string) {
  const proposal = await prisma.orderProposal.findFirst({
    where: { orderId },
    orderBy: { version: "desc" },
    include: {
      createdByAdmin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return proposal;
}

/**
 * Busca proposta específica por ID.
 */
export async function getProposalById(proposalId: string) {
  const proposal = await prisma.orderProposal.findUnique({
    where: { id: proposalId },
    include: {
      order: {
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              locale: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      createdByAdmin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return proposal;
}
