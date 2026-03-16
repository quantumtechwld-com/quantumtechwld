/**
 * POST /api/library/similar
 * Busca os projetos mais similares da biblioteca dado um briefing de entrada.
 * Usa cosine similarity calculada no lado da aplicação (TypeScript).
 *
 * Body:
 * {
 *   projectType: string,
 *   description: string,
 *   features?: string[],
 *   limit?: number           // padrão: 3
 * }
 *
 * Response:
 * { projects: SimilarProject[] }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, buildEmbeddingText, cosineSimilarity } from "@/lib/embeddings";

const MIN_SIMILARITY = 0.7;

type RawProject = {
  id: string;
  title: string;
  description: string;
  projectType: string;
  features: string[];
  techStack: string[];
  complexityScore: number;
  hoursActual: number;
  budgetRange: string;
  embedding: string;
};

type ScoredProject = Omit<RawProject, "embedding"> & { similarity: number };

export async function POST(request: NextRequest) {
  let body: {
    projectType?: string;
    description?: string;
    features?: string[];
    limit?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.description?.trim() && !body.projectType?.trim()) {
    return NextResponse.json({ error: "Informe description ou projectType." }, { status: 400 });
  }

  // Gerar embedding da query
  let queryEmbedding: number[];
  try {
    const text = buildEmbeddingText({
      projectType: body.projectType ?? "",
      description: body.description ?? "",
      features: body.features,
    });
    queryEmbedding = await generateEmbedding(text);
  } catch (err) {
    console.error("Erro ao gerar embedding:", err);
    return NextResponse.json({ error: "Falha ao gerar embedding." }, { status: 502 });
  }

  const limit = Math.min(Number(body.limit ?? 3), 10);

  // Buscar todos os projetos (biblioteca pequena — eficiente até ~1000 entradas)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allProjects = (await (prisma as any).referenceProject.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      projectType: true,
      features: true,
      techStack: true,
      complexityScore: true,
      hoursActual: true,
      budgetRange: true,
      embedding: true,
    },
  })) as RawProject[];

  // Calcular similaridade e filtrar
  const scored: ScoredProject[] = allProjects
    .map((p: RawProject): ScoredProject => {
      const vec = JSON.parse(p.embedding) as number[];
      const similarity = cosineSimilarity(queryEmbedding, vec);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { embedding: _e, ...rest } = p;
      return { ...rest, similarity };
    })
    .filter((p: ScoredProject) => p.similarity >= MIN_SIMILARITY)
    .sort((a: ScoredProject, b: ScoredProject) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((p: ScoredProject) => ({ ...p, similarity: Math.round(p.similarity * 10000) / 10000 }));

  return NextResponse.json({ projects: scored });
}
