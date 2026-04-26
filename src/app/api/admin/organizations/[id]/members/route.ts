import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteContext = { params: Promise<{ id: string }> };

const AddMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

// ─── POST /api/admin/organizations/[id]/members ──────────────────────────────
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const { id: orgId } = await params;
    const parsed = AddMemberSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 422 });
    }

    const { userId, role } = parsed.data;

    // Verificar que a org existe
    const org = await db.organization.findUnique({ where: { id: orgId }, select: { id: true } });
    if (!org) return NextResponse.json({ error: "Organização não encontrada." }, { status: 404 });

    // Verificar que o utilizador existe
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

    // Upsert do membro (idempotente)
    const member = await db.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: orgId, userId } },
      update: { role },
      create: { organizationId: orgId, userId, role },
    });

    // Garantir que o campo organizationId do user está sincronizado
    await prisma.user.update({
      where: { id: userId },
      data: { organizationId: orgId },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/admin/organizations/[id]/members]", err);
    return NextResponse.json(
      { error: "Erro ao adicionar membro.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/admin/organizations/[id]/members ─────────────────────────────
const UpdateMemberRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const { id: orgId } = await params;
    const parsed = UpdateMemberRoleSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 422 });
    }

    const { userId, role } = parsed.data;

    const member = await db.organizationMember.update({
      where: { organizationId_userId: { organizationId: orgId, userId } },
      data: { role },
    });

    return NextResponse.json({ member });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PATCH /api/admin/organizations/[id]/members]", err);
    return NextResponse.json(
      { error: "Erro ao alterar role.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/admin/organizations/[id]/members?userId=xxx ─────────────────
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const { id: orgId } = await params;
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId obrigatório." }, { status: 400 });

    await db.organizationMember.delete({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });

    // Limpar organizationId do user se for a org atual dele
    await prisma.user.updateMany({
      where: { id: userId, organizationId: orgId },
      data: { organizationId: null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[DELETE /api/admin/organizations/[id]/members]", err);
    return NextResponse.json(
      { error: "Erro ao remover membro.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}
