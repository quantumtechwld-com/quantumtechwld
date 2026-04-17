import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cosineSimilarity, generateEmbedding, buildEmbeddingText } from "@/lib/embeddings";
import { geminiGenerate, GeminiError } from "@/lib/gemini";

// ─── Tipos do escopo ─────────────────────────────────────────────────────────

export type ScopeFeature = {
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedHours: number;
  area: "frontend" | "backend" | "fullstack" | "infra" | "design";
};

export type UserStory = {
  role: string;
  action: string;
  goal: string;
};

export type GeneratedScope = {
  features: ScopeFeature[];
  userStories: UserStory[];
  screens: string[];
  integrations: string[];
  techRecommended: string[];
  hoursEstimate: number;
  costMin: number;
  costMax: number;
  confidence: number;
};

// ─── Custo por área (€/hora) ─────────────────────────────────────────────────
const HOURLY_RATE = { min: 45, max: 85 };

// ─── POST /api/briefing/scope ────────────────────────────────────────────────

const ScopeSchema = z.object({
  briefingId: z.string().min(1),
  regenerate: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const reqBody = await request.json().catch(() => null);
  const zodResult = ScopeSchema.safeParse(reqBody);
  if (!zodResult.success) {
    return NextResponse.json({ error: "briefingId obrigatório." }, { status: 400 });
  }
  const { briefingId, regenerate } = zodResult.data;

  // Verificar que o briefing pertence ao utilizador
  const briefing = await prisma.briefing.findFirst({
    where: { id: briefingId, userId: session.user.id },
  });

  if (!briefing) {
    return NextResponse.json({ error: "Briefing não encontrado." }, { status: 404 });
  }

  // Retornar escopo já gerado (a menos que regenerate=true)
  if (!regenerate) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma as any).scope.findUnique({ where: { briefingId } });
    if (existing) {
      return NextResponse.json({ scope: existing });
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada." }, { status: 500 });
  }

  // ── S6: Contexto de projetos similares ───────────────────────────────────
  let similarContext = "";
  try {
    const descText = `${briefing.projectType} ${briefing.painPoints} ${briefing.features.join(" ")}`;
    const queryEmbedding = await generateEmbedding(
      buildEmbeddingText({ projectType: briefing.projectType, description: descText })
    );

    type RefRow = {
      title: string;
      projectType: string;
      features: string[];
      hoursActual: number;
      budgetRange: string;
      complexityScore: number;
      embedding: string;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allProjects = (await (prisma as any).referenceProject.findMany({
      select: {
        title: true, projectType: true, features: true,
        hoursActual: true, budgetRange: true, complexityScore: true, embedding: true,
      },
      take: 200,
    })) as RefRow[];

    const similar = allProjects
      .map((p: RefRow) => ({
        ...p,
        similarity: cosineSimilarity(queryEmbedding, JSON.parse(p.embedding) as number[]),
      }))
      .filter((p) => p.similarity >= 0.65)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    if (similar.length > 0) {
      const items = similar
        .map((p) =>
          `- "${p.title}" (${p.projectType}): ${p.hoursActual}h reais, complexidade ${p.complexityScore}/10, budget ${p.budgetRange}`
        )
        .join("\n");
      similarContext = `\n\nPROJETOS SIMILARES ENTREGUES (use para calibrar estimativas):\n${items}`;
    }
  } catch {
    // Continua sem contexto extra
  }

  // ── Prompt de geração de escopo ─────────────────────────────────────────
  const briefingText = `
Tipo de projeto: ${briefing.projectType}
Problema principal: ${briefing.painPoints}
Público-alvo: ${briefing.targetAudience}
Funcionalidades solicitadas: ${briefing.features.join(", ")}${briefing.customFeatures ? `\nOutras funcionalidades: ${briefing.customFeatures}` : ""}
Orçamento: ${briefing.budget}
Prazo: ${briefing.timeline}
Complexidade estimada: ${briefing.complexityScore ?? "não calculada"}/10
${similarContext}
`.trim();

  const prompt = `Você é um arquiteto de software sênior. Com base no briefing abaixo, gere um escopo técnico detalhado.

BRIEFING:
${briefingText}

Retorne APENAS um JSON válido com esta estrutura exata (sem markdown, sem explicações):
{
  "features": [
    {
      "name": "nome da funcionalidade",
      "description": "o que faz em 1-2 frases",
      "priority": "high | medium | low",
      "estimatedHours": número inteiro,
      "area": "frontend | backend | fullstack | infra | design"
    }
  ],
  "userStories": [
    {
      "role": "tipo de utilizador",
      "action": "o que ele faz",
      "goal": "qual o objetivo"
    }
  ],
  "screens": ["lista de telas/páginas necessárias"],
  "integrations": ["serviços/APIs externos necessários"],
  "techRecommended": ["stack tecnológica recomendada"],
  "hoursEstimate": número total de horas,
  "costMin": custo mínimo em euros (hoursEstimate * 45),
  "costMax": custo máximo em euros (hoursEstimate * 85),
  "confidence": percentual de confiança da estimativa (0-100)
}

Seja preciso e realista. Baseie as horas em desenvolvimento profissional real, não em estimativas otimistas.`;

  let raw: string;
  try {
    const result = await geminiGenerate(prompt, {
      temperature: 0.2,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    });
    raw = result.text;
    if (!raw) {
      const reason = result.finishReason ?? "unknown";
      return NextResponse.json({ error: `Gemini não retornou conteúdo (finishReason: ${reason}).` }, { status: 502 });
    }
  } catch (err) {
    const status = err instanceof GeminiError ? err.status : 500;
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Gemini error: ${status}`, detail }, { status: 502 });
  }

  // Extracção robusta: encontrar o primeiro { e último } para isolar o JSON
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  const cleaned = jsonStart !== -1 && jsonEnd > jsonStart
    ? raw.slice(jsonStart, jsonEnd + 1)
    : raw.replaceAll(/```json\s*/gi, "").replaceAll(/```\s*/g, "").trim();

  let parsed: GeneratedScope;
  try {
    parsed = JSON.parse(cleaned) as GeneratedScope;
  } catch {
    return NextResponse.json({ error: `Resposta inválida do modelo. Início: ${cleaned.slice(0, 200)}` }, { status: 502 });
  }

  // Garantir que costMin/costMax estejam corretos mesmo que o modelo erre
  const hoursEstimate = Math.max(1, parsed.hoursEstimate ?? 0);
  const costMin = Math.round(hoursEstimate * HOURLY_RATE.min);
  const costMax = Math.round(hoursEstimate * HOURLY_RATE.max);

  // ── Persistir / atualizar no banco ──────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scope = await (prisma as any).scope.upsert({
    where: { briefingId },
    create: {
      briefingId,
      features: parsed.features as object[],
      userStories: parsed.userStories as object[],
      screens: parsed.screens,
      integrations: parsed.integrations,
      techRecommended: parsed.techRecommended,
      hoursEstimate,
      costMin,
      costMax,
      confidence: Math.min(100, Math.max(0, parsed.confidence ?? 70)),
    },
    update: {
      features: parsed.features as object[],
      userStories: parsed.userStories as object[],
      screens: parsed.screens,
      integrations: parsed.integrations,
      techRecommended: parsed.techRecommended,
      hoursEstimate,
      costMin,
      costMax,
      confidence: Math.min(100, Math.max(0, parsed.confidence ?? 70)),
      updatedAt: new Date(),
    },
  });

  // Atualizar status do briefing para IN_ANALYSIS
  await prisma.briefing.update({
    where: { id: briefingId },
    data: { status: "IN_ANALYSIS" },
  });

  return NextResponse.json({ scope }, { status: 201 });
}
