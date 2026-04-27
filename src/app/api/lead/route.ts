import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { computeComplexity } from "@/lib/complexity";
import { sendMail, tplLeadConfirmation } from "@/lib/email";
import { emailLogoHeader } from "@/lib/email-templates/shared";
import { createRateLimiter } from "@/lib/rateLimit";
import { verifyCsrf } from "@/lib/csrf";

function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

// 5 leads por IP por 10 minutos
const isRateLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, maxRequests: 5 });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LeadSchema = z.object({
  name:           z.string().trim().min(1),
  email:          z.string().trim().min(1).regex(EMAIL_RE),
  company:        z.string().trim().optional(),
  service:        z.string().trim().min(1),
  budget:         z.string().trim().min(1),
  message:        z.string().trim().min(1),
  projectType:    z.string().trim().optional(),
  painPoints:     z.string().trim().optional(),
  targetAudience: z.string().trim().optional(),
  features:       z.array(z.string()).optional(),
  customFeatures: z.string().trim().optional(),
  timeline:       z.string().trim().optional(),
});

type LeadPayload = z.infer<typeof LeadSchema>;

export async function POST(request: NextRequest) {
  try {
    // CSRF double-submit cookie validation
    if (!verifyCsrf(request)) {
      return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
    }

    // Rate limiting por IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    const raw = await request.json();
    const result = LeadSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json(
        { error: "Dados do lead incompletos." },
        { status: 400 }
      );
    }
    const payload: LeadPayload = result.data;

    // Salvar briefing no banco (upsert do user por email)
    const cx = computeComplexity(
      payload.projectType ?? payload.service,
      payload.features ?? [],
      payload.customFeatures ?? ""
    );

    await prisma.user.upsert({
      where: { email: payload.email },
      update: {},
      create: { email: payload.email, name: payload.name, status: "PENDING" },
    }).then((user) =>
      prisma.briefing.create({
        data: {
          userId:         user.id,
          projectType:    payload.projectType ?? payload.service,
          painPoints:     payload.painPoints  ?? payload.message,
          targetAudience: payload.targetAudience ?? "",
          features:       payload.features ?? [],
          customFeatures: payload.customFeatures,
          budget:         payload.budget,
          timeline:       payload.timeline ?? "",
          complexityScore: cx.score,
          hoursMin:        cx.hoursMin,
          hoursMax:        cx.hoursMax,
        },
      })
    ).catch((err) => {
      // Não falha a requisição se o banco não estiver configurado
      console.warn("Briefing não persistido no banco:", err instanceof Error ? err.message : err);
    });

    // ── Notificação directa ao admin (independente do n8n) ──
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const featuresText = Array.isArray(payload.features) && payload.features.length
        ? payload.features.map(escapeHtml).join(", ")
        : "—";
      sendMail({
        to: adminEmail,
        subject: `🚀 Novo Lead: ${payload.name} — ${payload.service ?? payload.projectType}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            ${emailLogoHeader("light")}
            <h2 style="color:#4f46e5">Novo Lead Recebido</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;font-weight:bold;width:140px">Nome</td><td style="padding:8px">${escapeHtml(payload.name)}</td></tr>
              <tr style="background:#f8f8f8"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${escapeHtml(payload.email)}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Empresa</td><td style="padding:8px">${escapeHtml(payload.company ?? "—")}</td></tr>
              <tr style="background:#f8f8f8"><td style="padding:8px;font-weight:bold">Serviço</td><td style="padding:8px">${escapeHtml(payload.service ?? payload.projectType ?? "—")}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Budget</td><td style="padding:8px">${escapeHtml(payload.budget)}</td></tr>
              <tr style="background:#f8f8f8"><td style="padding:8px;font-weight:bold">Timeline</td><td style="padding:8px">${escapeHtml(payload.timeline ?? "—")}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Funcionalidades</td><td style="padding:8px">${featuresText}</td></tr>
              <tr style="background:#f8f8f8"><td style="padding:8px;font-weight:bold">Complexidade</td><td style="padding:8px">${cx.score} pts (${cx.hoursMin}–${cx.hoursMax}h)</td></tr>
              <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Mensagem</td><td style="padding:8px">${escapeHtml(payload.painPoints ?? payload.message ?? "—")}</td></tr>
            </table>
            <p style="color:#888;font-size:12px;margin-top:24px">Recebido em ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>
          </div>
        `,
      }).catch((emailErr) => {
        console.warn("Email de notificação de lead falhou:", emailErr instanceof Error ? emailErr.message : emailErr);
      });
    }

    // ── Confirmação automática ao lead (resposta em até 2h úteis) ──
    const confirmationTemplate = tplLeadConfirmation(payload.name, "pt");
    sendMail({
      to: payload.email,
      subject: confirmationTemplate.subject,
      html: confirmationTemplate.html,
    }).catch((emailErr) => {
      console.warn("Email de confirmação ao lead falhou:", emailErr instanceof Error ? emailErr.message : emailErr);
    });

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      return NextResponse.json({
        ok: true,
        message: "Lead recebido localmente. Configure N8N_WEBHOOK_URL.",
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const n8nPayload = {
      ...payload,
      body: payload,
      complexityScore: cx.score,
      hoursMin: cx.hoursMin,
      hoursMax: cx.hoursMax,
      source: "agency-site",
      receivedAt: new Date().toISOString(),
    };

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeout);

      if (!n8nResponse.ok) {
        const responseText = await n8nResponse.text().catch(() => "");
        console.warn(
          `n8n webhook retornou ${n8nResponse.status}: ${responseText || n8nResponse.statusText}`
        );
      }
    } catch (n8nError) {
      clearTimeout(timeout);
      console.warn(
        "n8n webhook indisponível:",
        n8nError instanceof Error ? n8nError.message : n8nError
      );
    }

    return NextResponse.json({ ok: true, message: "Lead recebido com sucesso." });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao processar lead.",
        detail: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
