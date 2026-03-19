import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ─── GET /api/profile ────────────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { id: true, name: true, email: true, phone: true, company: true, role: true },
    });
    if (!user) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ error: "Erro ao carregar perfil." }, { status: 500 });
  }
}

// ─── PATCH /api/profile ───────────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const body = (await request.json()) as { name?: string; phone?: string; company?: string };

    // Sanitize: only allow these three fields
    const data: { name?: string; phone?: string; company?: string } = {};
    if (typeof body.name    === "string") data.name    = body.name.trim().slice(0, 120);
    if (typeof body.phone   === "string") data.phone   = body.phone.trim().slice(0, 30);
    if (typeof body.company === "string") data.company = body.company.trim().slice(0, 120);

    const user = await prisma.user.update({
      where:  { email: session.user.email },
      data,
      select: { id: true, name: true, email: true, phone: true, company: true },
    });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[PATCH /api/profile]", err);
    return NextResponse.json({ error: "Erro ao actualizar perfil." }, { status: 500 });
  }
}
