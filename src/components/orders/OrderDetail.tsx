import React from 'react';

interface OrderDetailProps {
  orderId: string;
  type?: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

export default function OrderDetail({ orderId, type, description, status, createdAt }: Readonly<OrderDetailProps>) {
  return (
    <div className="border rounded p-4">
      <h2 className="font-bold mb-2">Pedido #{orderId}</h2>
      {type && <div className="text-sm">Tipo: {type}</div>}
      {description && <div className="text-sm">Descrição: {description}</div>}
      {status && <div className="text-sm">Status: {status}</div>}
      {createdAt && <div className="text-xs text-gray-400 mt-1">{new Date(createdAt).toLocaleDateString('pt-BR')}</div>}
      {/* Renderizar detalhes adicionais do pedido aqui */}
    </div>
  );
}
