import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// GET /api/admin/financial
// Lista todos os OrderFinancial com parcelas e dados do pedido/cliente
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const financials = await db.orderFinancial.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      installments: { orderBy: { sequence: "asc" } },
      order: {
        select: {
          id: true,
          ref: true,
          type: true,
          status: true,
          client: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json(financials);
}
