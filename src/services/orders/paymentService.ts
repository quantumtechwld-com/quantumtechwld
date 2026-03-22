// Service para operações de pagamento (esqueleto)
import { Payment } from '@prisma/client';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendMail, tplOrderPaymentConfirmed, tplOrderPaymentConfirmedAdmin } from '@/lib/email';

export async function createPayment(orderId: string, amount: number): Promise<Payment | null> {
  // Busca o pedido
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: { select: { email: true, name: true } } },
  });
  if (!order) return null;

  // Cria PaymentIntent no Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe espera centavos
    currency: 'eur',
    metadata: { orderId },
    receipt_email: order.client.email ?? undefined,
  });

  // Salva pagamento no banco
  const payment = await prisma.payment.create({
    data: {
      orderId,
      stripePaymentIntent: paymentIntent.id,
      stripeSessionId: "",
      amountCents: Math.round(amount * 100),
      status: 'PENDING',
    },
  });

  // Envia e-mail de confirmação para cliente e admin
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_SERVER_USER ?? '';
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  if (order.client.email) {
    sendMail({
      to: order.client.email,
      subject: '[DevFlow] Pagamento iniciado',
      html: tplOrderPaymentConfirmed({
        clientName: order.client.name ?? '',
        orderType: order.type,
        orderUrl: `${baseUrl}/portal/orders/${orderId}`,
        amountCents: payment.amountCents,
      }),
    }).catch(() => {});
  }
  if (adminEmail) {
    sendMail({
      to: adminEmail,
      subject: '[DevFlow] Novo pagamento iniciado',
      html: tplOrderPaymentConfirmedAdmin({
        clientEmail: order.client.email ?? '',
        orderType: order.type,
        adminUrl: `${baseUrl}/admin/orders/${orderId}`,
        amountCents: payment.amountCents,
      }),
    }).catch(() => {});
  }

  return payment;
}

export async function fetchPaymentByOrderId(orderId: string): Promise<Payment | null> {
  return prisma.payment.findFirst({ where: { orderId } });
}
