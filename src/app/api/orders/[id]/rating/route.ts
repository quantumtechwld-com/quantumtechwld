import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessOrder } from "@/lib/auth/canAccessOrder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as { score?: number; comment?: string };

    if (!body.score || !Number.isInteger(body.score) || body.score < 1 || body.score > 5) {
      return NextResponse.json({ error: "Pontuação inválida (1–5)." }, { status: 422 });
    }

    const order = await db.order.findUnique({
      where: { id },
      include: {
        client:  { select: { email: true } },
        rating:  true,
      },
    });

    if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    if (!canAccessOrder(order, session.user)) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
    if (order.status !== "COMPLETED") {
      return NextResponse.json({ error: "Só é possível avaliar pedidos concluídos." }, { status: 422 });
    }
    if (order.rating) {
      return NextResponse.json({ error: "Este pedido já foi avaliado." }, { status: 409 });
    }

    const rating = await db.orderRating.create({
      data: {
        orderId: id,
        score:   body.score,
        comment: body.comment?.trim() || null,
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders/[id]/rating]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
