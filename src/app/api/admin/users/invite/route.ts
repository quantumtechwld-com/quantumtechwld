import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email";

type InviteLocale = "pt" | "en" | "es";

const INVITE_COPY: Record<InviteLocale, {
  subject:  string;
  title:    string;
  greeting: (name: string | null) => string;
  body:     string;
  expiry:   string;
  cta:      string;
  footer:   string;
  team:     string;
}> = {
  pt: {
    subject:  "Convite de acesso — Portal Quantum Tech",
    title:    "Bem-vindo ao Portal Quantum Tech",
    greeting: (n) => n ? `Olá ${n},` : "Olá,",
    body:     "Sua conta foi criada e está pronta para acesso. Clique no botão abaixo para entrar no portal.",
    expiry:   "O link expira em <strong>24 horas</strong>.",
    cta:      "Acesse o Portal",
    footer:   "Se não solicitou este acesso, pode ignorar este e-mail.",
    team:     "— Equipe Quantum Tech",
  },
  en: {
    subject:  "Access Invitation — Quantum Tech Portal",
    title:    "Welcome to the Quantum Tech Portal",
    greeting: (n) => n ? `Hello ${n},` : "Hello,",
    body:     "Your account has been created and is ready to use. Click the button below to access the portal.",
    expiry:   "The link expires in <strong>24 hours</strong>.",
    cta:      "Access the Portal",
    footer:   "If you didn't request this, you can safely ignore this email.",
    team:     "— Quantum Tech Team",
  },
  es: {
    subject:  "Invitación de acceso — Portal Quantum Tech",
    title:    "Bienvenido al Portal Quantum Tech",
    greeting: (n) => n ? `Hola ${n},` : "Hola,",
    body:     "Tu cuenta ha sido creada y está lista para usar. Haz clic en el botón para acceder al portal.",
    expiry:   "El enlace expira en <strong>24 horas</strong>.",
    cta:      "Acceder al Portal",
    footer:   "Si no solicitaste este acceso, puedes ignorar este correo.",
    team:     "— Equipo Quantum Tech",
  },
};

function buildInviteEmail(name: string | null, magicLink: string, locale: InviteLocale = "pt") {
  const c = INVITE_COPY[locale];
  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f">
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:32px auto;background:#0f0f14;color:#e2e8f0;padding:40px;border-radius:16px;border:1px solid #ffffff15">
  <p style="color:#0ea5e9;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0 0 16px">Quantum Tech</p>
  <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px">${c.title}</h1>
  <p style="color:#94a3b8;margin:0 0 24px;font-size:15px">${c.greeting(name)}</p>
  <p style="color:#e2e8f0;margin:0 0 8px;font-size:14px">${c.body}</p>
  <p style="color:#94a3b8;margin:0 0 28px;font-size:13px">${c.expiry}</p>
  <a href="${magicLink}"
     style="display:inline-block;background:#0ea5e9;color:#ffffff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
    ${c.cta} →
  </a>
  <hr style="border:none;border-top:1px solid #ffffff10;margin:32px 0">
  <p style="color:#475569;font-size:12px;margin:0 0 4px">${c.footer}</p>
  <p style="color:#475569;font-size:12px;margin:0">${c.team}</p>
</div>
</body>
</html>`;
  const bodyText = c.body.split(/(<[^>]*>)/).filter((s) => !s.startsWith("<")).join("");
  const text = `${c.title}\n\n${c.greeting(name)}\n\n${bodyText}\n\n${c.cta}: ${magicLink}\n\n${c.footer}\n${c.team}`;
  // replaceAll usage note: regex with /g flag is intentional for HTML tag stripping
  return { html, text, subject: c.subject };
}

// POST /api/admin/users/invite — cria utilizador como ACTIVE e envia magic link
export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = (await request.json()) as { email?: string; name?: string; locale?: string };
  const email  = body.email?.toLowerCase().trim();
  const name   = body.name?.trim() || null;
  const locale: InviteLocale = ["pt", "en", "es"].includes(body.locale ?? "") ? (body.locale as InviteLocale) : "pt";

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

  const { html, text, subject } = buildInviteEmail(name, magicLink, locale);

  await sendMail({ to: email, subject, html, text });

  return NextResponse.json({ ok: true, message: "Convite enviado com sucesso." });
}
