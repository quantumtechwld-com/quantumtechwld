import { NextRequest, NextResponse } from "next/server";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type InviteLocale = "pt" | "en" | "es";

// POST /api/admin/users/invite — cria utilizador como ACTIVE e envia magic link via Auth.js
export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = (await request.json()) as { email?: string; name?: string; locale?: string; organizationId?: string };
  const email  = body.email?.toLowerCase().trim();
  const name   = body.name?.trim() || null;
  const locale: InviteLocale = ["pt", "en", "es"].includes(body.locale ?? "") ? (body.locale as InviteLocale) : "pt";
  const orgId  = body.organizationId?.trim() || null;

  if (!email) {
    return NextResponse.json({ error: "Email obrigatório." }, { status: 400 });
  }

  // Valida formato de e-mail (proteção básica contra strings malformadas)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  // Se organização fornecida, verificar que existe
  if (orgId) {
    const org = await db.organization.findUnique({ where: { id: orgId }, select: { id: true } });
    if (!org) return NextResponse.json({ error: "Organização não encontrada." }, { status: 404 });
  }

  // Cria ou ativa o utilizador como ACTIVE (bypass do fluxo PENDING)
  const user = await prisma.user.upsert({
    where: { email },
    update: { status: "ACTIVE", ...(name ? { name } : {}), ...(orgId ? { organizationId: orgId } : {}) },
    create: { email, name, status: "ACTIVE", role: "CLIENT", ...(orgId ? { organizationId: orgId } : {}) },
  });

  // Vincular como membro da org (idempotente via upsert)
  if (orgId) {
    await db.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: orgId, userId: user.id } },
      update: {},
      create: { organizationId: orgId, userId: user.id, role: "MEMBER" },
    });
  }

  // Auth.js gera o token, faz o hash, persiste no DB e chama sendVerificationRequest.
  // redirect: false evita que signIn() lance NEXT_REDIRECT neste Route Handler.
  // O locale é passado via invite_locale no callbackUrl e lido em sendVerificationRequest (auth.ts).
  // CRÍTICO: callbackUrl deve ser absoluto em produção — NextAuth v5 rejeita URLs relativas
  // por validação de origin, causando erro "Verification" mesmo com token válido.
  const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    `${request.headers.get("x-forwarded-proto") ?? "https"}://${request.headers.get("host")}`;
  await signIn("nodemailer", {
    email,
    redirectTo: `${baseUrl}/portal?invite_locale=${locale}`,
    redirect: false,
  });

  return NextResponse.json({ ok: true, message: "Convite enviado com sucesso." });
}
