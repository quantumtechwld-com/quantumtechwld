import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/admin/organizations/[id] ──────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const { id } = await params;
    const org = await db.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, status: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { orders: true } },
      },
    });

    if (!org) return NextResponse.json({ error: "Organização não encontrada." }, { status: 404 });

    return NextResponse.json({ organization: org });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/admin/organizations/[id]]", err);
    return NextResponse.json(
      { error: "Erro ao carregar organização.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}

const AddMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

// ─── POST /api/admin/organizations/[id]/members — adicionar membro ──────────
// (implementado na sub-rota /members/route.ts)

// ─── PATCH /api/admin/organizations/[id] — atualizar org ────────────────────
const UpdateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  logo: z.url().optional().nullable(),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const { id } = await params;
    const parsed = UpdateOrgSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 422 });
    }

    const org = await db.organization.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ organization: org });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PATCH /api/admin/organizations/[id]]", err);
    return NextResponse.json(
      { error: "Erro ao atualizar organização.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}

// Exportar schema para rota de membros
export { AddMemberSchema };
