// Service para operações de pagamento (esqueleto)
import { Payment } from '@prisma/client';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendMail, tplOrderPaymentConfirmed, tplOrderPaymentConfirmedAdmin } from '@/lib/email';
import { appUrl } from '@/lib/app-url';
import { getPersistedCurrency } from '@/services/finance/contractCurrency';

export async function createPayment(orderId: string, amount: number): Promise<Payment | null> {
  // Busca o pedido
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client:       { select: { email: true, name: true } },
      organization: { select: { name: true } },
    },
  });
  if (!order) return null;

  const paymentCurrency = getPersistedCurrency((order as { contractCurrency?: string | null }).contractCurrency);

  // Guard: impede criação de múltiplos pagamentos para o mesmo pedido
  const existing = await prisma.payment.findUnique({ where: { orderId } });
  if (existing) return existing;
  // Cria PaymentIntent no Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe espera centavos
    currency: paymentCurrency.toLowerCase(),
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
      currency: paymentCurrency,
      status: 'PENDING',
    },
  });

  // Envia e-mail de confirmação para cliente e admin
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_SERVER_USER ?? '';
  const baseUrl = appUrl();
  if (order.client.email) {
    sendMail({
      to: order.client.email,
      subject: '[DevFlow] Pagamento iniciado',
      html: tplOrderPaymentConfirmed({
        clientName: (order as { organization?: { name: string } | null }).organization?.name?.trim() ?? order.client.name ?? '',
        orderType: order.type,
        orderUrl: `${baseUrl}/portal/orders/${orderId}`,
        amountCents: payment.amountCents,
        currency: paymentCurrency,
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
        currency: paymentCurrency,
      }),
    }).catch(() => {});
  }

  return payment;
}

export async function fetchPaymentByOrderId(orderId: string): Promise<Payment | null> {
  return prisma.payment.findFirst({ where: { orderId } });
}
