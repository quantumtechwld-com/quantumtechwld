import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { geminiGenerate, GeminiError } from "@/lib/gemini";
import { formatCurrencyRangeByCode, getExchangeRate } from "@/lib/currency";
import { resolveContractCurrency } from "@/services/finance/contractCurrency";

const GenerateSchema = z.object({
  briefingId: z.string().min(1),
  send:       z.boolean().optional().default(false),
});

type ProposalBriefing = Prisma.BriefingGetPayload<{
  include: {
    user: { select: { name: true; email: true; locale: true; billingCurrency: true } };
    organization: { select: { billingCurrency: true } };
  };
}>;
type ProposalScope = Prisma.ScopeGetPayload<Record<string, never>>;

async function resolveProposalMoney(briefing: ProposalBriefing, scope: ProposalScope) {
  const proposalCurrency = resolveContractCurrency({
    organizationCurrency: briefing.organization?.billingCurrency ?? null,
    userCurrency: briefing.user.billingCurrency ?? null,
    locale: briefing.user.locale ?? null,
  });
  const proposalFxRate = proposalCurrency === "EUR" ? 1 : await getExchangeRate("EUR", proposalCurrency);

  return {
    proposalCurrency,
    costMin: Math.round(scope.costMin * proposalFxRate * 100) / 100,
    costMax: Math.round(scope.costMax * proposalFxRate * 100) / 100,
  };
}

function buildProposalPrompt(briefing: ProposalBriefing, scope: ProposalScope, costMin: number, costMax: number, proposalCurrency: string) {
  const features = (scope.features as Array<{ name: string; description: string; priority: string; estimatedHours: number; area: string }>);
  const featureList = features
    .map((f) => `- **${f.name}** (${f.area}, ${f.estimatedHours}h): ${f.description}`)
    .join("\n");

  return String.raw`Você é um especialista em vendas de software. Redija uma proposta comercial profissional e convincente em português europeu (PT-PT) para o seguinte projeto.

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
Investimento: ${formatCurrencyRangeByCode(costMin, costMax, proposalCurrency)}
Confiança da estimativa: ${scope.confidence}%

INSTRUÇÕES DE FORMATO:
Retorne um JSON com exatamente dois campos:
{
  "summary": "Parágrafo curto (2-3 frases) que resume a proposta como se fosse um e-mail de apresentação. Direto, profissional, sem jargão.",
  "content": "Proposta completa em Markdown. Estrutura obrigatória:\n\n## Entendimento do Projecto\n## Solução Proposta\n## Âmbito do Trabalho (tabela de funcionalidades com horas)\n## Tecnologias\n## Investimento\n## Prazo\n## Próximos Passos\n\nTom: profissional, claro, focado no valor para o cliente. Evite jargão técnico excessivo."
}

Não inclua markdown fora do JSON. Retorne APENAS o JSON.`;
}

// ─── POST /api/proposal/generate ─────────────────────────────────────────────
// Apenas ADMIN. Gera proposta a partir do escopo M2 via Gemini.

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const reqBody = await request.json().catch(() => null);
  const zodResult = GenerateSchema.safeParse(reqBody);
  if (!zodResult.success) {
    return NextResponse.json({ error: "briefingId obrigatório." }, { status: 400 });
  }
  const { briefingId, send } = zodResult.data;

  const briefing = await prisma.briefing.findUnique({
    where: { id: briefingId },
    include: {
      user: { select: { name: true, email: true, locale: true, billingCurrency: true } },
      organization: { select: { billingCurrency: true } },
    },
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

  const { proposalCurrency, costMin, costMax } = await resolveProposalMoney(briefing, scope);

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada." }, { status: 500 });
  }

  const prompt = buildProposalPrompt(briefing, scope, costMin, costMax, proposalCurrency);

  let raw: string;
  try {
    const result = await geminiGenerate(prompt, {
      temperature: 0.4,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    });
    raw = result.text;
  } catch (err) {
    const status = err instanceof GeminiError ? err.status : 500;
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Gemini error: ${status}`, detail }, { status: 502 });
  }

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
      costCurrency: proposalCurrency,
      costMin,
      costMax,
    },
    update: {
      version: nextVersion,
      status: newStatus,
      content: parsed.content,
      summary: parsed.summary,
      hoursTotal: scope.hoursEstimate,
      costCurrency: proposalCurrency,
      costMin,
      costMax,
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
