import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const VALID_STATUSES = [
  "DRAFT",
  "PENDING",
  "EVALUATING",
  "PROPOSAL_SENT",
  "APPROVED",
  "REVISION",
  "REJECTED",
  "IN_PRODUCTION",
  "COMPLETED",
] as const;

// ─── GET /api/admin/orders ───────────────────────────────────────────────────
// Query params:
//   status  – filter by OrderStatus
//   clientId – filter by client id
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const clientId   = searchParams.get("clientId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};
    if (statusParam && (VALID_STATUSES as readonly string[]).includes(statusParam)) {
      where.status = statusParam;
    }
    if (clientId) {
      where.clientId = clientId;
    }

    const orders = await db.order.findMany({
      where,
      include: { client: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/admin/orders]", err);
    return NextResponse.json(
      { error: "Erro ao carregar pedidos.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}
