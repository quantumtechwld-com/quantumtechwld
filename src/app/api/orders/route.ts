import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendMail, tplOrderReceived } from "@/lib/email";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const VALID_TYPES = ["new_feature", "bug_fix", "new_project", "support", "other"] as const;
const VALID_URGENCIES = ["low", "normal", "high", "critical"] as const;

// ─── GET /api/orders — lista pedidos do cliente autenticado ──────────────────
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

    // Admin vê todos; cliente vê apenas os seus
    const where = user.role === "ADMIN" ? {} : { clientId: user.id };

    const orders = await db.order.findMany({
      where,
      include: { client: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
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
      select: { id: true, name: true, email: true },
    });
    if (!user) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

    const body = (await request.json()) as {
      type?: string;
      description?: string;
      urgency?: string;
      attachments?: string[];
    };

    if (!body.type || !VALID_TYPES.includes(body.type as typeof VALID_TYPES[number])) {
      return NextResponse.json({ error: "Tipo de pedido inválido." }, { status: 422 });
    }
    if (!body.description?.trim()) {
      return NextResponse.json({ error: "A descrição é obrigatória." }, { status: 422 });
    }
    if (body.urgency && !VALID_URGENCIES.includes(body.urgency as typeof VALID_URGENCIES[number])) {
      return NextResponse.json({ error: "Urgência inválida." }, { status: 422 });
    }

    const order = await db.order.create({
      data: {
        clientId:    user.id,
        type:        body.type,
        description: body.description.trim(),
        urgency:     body.urgency ?? "normal",
        attachments: body.attachments ?? [],
        status:      "PENDING",
      },
      include: { client: { select: { name: true, email: true } } },
    });

    // Notificar admin por email
    const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_SERVER_USER ?? "";
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    if (adminEmail) {
      sendMail({
        to: adminEmail,
        subject: `[DevFlow] Novo pedido de ${user.email}`,
        html: tplOrderReceived({
          clientEmail:  user.email!,
          orderType:    order.type,
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
