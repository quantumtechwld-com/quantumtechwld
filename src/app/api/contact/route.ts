import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/email";
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
});

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
  const { name, email, subject, message } = result.data;

  // Persistir na base de dados
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).contactMessage.create({
    data: { name, email, subject, message },
  });

  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_SERVER_USER ?? "";
  if (adminEmail) {
    try {
      await sendMail({
        to:      adminEmail,
        subject: `[Contato] ${subject} — ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#7c3aed">Nova mensagem de contato</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <tr><td style="padding:6px 0;color:#64748b;width:100px">Nome</td><td style="padding:6px 0;color:#1e293b">${name}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0"><a href="mailto:${email}" style="color:#7c3aed">${email}</a></td></tr>
              <tr><td style="padding:6px 0;color:#64748b">Assunto</td><td style="padding:6px 0;color:#1e293b">${subject}</td></tr>
            </table>
            <div style="background:#f8fafc;border-left:4px solid #7c3aed;padding:16px;border-radius:4px;white-space:pre-wrap;color:#1e293b">${message}</div>
          </div>
        `,
      });
    } catch (err) {
      console.error("[/api/contact] sendMail failed:", err);
      // Não bloqueia o utilizador — mensagem foi recebida mesmo que o email falhe
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
