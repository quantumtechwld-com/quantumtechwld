import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteContext = { params: Promise<{ orderId: string; installmentId: string }> };

interface PatchBody {
  action: "confirm_manual";
  notes?: string;
}

// PATCH /api/admin/financial/[orderId]/installments/[installmentId]
// Confirma pagamento manual de uma parcela
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { orderId, installmentId } = await params;
  const body: PatchBody = await req.json();

  if (body.action !== "confirm_manual") {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  // Verificar que a parcela pertence ao financeiro correto
  const installment = await db.paymentInstallment.findFirst({
    where: { id: installmentId, financial: { orderId } },
    include: { financial: { include: { installments: true } } },
  });

  if (!installment) {
    return NextResponse.json({ error: "Parcela não encontrada." }, { status: 404 });
  }
  if (installment.status === "PAID") {
    return NextResponse.json({ error: "Parcela já está paga." }, { status: 409 });
  }

  const now = new Date();

  // Marcar parcela como paga
  await db.paymentInstallment.update({
    where: { id: installmentId },
    data: {
      status:             "PAID",
      paidAt:             now,
      confirmedByAdminId: session.user.id,
      notes:              body.notes ?? null,
    },
  });

  // Recalcular paidCents no OrderFinancial
  const allInstallments = installment.financial.installments as Array<{
    id: string;
    amountCents: number;
    status: string;
    sequence: number;
  }>;

  const paidCents = allInstallments
    .filter((i) => i.status === "PAID" || i.id === installmentId)
    .reduce((sum, i) => sum + i.amountCents, 0);

  const total    = installment.financial.totalAmountCents as number;
  const allPaid  = paidCents >= total;
  const finStatus = allPaid ? "PAID" : "PARTIAL";

  await db.orderFinancial.update({
    where: { orderId },
    data:  { paidCents, status: finStatus },
  });

  // Primeira parcela (sequence=1) paga manualmente → avançar pedido para IN_PRODUCTION
  const isFirstInstallment = installment.sequence === 1;
  const wasAlreadyPartial  = (installment.financial.paidCents as number) > 0;
  if (isFirstInstallment && !wasAlreadyPartial) {
    await db.order.update({ where: { id: orderId }, data: { status: "IN_PRODUCTION" } });
  }

  return NextResponse.json({ ok: true, paidCents, status: finStatus });
}
