import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const CreateOrgSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "slug deve conter apenas letras minúsculas, números e hífens"),
  logo: z.url().optional().nullable(),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).default("FREE"),
});

// ─── GET /api/admin/organizations ─────────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const organizations = await db.organization.findMany({
      include: {
        _count: { select: { members: true, orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ organizations });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/admin/organizations]", err);
    return NextResponse.json(
      { error: "Erro ao listar organizações.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}

// ─── POST /api/admin/organizations ────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const parsed = CreateOrgSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 422 });
    }

    const { name, slug, logo, plan } = parsed.data;

    // Verificar slug único
    const existing = await db.organization.findUnique({ where: { slug }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ error: "Slug já em uso." }, { status: 409 });
    }

    const org = await db.organization.create({
      data: { name, slug, logo: logo ?? null, plan, status: "ACTIVE" },
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/admin/organizations]", err);
    return NextResponse.json(
      { error: "Erro ao criar organização.", detail: process.env.NODE_ENV === "production" ? undefined : msg },
      { status: 500 },
    );
  }
}
