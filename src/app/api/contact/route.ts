import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/email";
import { emailLogoHeader, emailFooterTeam } from "@/lib/email-templates/shared";
import { prisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rateLimit";
import { verifyCsrf } from "@/lib/csrf";

// 3 contactos por IP por 10 minutos
const isRateLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, maxRequests: 3 });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactSchema = z.object({
  name:    z.string().trim().min(1),
  email:   z.string().trim().min(1).regex(EMAIL_RE),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(1),
  locale:  z.enum(["pt", "en", "es"]).optional().default("pt"),
});

type ContactLocale = "pt" | "en" | "es";

const adminCopy: Record<ContactLocale, { subject: (s: string, n: string) => string; title: string; name: string; email: string; subjectLabel: string }> = {
  pt: { subject: (s, n) => `[Contato] ${s} — ${n}`, title: "Nova mensagem de contato", name: "Nome", email: "E-mail", subjectLabel: "Assunto" },
  en: { subject: (s, n) => `[Contact] ${s} — ${n}`,  title: "New contact message",    name: "Name", email: "Email",  subjectLabel: "Subject" },
  es: { subject: (s, n) => `[Contacto] ${s} — ${n}`, title: "Nuevo mensaje de contacto", name: "Nombre", email: "Correo", subjectLabel: "Asunto" },
};

const userCopy: Record<ContactLocale, { subject: string; greeting: (n: string) => string; body: string; closing: string }> = {
  pt: { subject: "✅ Recebemos sua mensagem", greeting: (n) => `Olá ${n},`, body: "Recebemos sua mensagem e responderemos em breve pelo e-mail indicado.", closing: "Obrigado por entrar em contato!" },
  en: { subject: "✅ We received your message", greeting: (n) => `Hi ${n},`, body: "We received your message and will get back to you shortly at the email address provided.", closing: "Thank you for reaching out!" },
  es: { subject: "✅ Recibimos tu mensaje", greeting: (n) => `Hola ${n},`, body: "Recibimos tu mensaje y te responderemos pronto al correo electrónico indicado.", closing: "¡Gracias por contactarnos!" },
};

export async function POST(request: NextRequest) {
  // CSRF double-submit cookie validation
  if (!verifyCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = ContactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Campos obrigatórios em falta ou inválidos." }, { status: 422 });
  }
  const { name, email, subject, message, locale } = result.data;

  // Persistir na base de dados
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).contactMessage.create({
    data: { name, email, subject, message },
  });

  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_SERVER_USER ?? "";
  const ac = adminCopy[locale];
  const uc = userCopy[locale];

  if (adminEmail) {
    try {
      await sendMail({
        to:      adminEmail,
        subject: ac.subject(subject, name),
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            ${emailLogoHeader("light")}
            <h2 style="color:#7c3aed">${ac.title}</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <tr><td style="padding:6px 0;color:#64748b;width:100px">${ac.name}</td><td style="padding:6px 0;color:#1e293b">${name}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b">${ac.email}</td><td style="padding:6px 0"><a href="mailto:${email}" style="color:#7c3aed">${email}</a></td></tr>
              <tr><td style="padding:6px 0;color:#64748b">${ac.subjectLabel}</td><td style="padding:6px 0;color:#1e293b">${subject}</td></tr>
            </table>
            <div style="background:#f8fafc;border-left:4px solid #7c3aed;padding:16px;border-radius:4px;white-space:pre-wrap;color:#1e293b">${message}</div>
          </div>
        `,
      });
    } catch (err) {
      console.error("[/api/contact] sendMail to admin failed:", err);
    }
  }

  // Confirmação ao utilizador
  try {
    await sendMail({
      to:      email,
      subject: uc.subject,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          ${emailLogoHeader("light")}
          <p style="font-size:16px;line-height:1.6;color:#1e293b">${uc.greeting(name)}</p>
          <p style="font-size:16px;line-height:1.6;color:#1e293b">${uc.body}</p>
          <p style="font-size:16px;line-height:1.6;color:#1e293b">${uc.closing}</p>
          ${emailFooterTeam()}
        </div>
      `,
    });
  } catch (err) {
    console.error("[/api/contact] sendMail confirmation to user failed:", err);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
