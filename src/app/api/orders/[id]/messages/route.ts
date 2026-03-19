import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendMail, tplOrderNewMessage } from "@/lib/email";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteParams = { params: Promise<{ id: string }> };

// ─── GET /api/orders/[id]/messages ───────────────────────────────────────────
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: { client: { select: { email: true } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = order.client.email === session.user.email;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await db.orderMessage.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, email: true, role: true } } },
  });

  return NextResponse.json({ messages });
}

// ─── POST /api/orders/[id]/messages ──────────────────────────────────────────
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const text: string = typeof body?.body === "string" ? body.body.trim() : "";

  if (!text || text.length < 1 || text.length > 2000) {
    return NextResponse.json(
      { error: "Mensagem inválida (1–2000 caracteres)" },
      { status: 400 },
    );
  }

  const order = await db.order.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = order.client.email === session.user.email;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const message = await db.orderMessage.create({
    data: { orderId: id, authorId: me.id, body: text },
    include: { author: { select: { id: true, name: true, email: true, role: true } } },
  });

  // Notify the other party by email (fire-and-forget)
  const adminEmail = process.env.EMAIL_ADMIN ?? process.env.EMAIL_FROM ?? "";
  const orderUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}`;

  if (isAdmin && order.client.email) {
    // Admin sent message → notify client
    sendMail({
      to: order.client.email,
      subject: `Nova mensagem no seu pedido — Quantum Technology`,
      html: tplOrderNewMessage({
        recipientName: order.client.name ?? "",
        senderRole: "admin",
        orderType: order.type,
        body: text,
        orderUrl: `${orderUrl}/portal/orders/${id}`,
      }),
    }).catch(() => null);
  } else {
    // Client sent message → notify admin
    sendMail({
      to: adminEmail,
      subject: `Nova mensagem de cliente no pedido — Quantum Technology`,
      html: tplOrderNewMessage({
        recipientName: "Admin",
        senderRole: "client",
        senderEmail: session.user.email,
        orderType: order.type,
        body: text,
        orderUrl: `${orderUrl}/admin/orders/${id}`,
      }),
    }).catch(() => null);
  }

  return NextResponse.json({ message }, { status: 201 });
}
