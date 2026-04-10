import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding, buildEmbeddingText, cosineSimilarity } from "@/lib/embeddings";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const PROJECT_TYPES = ["website", "webapp", "mobile", "ecommerce", "automation", "system"];

const FEATURES = [
  "Autenticação de usuários",
  "Painel administrativo",
  "Pagamentos online",
  "E-mails automáticos",
  "Dashboard com gráficos",
  "API para integrações",
  "Chat / Suporte",
  "Blog / CMS",
  "Multi-idioma",
  "Notificações push",
  "Relatórios exportáveis",
  "Integração com ERP/CRM",
];

const BUDGETS = ["Até €3.000", "€3.000 – €8.000", "€8.000 – €20.000", "Acima de €20.000"];

const TIMELINES = [
  "Urgente (< 30 dias)",
  "Normal (1–3 meses)",
  "Planejado (3–6 meses)",
  "Flexível",
];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as { text?: string };
  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "Texto vazio." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada." }, { status: 500 });
  }

  // ── S6: Buscar projetos similares para enriquecer o contexto do Gemini ──
  let similarContext = "";
  try {
    const queryEmbedding = await generateEmbedding(
      buildEmbeddingText({ projectType: "", description: text })
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
    })) as RefRow[];

    const similar = allProjects
      .map((p: RefRow) => ({
        ...p,
        similarity: cosineSimilarity(queryEmbedding, JSON.parse(p.embedding) as number[]),
      }))
      .filter((p) => p.similarity >= 0.7)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    if (similar.length > 0) {
      const items = similar
        .map(
          (p) =>
            `- "${p.title}" (${p.projectType}): ${p.hoursActual}h reais, complexidade ${p.complexityScore}/10, orçamento ${p.budgetRange}, funcionalidades: ${p.features.join(", ")}`
        )
        .join("\n");
      similarContext = `\n\nPROJETOS SIMILARES JÁ ENTREGUES (use como referência para estimativas):\n${items}`;
    }
  } catch {
    // Biblioteca vazia ou banco indisponível — continua sem contexto extra
  }

  const prompt = `Analise o seguinte texto de briefing de projeto e extraia as informações estruturadas.${similarContext}

TEXTO DO CLIENTE:
${text}

Retorne APENAS um JSON válido com esta estrutura (sem markdown, sem explicações):
{
  "projectType": "um de: ${PROJECT_TYPES.join(", ")}",
  "painPoints": "descrição do problema principal (1-2 frases)",
  "targetAudience": "quem vai usar o produto",
  "features": ["apenas itens desta lista: ${FEATURES.join(", ")}"],
  "customFeatures": "outras funcionalidades mencionadas não na lista acima",
  "budget": "um de: ${BUDGETS.join(", ")} (string vazia se não mencionado)",
  "timeline": "um de: ${TIMELINES.join(", ")} (string vazia se não mencionado)"
}`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );

  if (!geminiRes.ok) {
    const errBody = await geminiRes.text().catch(() => "");
    console.error("Gemini error:", geminiRes.status, errBody);
    return NextResponse.json({ error: "Erro ao chamar Gemini." }, { status: 502 });
  }

  const geminiJson = await geminiRes.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
  };

  const parts = geminiJson.candidates?.[0]?.content?.parts ?? [];
  const rawText = parts
    .filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("\n");

  const match = /\{[\s\S]*\}/.exec(rawText);
  if (!match) {
    return NextResponse.json({ error: "Resposta inválida da IA." }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(match[0]) as Record<string, unknown>;
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "JSON inválido retornado pela IA." }, { status: 502 });
  }
}
