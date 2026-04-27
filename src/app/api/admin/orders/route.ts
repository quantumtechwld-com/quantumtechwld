import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createOrderWithRef,
  VALID_ORDER_TYPES,
  VALID_ORDER_URGENCIES,
} from "@/services/orders/createOrder";
import {
  buildInstallments,
  lockContractAmount,
  resolveContractCurrency,
  validatePaymentMethodCurrency,
} from "@/services/finance/contractCurrency";
import { sendMail, tplOrderProposalSent } from "@/lib/email";
import { appUrl } from "@/lib/app-url";
import { normalizeSupportedCurrency } from "@/lib/currency";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const VALID_STATUSES = [
  "DRAFT",          // existe no schema Prisma mas nunca é atribuído pelo fluxo normal
  "PENDING",
  "EVALUATING",
  "PROPOSAL_SENT",
  "APPROVED",
  "REVISION",
  "REJECTED",
  "IN_PRODUCTION",
  "COMPLETED",
] as const;

type CreateOrderBody = {
  clientId?: string;
  type?: string;
  title?: string;
  description?: string;
  urgency?: string;
  attachments?: string[];
  /** ID do pedido original — obrigatório para tipos correction e alteration */
  parentOrderId?: string;
  /** Campos opcionais de proposta — se fornecidos, o pedido nasce em PROPOSAL_SENT */
  productionInfo?: string;
  estimatedValue?: number;
  adminNote?: string;
  downPaymentPct?: number;
  paymentMethod?: string;
  selectedCurrency?: string;
};

type AdminOrderCreateInput = {
  clientId: string;
  type: typeof VALID_ORDER_TYPES[number];
  title: string;
  description: string;
  urgency: typeof VALID_ORDER_URGENCIES[number];
  attachments: string[];
  parentOrderId?: string;
  productionInfo?: string;
  estimatedValue?: number;
  adminNote?: string;
  downPaymentPct?: number;
  paymentMethod?: string;
  selectedCurrency?: string;
};

type ValidationError = { error: string; status: number };
type AdminSession = {
  user?: {
    id?: string;
    email?: string | null;
  };
} | null;

function validateCreateOrderBody(body: CreateOrderBody): AdminOrderCreateInput | ValidationError {
  if (!body.clientId) {
    return { error: "Cliente é obrigatório.", status: 422 };
  }
  if (!body.type || !VALID_ORDER_TYPES.includes(body.type as typeof VALID_ORDER_TYPES[number])) {
    return { error: "Tipo de pedido inválido.", status: 422 };
  }
  if (!body.title?.trim() || body.title.trim().length > 120) {
    return { error: "Título obrigatório (máx. 120 caracteres).", status: 422 };
  }
  if (!body.description?.trim()) {
    return { error: "A descrição é obrigatória.", status: 422 };
  }
  if (body.urgency && !VALID_ORDER_URGENCIES.includes(body.urgency as typeof VALID_ORDER_URGENCIES[number])) {
    return { error: "Urgência inválida.", status: 422 };
  }

  return {
    clientId: body.clientId,
    type: body.type as typeof VALID_ORDER_TYPES[number],
    title: body.title.trim(),
    description: body.description.trim(),
    urgency: (body.urgency ?? "normal") as typeof VALID_ORDER_URGENCIES[number],
    attachments: body.attachments ?? [],
    ...(body.parentOrderId ? { parentOrderId: body.parentOrderId } : {}),
    ...(body.productionInfo?.trim() ? {
      productionInfo: body.productionInfo.trim(),
      estimatedValue: body.estimatedValue,
      adminNote: body.adminNote?.trim() || undefined,
      downPaymentPct: body.downPaymentPct,
      paymentMethod: body.paymentMethod,
      selectedCurrency: body.selectedCurrency,
    } : {}),
  };
}

function isValidationError(value: AdminOrderCreateInput | ValidationError): value is ValidationError {
  return "error" in value;
}

async function resolveProposalTerms(
  clientUser: Awaited<ReturnType<typeof resolveAdminAndClient>>["clientUser"],
  payload: AdminOrderCreateInput,
) {
  const paymentMethod = payload.paymentMethod ?? "STRIPE";
  if (!payload.productionInfo || payload.estimatedValue == null || payload.estimatedValue < 0) {
    return { paymentMethod, lockedTerms: null as Awaited<ReturnType<typeof lockContractAmount>> | null, error: null as string | null };
  }

  if (!normalizeSupportedCurrency(payload.selectedCurrency ?? null)) {
    return { paymentMethod, lockedTerms: null as Awaited<ReturnType<typeof lockContractAmount>> | null, error: "Moeda da proposta inválida." };
  }

  const contractCurrency = resolveContractCurrency({
    explicitCurrency: payload.selectedCurrency ?? null,
    organizationCurrency: clientUser.organization?.billingCurrency ?? null,
    userCurrency: clientUser.billingCurrency ?? null,
    locale: clientUser.locale ?? null,
  });
  const error = validatePaymentMethodCurrency(paymentMethod, contractCurrency);
  if (error) {
    return { paymentMethod, lockedTerms: null as Awaited<ReturnType<typeof lockContractAmount>> | null, error };
  }

  const lockedTerms = await lockContractAmount({
    baseAmount: payload.estimatedValue,
    contractCurrency,
  });

  return { paymentMethod, lockedTerms, error: null as string | null };
}

async function createFinancialForOrder(
  orderId: string,
  totalCents: number,
  contractCurrency: string,
  downPaymentPct: number,
  paymentMethod: string,
) {
  await db.orderFinancial.deleteMany({ where: { orderId } });
  const installments = buildInstallments(totalCents, contractCurrency as "BRL" | "EUR" | "USD", downPaymentPct, paymentMethod);
  await db.orderFinancial.create({
    data: {
      orderId,
      totalAmountCents: totalCents,
      currency: contractCurrency,
      downPaymentPct,
      paidCents: 0,
      status: "PENDING",
      installments: {
        create: installments.map(({ sequence, amountCents, currency, method }) => ({
          sequence,
          amountCents,
          currency,
          method,
          status: "PENDING",
        })),
      },
    },
  });
}

async function handleCreatedOrderSideEffects(params: {
  order: {
    id: string;
    status: string;
    type: string;
    title?: string | null;
    estimatedValue?: number | null;
    contractCurrency?: string | null;
    productionInfo?: string | null;
  };
  clientUser: {
    email?: string | null;
    name?: string | null;
    organizationId?: string | null;
    organization?: { name?: string | null } | null;
  };
  lockedTerms: Awaited<ReturnType<typeof lockContractAmount>> | null;
  payload: AdminOrderCreateInput;
  paymentMethod: string;
}) {
  const { order, clientUser, lockedTerms, payload, paymentMethod } = params;

  if (order.status === "PROPOSAL_SENT" && order.estimatedValue != null && order.estimatedValue > 0) {
    const totalCents = lockedTerms?.totalAmountCents ?? Math.round(order.estimatedValue * 100);
    const pct = Math.max(0, Math.min(99, Math.round(payload.downPaymentPct ?? 0)));
    const contractCurrency = lockedTerms?.contractCurrency ?? order.contractCurrency ?? "EUR";
    await createFinancialForOrder(order.id, totalCents, contractCurrency, pct, paymentMethod);
  }

  if (clientUser.organizationId && order.contractCurrency) {
    await db.organization.updateMany({
      where: { id: clientUser.organizationId, billingCurrency: null },
      data: { billingCurrency: order.contractCurrency },
    });
  }

  if (order.status === "PROPOSAL_SENT" && clientUser.email) {
    const orderUrl = `${appUrl()}/portal/orders/${order.id}`;
    sendMail({
      to: clientUser.email,
      subject: "Proposta recebida — Quantum Technology",
      html: tplOrderProposalSent({
        clientName: clientUser.organization?.name?.trim() ?? clientUser.name ?? "",
        orderType: order.type,
        orderTitle: order.title ?? undefined,
        estimatedValue: order.estimatedValue ?? 0,
        estimatedCurrency: order.contractCurrency ?? "EUR",
        productionInfo: order.productionInfo ?? "",
        orderUrl,
      }),
    }).catch((err: unknown) => console.error("[POST /api/admin/orders] email error", err));
  }
}

async function resolveAdminAndClient(session: AdminSession, clientId: string) {
  const [adminUser, clientUser] = await Promise.all([
    session?.user?.id
      ? Promise.resolve({ id: session.user.id, email: session.user.email })
      : prisma.user.findUnique({ where: { email: session?.user?.email ?? "" }, select: { id: true, email: true } }),
    db.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        locale: true,
        billingCurrency: true,
        role: true,
        status: true,
        organizationId: true,
        organization: { select: { id: true, name: true, billingCurrency: true } },
      },
    }),
  ]);

  return { adminUser, clientUser };
}

function validateAdminAndClient(adminUser: { id?: string } | null | undefined, clientUser: {
  email?: string | null;
  role?: string | null;
  status?: string | null;
} | null | undefined): ValidationError | null {
  if (!adminUser?.id) {
    return { error: "Admin não encontrado.", status: 404 };
  }
  if (!clientUser?.email) {
    return { error: "Cliente não encontrado.", status: 404 };
  }
  if (clientUser.role !== "CLIENT") {
    return { error: "O utilizador selecionado não é um cliente.", status: 422 };
  }
  if (clientUser.status !== "ACTIVE") {
    return { error: "Só é possível criar pedido para clientes ativos.", status: 422 };
  }

  return null;
}

// ─── GET /api/admin/orders ───────────────────────────────────────────────────
// Query params:
//   status  – filter by OrderStatus
//   clientId – filter by client id
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const clientId   = searchParams.get("clientId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};
    if (statusParam && (VALID_STATUSES as readonly string[]).includes(statusParam)) {
      where.status = statusParam;
    }
    if (clientId) {
      where.clientId = clientId;
    }

    const orders = await db.order.findMany({
      where,
      include: { client: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ orders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/admin/orders]", err);
    return NextResponse.json(
      { error: "Erro ao carregar pedidos.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}

// ─── POST /api/admin/orders ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = (await request.json()) as CreateOrderBody;
    const payload = validateCreateOrderBody(body);
    if (isValidationError(payload)) {
      return NextResponse.json({ error: payload.error }, { status: payload.status });
    }

    const { adminUser, clientUser } = await resolveAdminAndClient(session, payload.clientId);

    const actorError = validateAdminAndClient(adminUser, clientUser);
    if (actorError) {
      return NextResponse.json({ error: actorError.error }, { status: actorError.status });
    }
    const adminId = (adminUser as { id: string }).id;

    const clientName = (clientUser.organization?.name?.trim() || clientUser.company?.trim() || clientUser.name?.trim() || clientUser.email) ?? "CLIENT";
    const { paymentMethod, lockedTerms, error: proposalError } = await resolveProposalTerms(clientUser, payload);
    if (proposalError) {
      return NextResponse.json({ error: proposalError }, { status: 422 });
    }

    const order = await createOrderWithRef({
      clientId: clientUser.id,
      clientName,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      urgency: payload.urgency,
      attachments: payload.attachments,
      createdByAdminId: adminId,
      parentOrderId: payload.parentOrderId,
      productionInfo: payload.productionInfo,
      estimatedValue: lockedTerms?.estimatedValue ?? payload.estimatedValue,
      contractCurrency: lockedTerms?.contractCurrency ?? null,
      contractFxRate: lockedTerms?.contractFxRate ?? null,
      contractFxLockedAt: lockedTerms?.contractFxLockedAt ?? null,
      adminNote: payload.adminNote,
      organizationId: clientUser.organizationId ?? null,
    });

    if (!order) {
      return NextResponse.json({ error: "Erro ao gerar referência do pedido. Tente novamente." }, { status: 500 });
    }

    await handleCreatedOrderSideEffects({ order, clientUser, lockedTerms, payload, paymentMethod });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/admin/orders]", err);
    return NextResponse.json(
      { error: "Erro ao criar pedido admin.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}
