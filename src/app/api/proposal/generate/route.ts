import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ─── POST /api/proposal/generate ─────────────────────────────────────────────
// Apenas ADMIN. Gera proposta a partir do escopo M2 via Gemini.

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = (await request.json()) as { briefingId?: string; send?: boolean };
  const { briefingId, send = false } = body;

  if (!briefingId) {
    return NextResponse.json({ error: "briefingId obrigatório." }, { status: 400 });
  }

  const briefing = await prisma.briefing.findUnique({
    where: { id: briefingId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!briefing) {
    return NextResponse.json({ error: "Briefing não encontrado." }, { status: 404 });
  }

  // Buscar escopo M2
  const scope = await prisma.scope.findUnique({ where: { briefingId } });
  if (!scope) {
    return NextResponse.json(
      { error: "Nenhum escopo M2 encontrado. Gere o escopo primeiro." },
      { status: 422 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada." }, { status: 500 });
  }

  // ─── Prompt ──────────────────────────────────────────────────────────────
  const features = (scope.features as Array<{ name: string; description: string; priority: string; estimatedHours: number; area: string }>);
  const featureList = features
    .map((f) => `- **${f.name}** (${f.area}, ${f.estimatedHours}h): ${f.description}`)
    .join("\n");

  const prompt = `Você é um especialista em vendas de software. Redija uma proposta comercial profissional e convincente em português europeu (PT-PT) para o seguinte projeto.

DADOS DO PROJETO:
- Tipo: ${briefing.projectType}
- Problema: ${briefing.painPoints}
- Público-alvo: ${briefing.targetAudience}
- Orçamento do cliente: ${briefing.budget}
- Prazo desejado: ${briefing.timeline}

ESCOPO TÉCNICO (M2):
Funcionalidades:
${featureList}

Stack recomendada: ${(scope.techRecommended as string[]).join(", ")}
Integrações: ${(scope.integrations as string[]).join(", ")}
Horas estimadas: ${scope.hoursEstimate}h
Investimento: €${scope.costMin.toLocaleString("pt-PT")} – €${scope.costMax.toLocaleString("pt-PT")}
Confiança da estimativa: ${scope.confidence}%

INSTRUÇÕES DE FORMATO:
Retorne um JSON com exatamente dois campos:
{
  "summary": "Parágrafo curto (2-3 frases) que resume a proposta como se fosse um e-mail de apresentação. Direto, profissional, sem jargão.",
  "content": "Proposta completa em Markdown. Estrutura obrigatória:\\n\\n## Entendimento do Projecto\\n## Solução Proposta\\n## Âmbito do Trabalho (tabela de funcionalidades com horas)\\n## Tecnologias\\n## Investimento\\n## Prazo\\n## Próximos Passos\\n\\nTom: profissional, claro, focado no valor para o cliente. Evite jargão técnico excessivo."
}

Não inclua markdown fora do JSON. Retorne APENAS o JSON.`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.text().catch(() => "");
    return NextResponse.json({ error: `Gemini error: ${geminiRes.status}`, detail: err }, { status: 502 });
  }

  interface GeminiResponse {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string; thought?: boolean }> };
    }>;
  }

  const geminiData = (await geminiRes.json()) as GeminiResponse;
  const parts = geminiData.candidates?.[0]?.content?.parts ?? [];
  const raw = [...parts].reverse().find((p) => !p.thought && p.text)?.text ?? "";

  let parsed: { summary: string; content: string };
  try {
    parsed = JSON.parse(raw) as { summary: string; content: string };
    if (!parsed.summary || !parsed.content) throw new Error("campos em falta");
  } catch {
    return NextResponse.json({ error: "Resposta inválida da IA.", raw }, { status: 502 });
  }

  // ─── Verificar proposta existente para versionar ──────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;
  const existing = await db.proposal.findUnique({ where: { briefingId } });
  const nextVersion = existing ? (existing.version as number) + 1 : 1;
  const newStatus = send ? "SENT" : "DRAFT";

  const proposal = await db.proposal.upsert({
    where: { briefingId },
    create: {
      briefingId,
      version: nextVersion,
      status: newStatus,
      content: parsed.content,
      summary: parsed.summary,
      hoursTotal: scope.hoursEstimate,
      costMin: scope.costMin,
      costMax: scope.costMax,
    },
    update: {
      version: nextVersion,
      status: newStatus,
      content: parsed.content,
      summary: parsed.summary,
      hoursTotal: scope.hoursEstimate,
      costMin: scope.costMin,
      costMax: scope.costMax,
      clientNote: null,
      reviewedAt: null,
    },
  });

  // Se "send=true", atualizar status do briefing para PROPOSAL_SENT
  if (send) {
    await prisma.briefing.update({
      where: { id: briefingId },
      data: { status: "PROPOSAL_SENT" },
    });
  }

  return NextResponse.json({ proposal });
}
