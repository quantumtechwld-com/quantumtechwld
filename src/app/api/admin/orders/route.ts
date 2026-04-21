import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createOrderWithRef,
  VALID_ORDER_TYPES,
  VALID_ORDER_URGENCIES,
} from "@/services/orders/createOrder";
import { sendMail, tplOrderProposalSent } from "@/lib/email";
import { appUrl } from "@/lib/app-url";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const VALID_STATUSES = [
  "DRAFT",
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
  /** Campos opcionais de proposta — se fornecidos, o pedido nasce em PROPOSAL_SENT */
  productionInfo?: string;
  estimatedValue?: number;
  adminNote?: string;
};

type AdminOrderCreateInput = {
  clientId: string;
  type: typeof VALID_ORDER_TYPES[number];
  title: string;
  description: string;
  urgency: typeof VALID_ORDER_URGENCIES[number];
  attachments: string[];
  productionInfo?: string;
  estimatedValue?: number;
  adminNote?: string;
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
    ...(body.productionInfo?.trim() ? {
      productionInfo: body.productionInfo.trim(),
      estimatedValue: body.estimatedValue,
      adminNote: body.adminNote?.trim() || undefined,
    } : {}),
  };
}

function isValidationError(value: AdminOrderCreateInput | ValidationError): value is ValidationError {
  return "error" in value;
}

async function resolveAdminAndClient(session: AdminSession, clientId: string) {
  const [adminUser, clientUser] = await Promise.all([
    session?.user?.id
      ? Promise.resolve({ id: session.user.id, email: session.user.email })
      : prisma.user.findUnique({ where: { email: session?.user?.email ?? "" }, select: { id: true, email: true } }),
    prisma.user.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, email: true, company: true, role: true, status: true },
    }),
  ]);

  return { adminUser, clientUser };
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

    if (!adminUser?.id) {
      return NextResponse.json({ error: "Admin não encontrado." }, { status: 404 });
    }
    if (!clientUser?.email) {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    }
    if (clientUser.role !== "CLIENT") {
      return NextResponse.json({ error: "O utilizador selecionado não é um cliente." }, { status: 422 });
    }
    if (clientUser.status !== "ACTIVE") {
      return NextResponse.json({ error: "Só é possível criar pedido para clientes ativos." }, { status: 422 });
    }

    const clientName = (clientUser.company?.trim() || clientUser.name?.trim() || clientUser.email) ?? "CLIENT";
    const order = await createOrderWithRef({
      clientId: clientUser.id,
      clientName,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      urgency: payload.urgency,
      attachments: payload.attachments,
      createdByAdminId: adminUser.id,
      productionInfo: payload.productionInfo,
      estimatedValue: payload.estimatedValue,
      adminNote: payload.adminNote,
    });

    if (!order) {
      return NextResponse.json({ error: "Erro ao gerar referência do pedido. Tente novamente." }, { status: 500 });
    }

    // Se o pedido foi criado directamente com proposta, notificar o cliente por email
    if (order.status === "PROPOSAL_SENT" && clientUser.email) {
      const orderUrl = `${appUrl()}/portal/orders/${order.id}`;
      sendMail({
        to: clientUser.email,
        subject: "Proposta recebida — Quantum Technology",
        html: tplOrderProposalSent({
          clientName: clientUser.name ?? "",
          orderType: order.type,
          orderTitle: order.title ?? undefined,
          estimatedValue: order.estimatedValue ?? 0,
          productionInfo: order.productionInfo ?? "",
          orderUrl,
        }),
      }).catch((err: unknown) => console.error("[POST /api/admin/orders] email error", err));
    }

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
