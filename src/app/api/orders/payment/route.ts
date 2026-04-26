import { NextRequest, NextResponse } from 'next/server';
import { createPayment } from '@/services/orders/paymentService';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { canAccessOrder } from '@/lib/auth/canAccessOrder';

export async function POST(req: NextRequest) {
  try {
    // Autenticação obrigatória
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = await req.json() as { orderId?: unknown };
    const { orderId } = body;
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Parâmetro obrigatório: orderId.' }, { status: 422 });
    }

    // Verificar que o pedido existe e pertence ao utilizador autenticado (ou à sua organização)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, estimatedValue: true, organizationId: true, client: { select: { email: true } } },
    });
    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }
    if (!canAccessOrder(order, session.user)) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
    }
    if (!order.estimatedValue) {
      return NextResponse.json({ error: 'Pedido ainda sem valor estimado.' }, { status: 409 });
    }

    // Usar o valor da BD — nunca confiar no body para o amount
    const payment = await createPayment(orderId, order.estimatedValue);
    if (!payment) {
      return NextResponse.json({ error: 'Falha ao criar pagamento.' }, { status: 500 });
    }
    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento.', detail: process.env.NODE_ENV === 'production' ? undefined : msg },
      { status: 500 }
    );
  }
}
