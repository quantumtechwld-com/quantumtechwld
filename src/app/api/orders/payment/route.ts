// Esqueleto da rota de API para pagamentos
import { NextRequest, NextResponse } from 'next/server';
import { createPayment } from '@/services/orders/paymentService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount } = body;
    if (!orderId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Parâmetros obrigatórios: orderId e amount.' }, { status: 422 });
    }
    // Chama o service (mock por enquanto)
    const payment = await createPayment(orderId, amount);
    if (!payment) {
      return NextResponse.json({ error: 'Falha ao criar pagamento.' }, { status: 500 });
    }
    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Erro ao processar pagamento.', detail: msg }, { status: 500 });
  }
}
