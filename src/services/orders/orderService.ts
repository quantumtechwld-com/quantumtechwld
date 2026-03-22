// Service para operações de pedidos (esqueleto)
import { Order } from '@prisma/client';

export async function fetchOrders(): Promise<Order[]> {
  // Buscar pedidos do usuário autenticado
  return [];
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  // Buscar detalhes do pedido
  return null;
}
