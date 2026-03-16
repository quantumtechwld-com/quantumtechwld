/**
 * POST /api/library/add
 * Adiciona um projeto entregue à biblioteca de referência vetorizada.
 * Gera o embedding via Gemini e persiste o JSON no PostgreSQL.
 *
 * Body:
 * {
 *   title: string,
 *   description: string,        // resumo do que foi construído
 *   projectType: string,
 *   features: string[],
 *   techStack: string[],
 *   complexityScore: number,
 *   hoursActual: number,
 *   budgetRange: string,
 *   briefingId?: string         // link com o Briefing original (opcional)
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, buildEmbeddingText } from "@/lib/embeddings";
import { auth } from "@/auth";

type AddPayload = {
  title: string;
  description: string;
  projectType: string;
  features: string[];
  techStack: string[];
  complexityScore: number;
  hoursActual: number;
  budgetRange: string;
  briefingId?: string;
};

function isValid(b: Partial<AddPayload>): b is AddPayload {
  return Boolean(
    b.title?.trim() &&
    b.description?.trim() &&
    b.projectType?.trim() &&
    Array.isArray(b.features) &&
    Array.isArray(b.techStack) &&
    typeof b.complexityScore === "number" &&
    typeof b.hoursActual === "number" &&
    b.budgetRange?.trim()
  );
}

export async function POST(request: NextRequest) {
  // Somente usuários autenticados no portal podem adicionar projetos
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: Partial<AddPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  // Gerar embedding
  let embedding: number[];
  try {
    const text = buildEmbeddingText({
      projectType: body.projectType,
      description: body.description,
      features: body.features,
      techStack: body.techStack,
    });
    embedding = await generateEmbedding(text);
  } catch (err) {
    console.error("Erro ao gerar embedding:", err);
    return NextResponse.json({ error: "Falha ao gerar embedding." }, { status: 502 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const project = await (prisma as any).referenceProject.create({
    data: {
      title:          body.title,
      description:    body.description,
      projectType:    body.projectType,
      features:       body.features,
      techStack:      body.techStack,
      complexityScore: body.complexityScore,
      hoursActual:    body.hoursActual,
      budgetRange:    body.budgetRange,
      briefingId:     body.briefingId ?? null,
      embedding:      JSON.stringify(embedding),
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: project.id }, { status: 201 });
}
