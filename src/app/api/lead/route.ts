import { NextRequest, NextResponse } from "next/server";

type LeadPayload = {
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

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.log("Lead recebido sem webhook configurado:", payload);
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
      source: "agency-site",
      receivedAt: new Date().toISOString(),
    };

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
      return NextResponse.json(
        {
          error: "Webhook n8n retornou erro.",
          detail: responseText || n8nResponse.statusText,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, message: "Lead enviado ao n8n." });
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
