import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// ─── POST /api/proposal/[id]/rewrite ─────────────────────────────────────────
// Admin seleciona um trecho da proposta e pede reescrita pela IA.
// Corpo: { excerpt: string, instruction?: string }
// Retorna: { rewritten: string }

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas admin pode usar esta funcionalidade." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as { excerpt?: string; instruction?: string };

  if (!body.excerpt?.trim()) {
    return NextResponse.json({ error: "Selecione um trecho para reescrever." }, { status: 422 });
  }

  const proposal = await db.proposal.findUnique({
    where: { id },
    select: { id: true, briefing: { select: { projectType: true } } },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada." }, { status: 500 });
  }

  const instruction = body.instruction?.trim()
    ? `Instrução adicional: ${body.instruction}`
    : "";

  const prompt = `És um redator especialista em propostas comerciais de agências digitais.
Tens um trecho de uma proposta para o projeto "${proposal.briefing.projectType}" que precisa de ser melhorado.

TRECHO ORIGINAL:
${body.excerpt}

${instruction}

Reescreve o trecho de forma mais clara, profissional e persuasiva, mantendo o mesmo sentido e informações. 
Responde APENAS com o texto reescrito, sem explicações ou comentários adicionais.`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.text().catch(() => "");
    return NextResponse.json({ error: `Gemini error: ${geminiRes.status}`, detail: err }, { status: 502 });
  }

  interface GeminiResponse {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  }
  const data = (await geminiRes.json()) as GeminiResponse;
  const rewritten = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

  if (!rewritten) {
    return NextResponse.json({ error: "IA não retornou resultado." }, { status: 502 });
  }

  return NextResponse.json({ rewritten });
}

