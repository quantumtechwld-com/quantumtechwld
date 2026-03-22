import React, { useEffect, useState } from 'react';
import OrderStatusBadge from './OrderStatusBadge';

interface Order {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando pedidos...</div>;
  if (orders.length === 0) return <div>Nenhum pedido encontrado.</div>;

  return (
    <ul className="space-y-4">
      {orders.map(order => (
        <li key={order.id} className="border rounded p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">{order.type}</div>
            <div className="text-sm text-gray-500">{order.description}</div>
            <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</div>
          </div>
          <OrderStatusBadge status={order.status} />
        </li>
      ))}
    </ul>
  );
}
