import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendMail, tplOrderPaymentConfirmed, tplOrderPaymentConfirmedAdmin } from "@/lib/email";
import { appUrl } from "@/lib/app-url";
import type Stripe from "stripe";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// ─── helpers ─────────────────────────────────────────────────────────────────

async function handleInstallmentPaid(
  orderId: string,
  installmentId: string,
  paymentIntentId: string | null,
): Promise<void> {
  const now = new Date();
  await db.paymentInstallment.update({
    where: { id: installmentId },
    data: { status: "PAID", stripePaymentIntent: paymentIntentId, paidAt: now },
  });

  const financial = await db.orderFinancial.findUnique({
    where: { orderId },
    include: { installments: { select: { amountCents: true, status: true } } },
  });
  if (!financial) return;

  const paid = (financial.installments as Array<{ amountCents: number; status: string }>)
    .filter((i) => i.status === "PAID");
  const paidCents = paid.reduce((s: number, i: { amountCents: number }) => s + i.amountCents, 0);
  const allPaid   = paidCents >= financial.totalAmountCents;

  await db.orderFinancial.update({
    where: { orderId },
    data: { paidCents, status: allPaid ? "PAID" : "PARTIAL" },
  });

  // Primeira parcela paga → mover pedido para IN_PRODUCTION
  if (paid.length === 1) {
    await db.order.update({ where: { id: orderId }, data: { status: "IN_PRODUCTION" } });
  }
}

async function handleSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const orderId       = session.metadata?.orderId;
  const installmentId = session.metadata?.installmentId;
  if (!orderId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  if (installmentId) {
    await handleInstallmentPaid(orderId, installmentId, paymentIntentId);
  } else {
    // Fluxo legado — atualizar Payment se existir
    await db.payment.update({
      where: { stripeSessionId: session.id },
      data: { status: "PAID", stripePaymentIntent: paymentIntentId, paidAt: new Date() },
    }).catch(() => null);
  }

  // Garantir IN_PRODUCTION (cobre ambos os fluxos)
  const order = await db.order.update({
    where: { id: orderId },
    data:  { status: "IN_PRODUCTION" },
    include: { client: { select: { name: true, email: true } } },
  });

  const baseUrl    = appUrl();
  const adminEmail = process.env.EMAIL_ADMIN ?? process.env.EMAIL_FROM ?? "";

  if (order.client.email) {
    sendMail({
      to: order.client.email,
      subject: "Pagamento confirmado — o seu pedido está em produção",
      html: tplOrderPaymentConfirmed({
        clientName:  order.client.name ?? "",
        orderType:   order.type,
        orderUrl:    `${baseUrl}/portal/orders/${orderId}`,
        amountCents: session.amount_total ?? 0,
      }),
    }).catch(() => null);
  }

  sendMail({
    to: adminEmail,
    subject: "Pagamento confirmado — pedido entrou em produção",
    html: tplOrderPaymentConfirmedAdmin({
      clientEmail: order.client.email ?? "",
      orderType:   order.type,
      adminUrl:    `${baseUrl}/admin/orders/${orderId}`,
      amountCents: session.amount_total ?? 0,
    }),
  }).catch(() => null);
}

async function handlePaymentFailed(sessionId: string): Promise<void> {
  await db.paymentInstallment
    .updateMany({ where: { stripeSessionId: sessionId, status: "PENDING" }, data: { status: "FAILED" } })
    .catch(() => null);
  await db.payment
    .updateMany({ where: { stripeSessionId: sessionId, status: "PENDING" }, data: { status: "FAILED" } })
    .catch(() => null);
}

// ─── POST /api/webhooks/stripe ───────────────────────────────────────────────

// Stripe requires the raw body for signature verification.
// Next.js App Router: read raw bytes via request.arrayBuffer()
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.arrayBuffer();
    event = stripe.webhooks.constructEvent(Buffer.from(rawBody), sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleSessionCompleted(event.data.object as unknown as Stripe.Checkout.Session);
  }

  if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
    const obj = event.data.object as unknown as Stripe.Checkout.Session | Stripe.PaymentIntent;
    const sessionId = "id" in obj ? obj.id : null;
    if (sessionId) await handlePaymentFailed(sessionId);
  }

  return NextResponse.json({ received: true });
}
