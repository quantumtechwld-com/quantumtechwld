import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/users/[id] — atualiza role ou status de um utilizador
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string; role?: string };

  const allowedStatus = ["PENDING", "ACTIVE", "SUSPENDED"] as const;
  const allowedRole   = ["CLIENT", "ADMIN"]                 as const;

  const data: Record<string, string> = {};

  if (body.status) {
    if (!allowedStatus.includes(body.status as (typeof allowedStatus)[number])) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }
    data.status = body.status;
  }

  if (body.role) {
    if (!allowedRole.includes(body.role as (typeof allowedRole)[number])) {
      return NextResponse.json({ error: "Role inválida." }, { status: 400 });
    }
    // Impede que o admin remova a sua própria role
    if (id === session.user.id && body.role !== "ADMIN") {
      return NextResponse.json({ error: "Não pode remover a sua própria role de ADMIN." }, { status: 400 });
    }
    data.role = body.role;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  return NextResponse.json({ user });
}

// DELETE /api/admin/users/[id] — remove permanentemente um utilizador
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "Não pode excluir a sua própria conta." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
