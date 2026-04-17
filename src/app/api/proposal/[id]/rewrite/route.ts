import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { geminiGenerate, GeminiError } from "@/lib/gemini";

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

  if (!process.env.GEMINI_API_KEY) {
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

  let rewritten: string;
  try {
    const result = await geminiGenerate(prompt, { temperature: 0.5, maxOutputTokens: 2048 });
    rewritten = result.text.trim();
  } catch (err) {
    const status = err instanceof GeminiError ? err.status : 500;
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Gemini error: ${status}`, detail }, { status: 502 });
  }

  if (!rewritten) {
    return NextResponse.json({ error: "IA não retornou resultado." }, { status: 502 });
  }

  return NextResponse.json({ rewritten });
}

