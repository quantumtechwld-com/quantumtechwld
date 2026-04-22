import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/app-url";

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
  if (order.client.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (order.status !== "APPROVED") {
    return NextResponse.json({ error: "Pedido deve estar Aprovado para pagamento" }, { status: 400 });
  }
  if (!order.estimatedValue || order.estimatedValue <= 0) {
    return NextResponse.json({ error: "Valor estimado inválido" }, { status: 400 });
  }

  // Usar amountCents do body (parcela) se válido, caso contrário usar estimatedValue total
  const amountCents =
    body.amountCents && Number.isInteger(body.amountCents) && body.amountCents > 0
      ? body.amountCents
      : Math.round(order.estimatedValue * 100);
  const baseUrl = appUrl();

  // SENSIVEL: cobranca real nao pode seguir idioma do usuario.
  // O valor persistido em estimatedValue e interpretado neste fluxo como EUR.
  // Para suportar multi-currency real, e obrigatorio persistir a moeda da proposta
  // e aplicar conversao cambial explicita antes de criar a sessao Stripe.

  // ── MODO MOCK: sem chave Stripe real ─────────────────────────────────────
  if (isMock) {
    const mockSessionId = `mock_${Date.now()}_${id}`;
    await db.payment.upsert({
      where: { orderId: id },
      create: {
        orderId:         id,
        stripeSessionId: mockSessionId,
        amountCents,
        currency: "eur",
        status:   "PAID",
        paidAt:   new Date(),
      },
      update: {
        stripeSessionId: mockSessionId,
        amountCents,
        status:  "PAID",
        paidAt:  new Date(),
      },
    });
    // Avança o pedido para IN_PRODUCTION
    await db.order.update({
      where: { id },
      data:  { status: "IN_PRODUCTION" },
    });
    return NextResponse.json({
      url:  `${baseUrl}/portal/orders/${id}/payment/success?session_id=${mockSessionId}`,
      mock: true,
    });
  }
  // ─────────────────────────────────────────────────────────────────────────

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
          currency: "eur",
          unit_amount: amountCents,
          product_data: {
            name: `${ORDER_TYPE_LABEL[order.type] ?? order.type} — Pedido #${id.slice(-8).toUpperCase()}`,
            description: order.description?.slice(0, 255),
          },
        },
      },
    ],
    metadata: { orderId: id },
    success_url: `${baseUrl}/portal/orders/${id}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${baseUrl}/portal/orders/${id}?payment=cancelled`,
  });

  await db.payment.upsert({
    where:  { orderId: id },
    create: {
      orderId:         id,
      stripeSessionId: checkoutSession.id,
      amountCents,
      currency: "eur",
      status: "PENDING",
    },
    update: {
      stripeSessionId: checkoutSession.id,
      amountCents,
      status: "PENDING",
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

