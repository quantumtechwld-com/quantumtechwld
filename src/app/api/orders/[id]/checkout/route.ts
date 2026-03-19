import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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

  // Reutiliza sessão existente se ainda válida
  if (order.payment?.stripeSessionId && order.payment.status === "PENDING") {
    const existing = await stripe.checkout.sessions.retrieve(order.payment.stripeSessionId);
    if (existing.status === "open" && existing.url) {
      return NextResponse.json({ url: existing.url });
    }
  }

  const amountCents = Math.round(order.estimatedValue * 100);
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

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

  // Upsert payment record
  await db.payment.upsert({
    where:  { orderId: id },
    create: {
      orderId:        id,
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
