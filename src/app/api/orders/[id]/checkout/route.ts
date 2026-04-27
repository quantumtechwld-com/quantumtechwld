import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/app-url";
import { canAccessOrder } from "@/lib/auth/canAccessOrder";
import { getPersistedCurrency } from "@/services/finance/contractCurrency";

const isMock =
  !process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_SECRET_KEY === "sk_test_SUBSTITUIR" ||
  process.env.STRIPE_MOCK === "true";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const ORDER_TYPE_LABEL: Record<string, string> = {
  new_feature: "Nova funcionalidade",
  bug_fix:     "Correção de bug",
  new_project: "Novo projeto",
  support:     "Suporte",
  other:       "Outro",
};

type RouteParams = { params: Promise<{ id: string }> };

type CheckoutOrder = {
  type: string;
  description?: string | null;
  contractCurrency?: string | null;
  client: { email: string; name: string };
  payment?: { stripeSessionId: string; status: string } | null;
};

// ── Helpers privados (reduzem complexidade cognitiva de POST) ─────────────────

async function handleMockCheckout(
  id: string,
  amountCents: number,
  currency: string,
  baseUrl: string,
  stripeInstallment: { id: string; amountCents: number } | null,
  financial: { totalAmountCents: number; paidCents: number } | null,
): Promise<NextResponse> {
  const mockSessionId = `mock_${Date.now()}_${id}`;
  await db.payment.upsert({
    where: { orderId: id },
    create: {
      orderId:         id,
      stripeSessionId: mockSessionId,
      amountCents,
      currency: currency.toLowerCase(),
      status:   "PAID",
      paidAt:   new Date(),
    },
    update: {
      stripeSessionId: mockSessionId,
      amountCents,
      currency: currency.toLowerCase(),
      status:  "PAID",
      paidAt:  new Date(),
    },
  });
  // Actualizar OrderFinancial e parcela STRIPE se existir
  if (stripeInstallment && financial) {
    const nextPaidCents = Math.min(financial.paidCents + stripeInstallment.amountCents, financial.totalAmountCents);
    await db.paymentInstallment.update({
      where: { id: stripeInstallment.id },
      data: { status: "PAID", paidAt: new Date() },
    });
    await db.orderFinancial.update({
      where: { orderId: id },
      data: { paidCents: nextPaidCents, status: nextPaidCents >= financial.totalAmountCents ? "PAID" : "PARTIAL" },
    });
  }
  await db.order.update({ where: { id }, data: { status: "IN_PRODUCTION" } });
  return NextResponse.json({
    url:  `${baseUrl}/portal/orders/${id}/payment/success?session_id=${mockSessionId}`,
    mock: true,
  });
}

async function buildStripeSession(
  order: CheckoutOrder,
  id: string,
  amountCents: number,
  currency: string,
  baseUrl: string,
  stripeInstallment: { id: string } | null,
): Promise<NextResponse> {
  const { stripe } = await import("@/lib/stripe");

  // Reutiliza sessão existente se ainda válida
  if (order.payment?.stripeSessionId && order.payment.status === "PENDING") {
    const existing = await stripe.checkout.sessions.retrieve(order.payment.stripeSessionId);
    if (existing.status === "open" && existing.url) {
      return NextResponse.json({ url: existing.url });
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: order.client.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: amountCents,
          product_data: {
            name: `${ORDER_TYPE_LABEL[order.type] ?? order.type} — Pedido #${id.slice(-8).toUpperCase()}`,
            description: order.description?.slice(0, 255),
          },
        },
      },
    ],
    metadata: { orderId: id, ...(stripeInstallment ? { installmentId: stripeInstallment.id } : {}) },
    success_url: `${baseUrl}/portal/orders/${id}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${baseUrl}/portal/orders/${id}?payment=cancelled`,
  });

  await db.payment.upsert({
    where:  { orderId: id },
    create: {
      orderId:         id,
      stripeSessionId: checkoutSession.id,
      amountCents,
      currency: currency.toLowerCase(),
      status: "PENDING",
    },
    update: {
      stripeSessionId: checkoutSession.id,
      amountCents,
      currency: currency.toLowerCase(),
      status: "PENDING",
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // amountCents pode vir no body (parcela específica) — caso contrário usa estimatedValue
  const body = await req.json().catch(() => ({})) as { amountCents?: number };

  const order = await db.order.findUnique({
    where: { id },
    include: {
      client: { select: { email: true, name: true } },
      payment: true,
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessOrder(order, session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const PAYABLE_STATUSES = ["APPROVED", "IN_PRODUCTION", "IN_REVIEW", "REVIEW_APPROVED", "COMPLETED"];
  if (!PAYABLE_STATUSES.includes(order.status)) {
    return NextResponse.json({ error: "Pedido deve estar aprovado para pagamento" }, { status: 400 });
  }
  if (!order.estimatedValue || order.estimatedValue <= 0) {
    return NextResponse.json({ error: "Valor estimado inválido" }, { status: 400 });
  }

  const baseUrl = appUrl();

  // Buscar parcela pendente para ligar pagamento ao OrderFinancial
  const financial = await db.orderFinancial.findUnique({
    where: { orderId: id },
    include: {
      installments: {
        where: { status: "PENDING" },
        orderBy: { sequence: "asc" },
        take: 1,
      },
    },
  });
  const pendingInstallment = financial?.installments?.[0] ?? null;
  if (pendingInstallment && pendingInstallment.method !== "STRIPE") {
    return NextResponse.json({ error: "A parcela pendente deve ser paga pelo método manual definido na proposta." }, { status: 422 });
  }
  const stripeInstallment = pendingInstallment;
  const amountCents = stripeInstallment?.amountCents
    ?? (body.amountCents && Number.isInteger(body.amountCents) && body.amountCents > 0
      ? body.amountCents
      : Math.round(order.estimatedValue * 100));
  const chargeCurrency = getPersistedCurrency(stripeInstallment?.currency, financial?.currency, order.contractCurrency);

  if (isMock) return handleMockCheckout(id, amountCents, chargeCurrency, baseUrl, stripeInstallment, financial);

  return buildStripeSession(order, id, amountCents, chargeCurrency, baseUrl, stripeInstallment);
}

