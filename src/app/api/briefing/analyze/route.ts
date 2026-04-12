import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding, buildEmbeddingText, cosineSimilarity } from "@/lib/embeddings";
import { prisma } from "@/lib/prisma";

const PROJECT_TYPES = ["website", "webapp", "mobile", "ecommerce", "automation", "system"];

// Language-independent keys — must match wizard-data.ts constants exactly
const FEATURE_KEYS = ["auth", "admin", "payments", "emails", "dashboard", "api", "chat", "blog", "i18n", "push", "reports", "erp"];
const BUDGET_KEYS = ["under3k", "3k-8k", "8k-20k", "over20k"];
const TIMELINE_KEYS = ["urgent", "normal", "planned", "flexible"];

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { text?: string };
  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json({ errorCode: "errEmptyText" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ errorCode: "errGeminiKey" }, { status: 500 });
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

  const prompt = `Analyze the following project briefing text and extract structured information. Respond in the SAME language as the client text below.${similarContext}

CLIENT TEXT:
${text}

Return ONLY a valid JSON with this structure (no markdown, no explanations):
{
  "projectType": "one of: ${PROJECT_TYPES.join(", ")}",
  "painPoints": "description of the main problem (1-2 sentences, same language as client text)",
  "targetAudience": "who will use the product (same language as client text)",
  "features": ["only keys from this list: ${FEATURE_KEYS.join(", ")}"],
  "customFeatures": "other features mentioned not in the list above (same language as client text)",
  "budget": "one of: ${BUDGET_KEYS.join(", ")} (empty string if not mentioned)",
  "timeline": "one of: ${TIMELINE_KEYS.join(", ")} (empty string if not mentioned)"
}`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!geminiRes.ok) {
    const errBody = await geminiRes.text().catch(() => "");
    console.error("Gemini error:", geminiRes.status, errBody);
    return NextResponse.json(
      {
        errorCode: "errGeminiCall",
        detail: process.env.NODE_ENV === "production" ? undefined : errBody,
      },
      { status: 502 },
    );
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
    return NextResponse.json({ errorCode: "errInvalidAiResponse" }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(match[0]) as Record<string, unknown>;
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ errorCode: "errInvalidAiJson" }, { status: 502 });
  }
}
