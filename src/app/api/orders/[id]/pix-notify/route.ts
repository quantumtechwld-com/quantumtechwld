import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessOrder } from "@/lib/auth/canAccessOrder";
import { sendMail, tplPixNotifyAdmin } from "@/lib/email";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/orders/[id]/pix-notify
// Cliente declara que efetuou pagamento PIX — envia email ao admin para confirmação manual.
export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderRef: true,
      type: true,
      status: true,
      client: { select: { id: true, email: true, name: true } },
      organizationId: true,
      financial: {
        select: {
          installments: {
            where: { status: "PENDING" },
            orderBy: { sequence: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  if (!canAccessOrder(order, session.user)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  // Validar que existe parcela PIX pendente
  const pendingInstallment = order.financial?.installments?.[0] as
    | { id: string; amountCents: number; method: string }
    | undefined;

  if (pendingInstallment?.method !== "MANUAL_PIX") {
    return NextResponse.json(
      { error: "Não há parcela PIX pendente para este pedido." },
      { status: 422 },
    );
  }

  const adminEmail  = process.env.ADMIN_EMAIL ?? process.env.EMAIL_ADMIN;
  const baseUrl     = (process.env.AUTH_URL ?? process.env.EMAIL_BASE_URL ?? "https://quantumtechwld.com").replace(/\/$/, "");
  const financUrl   = `${baseUrl}/admin/financeiro/${id}`;
  const orderRef    = (order.orderRef as string | null) ?? id.slice(0, 8);

  if (adminEmail) {
    await sendMail({
      to:      adminEmail,
      subject: `PIX declarado — Pedido ${orderRef}`,
      html:    tplPixNotifyAdmin({
        clientName:         (order.client.name as string | null) ?? "",
        clientEmail:        order.client.email as string,
        orderRef,
        orderType:          order.type as string,
        adminFinanceiroUrl: financUrl,
        amountCents:        pendingInstallment.amountCents,
      }),
    }).catch(() => {
      // Email não-crítico — não bloquear a resposta se falhar
    });
  }

  return NextResponse.json({ ok: true });
}
