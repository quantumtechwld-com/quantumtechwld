import "server-only";

import { prisma } from "@/lib/prisma";
import { generateOrderRefCandidates } from "@/lib/order-ref";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const VALID_ORDER_TYPES = ["new_feature", "bug_fix", "new_project", "support", "other", "contact"] as const;
export const VALID_ORDER_URGENCIES = ["low", "normal", "high", "critical"] as const;

export type CreateOrderInput = {
  clientId: string;
  clientName: string;
  type: string;
  title: string;
  description: string;
  urgency: string;
  attachments: string[];
  createdByAdminId?: string | null;
  /** Se fornecido, o pedido é criado directamente em PROPOSAL_SENT */
  productionInfo?: string;
  estimatedValue?: number;
  adminNote?: string | null;
};

/** Cria o pedido com orderRef único num único INSERT — sem race condition. */
export async function createOrderWithRef(input: CreateOrderInput) {
  const hasProposal = input.productionInfo?.trim();

  const orderData = {
    clientId: input.clientId,
    type: input.type,
    title: input.title,
    description: input.description,
    urgency: input.urgency,
    attachments: input.attachments,
    status: hasProposal ? "PROPOSAL_SENT" : "PENDING",
    ...(input.createdByAdminId ? { createdByAdminId: input.createdByAdminId } : {}),
    ...(hasProposal
      ? {
          productionInfo: input.productionInfo!.trim(),
          estimatedValue: input.estimatedValue,
          adminNote: input.adminNote?.trim() ?? null,
          respondedAt: new Date(),
        }
      : {}),
  };

  for (const candidate of generateOrderRefCandidates(input.clientName, new Date(), 5)) {
    try {
      return await db.order.create({
        data: { ...orderData, orderRef: candidate },
        include: {
          client: { select: { id: true, name: true, email: true } },
          createdByAdmin: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === "P2002") continue;
      throw error;
    }
  }

  return null;
}