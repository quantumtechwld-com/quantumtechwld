import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendMail, tplOrderReceived } from "@/lib/email";
import { appUrl } from "@/lib/app-url";
import {
  createOrderWithRef,
  VALID_ORDER_TYPES,
  VALID_ORDER_URGENCIES,
} from "@/services/orders/createOrder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// ─── GET /api/orders — lista pedidos do cliente autenticado ──────────────────
export async function GET() {
  try {
    const session = await auth();
    // id e role estão no JWT — sem query extra ao banco
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id: userId, role, organizationId } = session.user;

    // Admin vê os últimos 100; cliente vê os seus + da empresa (Opção C)
    let where: Record<string, unknown>;
    if (role === "ADMIN") {
      where = {};
    } else if (organizationId) {
      // Opção C: pedidos próprios OU da empresa
      where = { OR: [{ clientId: userId }, { organizationId }] };
    } else {
      where = { clientId: userId };
    }

    const orders = await db.order.findMany({
      where,
      include: { client: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ orders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/orders]", err);
    return NextResponse.json(
      { error: "Erro ao carregar pedidos.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}

// ─── POST /api/orders — cria novo pedido ────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, company: true, organizationId: true, organization: { select: { name: true } } },
    });
    if (!user) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

    const body = (await request.json()) as {
      type?: string;
      title?: string;
      description?: string;
      urgency?: string;
      attachments?: string[];
      referenceLinks?: string[];
    };

    if (!body.type || !VALID_ORDER_TYPES.includes(body.type as typeof VALID_ORDER_TYPES[number])) {
      return NextResponse.json({ error: "Tipo de pedido inválido." }, { status: 422 });
    }
    if (!body.title?.trim() || body.title.trim().length > 120) {
      return NextResponse.json({ error: "Título obrigatório (máx. 120 caracteres)." }, { status: 422 });
    }
    if (!body.description?.trim()) {
      return NextResponse.json({ error: "A descrição é obrigatória." }, { status: 422 });
    }
    if (body.urgency && !VALID_ORDER_URGENCIES.includes(body.urgency as typeof VALID_ORDER_URGENCIES[number])) {
      return NextResponse.json({ error: "Urgência inválida." }, { status: 422 });
    }

    // Gerar orderRef e incluir na criação — evita race condition entre workers
    const clientName = user.organization?.name ?? user.company?.trim() ?? user.name?.trim() ?? user.email ?? "CLIENT";
    // Validar e sanitizar referenceLinks: apenas strings não-vazias com formato de URL
    const rawLinks = Array.isArray(body.referenceLinks) ? body.referenceLinks : [];
    const referenceLinks = rawLinks
      .map((l: unknown) => (typeof l === "string" ? l.trim() : ""))
      .filter((l) => l.length > 0 && l.length <= 2048)
      .slice(0, 10); // máx 10 links

    const order = await createOrderWithRef(
      {
        clientId:         user.id,
        clientName,
        type:             body.type,
        title:            body.title.trim(),
        description:      body.description.trim(),
        urgency:          body.urgency ?? "normal",
        attachments:      body.attachments ?? [],
        referenceLinks,
        createdByAdminId: null,
        organizationId:   user.organizationId ?? null,
      },
    );
    if (!order) {
      return NextResponse.json({ error: "Erro ao gerar referência do pedido. Tente novamente." }, { status: 500 });
    }

    // Notificar admin por email
    const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_SERVER_USER ?? "";
    const baseUrl = appUrl();
    if (adminEmail) {
      const organizationName = user.organization?.name;
      const displayName = organizationName ?? user.name ?? user.email!;
      sendMail({
        to: adminEmail,
        subject: `[DevFlow] Novo pedido de ${displayName}: ${order.title ?? order.type}`,
        html: tplOrderReceived({
          clientEmail:  user.email!,
          clientName:   displayName,
          organizationName: organizationName ?? null,
          orderType:    order.type,
          orderTitle:   order.title ?? "",
          urgency:      order.urgency,
          description:  order.description,
          adminUrl:     `${baseUrl}/admin/orders/${order.id}`,
        }),
      }).catch((e: unknown) => console.error("[tplOrderReceived]", e));
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      { error: "Erro ao criar pedido.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}
