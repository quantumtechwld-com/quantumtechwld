import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteContext = { params: Promise<{ orderId: string }> };

// GET /api/admin/financial/[orderId]
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { orderId } = await params;

  const financial = await db.orderFinancial.findUnique({
    where: { orderId },
    include: {
      installments: { orderBy: { sequence: "asc" } },
      order: {
        select: {
          id: true,
          ref: true,
          type: true,
          status: true,
          estimatedValue: true,
          client: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!financial) {
    return NextResponse.json({ error: "Financeiro não encontrado." }, { status: 404 });
  }

  return NextResponse.json(financial);
}
