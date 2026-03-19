import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendMail, tplOrderPaymentConfirmed, tplOrderPaymentConfirmedAdmin } from "@/lib/email";
import type Stripe from "stripe";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

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
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      webhookSecret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) return NextResponse.json({ received: true });

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    // Update payment record
    await db.payment.update({
      where:  { stripeSessionId: session.id },
      data: {
        status:              "PAID",
        stripePaymentIntent: paymentIntentId,
        paidAt:              new Date(),
      },
    });

    // Advance order to IN_PRODUCTION
    const order = await db.order.update({
      where: { id: orderId },
      data:  { status: "IN_PRODUCTION" },
      include: { client: { select: { name: true, email: true } } },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const adminEmail = process.env.EMAIL_ADMIN ?? process.env.EMAIL_FROM ?? "";

    // Notify client
    if (order.client.email) {
      sendMail({
        to: order.client.email,
        subject: "Pagamento confirmado — o seu pedido está em produção",
        html: tplOrderPaymentConfirmed({
          clientName: order.client.name ?? "",
          orderType:  order.type,
          orderUrl:   `${baseUrl}/portal/orders/${orderId}`,
          amountCents: session.amount_total ?? 0,
        }),
      }).catch(() => null);
    }

    // Notify admin
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

  if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
    const obj = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;
    const sessionId = "id" in obj ? obj.id : null;
    if (sessionId) {
      await db.payment
        .updateMany({
          where: { stripeSessionId: sessionId, status: "PENDING" },
          data:  { status: "FAILED" },
        })
        .catch(() => null);
    }
  }

  return NextResponse.json({ received: true });
}
