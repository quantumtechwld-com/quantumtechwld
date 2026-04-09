import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email";

function buildInviteEmail(name: string | null, magicLink: string) {
  const displayName = name ? `Olá ${name}` : "Olá";
  return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
  <h1 style="color:#ffffff;margin-bottom:8px">Bem-vindo ao Portal Quantum</h1>
  <p style="color:#94a3b8;margin-bottom:24px">${displayName}, a sua conta foi criada e está pronta para acesso.</p>
  <p style="color:#e2e8f0;margin-bottom:24px">
    Clique no botão abaixo para entrar no portal. O link expira em <strong>24 horas</strong>.
  </p>
  <a href="${magicLink}"
     style="display:inline-block;background:#0ea5e9;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
    Aceder ao Portal →
  </a>
  <p style="color:#475569;font-size:12px;margin-top:32px">
    Se não solicitou este acesso, pode ignorar este email.<br/>
    — Equipa Quantum Technology
  </p>
</div>`;
}

// POST /api/admin/users/invite — cria utilizador como ACTIVE e envia magic link
export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = (await request.json()) as { email?: string; name?: string };
  const email = body.email?.toLowerCase().trim();
  const name  = body.name?.trim() || null;

  if (!email) {
    return NextResponse.json({ error: "Email obrigatório." }, { status: 400 });
  }

  // Cria ou ativa o utilizador como ACTIVE (bypass do fluxo PENDING)
  await prisma.user.upsert({
    where: { email },
    update: { status: "ACTIVE", ...(name ? { name } : {}) },
    create: { email, name, status: "ACTIVE", role: "CLIENT" },
  });

  // Gera token de verificação compatível com NextAuth (token raw na URL e no DB)
  const rawToken = randomBytes(32).toString("hex");
  const expires  = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  // Remove tokens anteriores para este email (evitar conflito de unique constraint)
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  await prisma.verificationToken.create({
    data: { identifier: email, token: rawToken, expires },
  });

  const baseUrl   = process.env.NEXTAUTH_URL ?? "https://quantumtechwld.com";
  const magicLink = `${baseUrl}/api/auth/callback/nodemailer?callbackUrl=${encodeURIComponent("/portal")}&token=${rawToken}&email=${encodeURIComponent(email)}`;

  await sendMail({
    to:      email,
    subject: "Convite de acesso — Portal Quantum Technology",
    html:    buildInviteEmail(name, magicLink),
  });

  return NextResponse.json({ ok: true, message: "Convite enviado com sucesso." });
}
