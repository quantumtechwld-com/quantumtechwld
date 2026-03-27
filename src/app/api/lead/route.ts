import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeComplexity } from "@/lib/complexity";

type LeadPayload = {
  // Campos do wizard
  projectType?: string;
  painPoints?: string;
  targetAudience?: string;
  features?: string[];
  customFeatures?: string;
  timeline?: string;
  // Campos base (mantidos por compatibilidade)
  name: string;
  email: string;
  company?: string;
  service: string;
  budget: string;
  message: string;
};

function isValidLead(payload: Partial<LeadPayload>): payload is LeadPayload {
  return Boolean(
    payload.name?.trim() &&
      payload.email?.trim() &&
      payload.service?.trim() &&
      payload.budget?.trim() &&
      payload.message?.trim()
  );
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<LeadPayload>;

    if (!isValidLead(payload)) {
      return NextResponse.json(
        { error: "Dados do lead incompletos." },
        { status: 400 }
      );
    }

    // Salvar briefing no banco (upsert do user por email)
    const cx = computeComplexity(
      payload.projectType ?? payload.service,
      payload.features ?? [],
      payload.customFeatures ?? ""
    );

    await prisma.user.upsert({
      where: { email: payload.email },
      update: {},
      create: { email: payload.email, name: payload.name },
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
