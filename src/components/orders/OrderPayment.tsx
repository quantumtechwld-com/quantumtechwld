import React from 'react';

export interface OrderPaymentProps {
  orderId: string;
  amount?: number;
}

export default function OrderPayment({ orderId, amount }: Readonly<OrderPaymentProps>) {
  return (
    <div className="border rounded p-4 mt-4">
      <h3 className="font-bold mb-2">Pagamento do Pedido #{orderId}</h3>
      {typeof amount === 'number' && <p>Valor: R$ {amount.toFixed(2)}</p>}
      <button className="mt-2 px-4 py-2 bg-accent text-white rounded" disabled>
        Pagar com Stripe (em breve)
      </button>
    </div>
  );
}
