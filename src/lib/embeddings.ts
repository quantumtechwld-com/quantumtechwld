/**
 * S6 — Gemini Embeddings Utility
 * Usa o modelo text-embedding-004 (768 dimensões) disponível via Gemini API.
 * Não requer nenhuma dependência extra — usa o mesmo padrão fetch do projeto.
 * Embeddings são armazenados como JSON (TEXT) no PostgreSQL.
 * Similaridade calculada no lado da aplicação via cosine similarity.
 */

type EmbedResponse = {
  embedding?: { values?: number[] };
  error?: { message: string };
};

/**
 * Gera um embedding de 768 dimensões para o texto fornecido.
 * @throws Error se a API falhar ou a chave não estiver configurada.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text }] },
        taskType: "SEMANTIC_SIMILARITY",
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini Embedding error ${res.status}: ${body}`);
  }

  const json = (await res.json()) as EmbedResponse;

  if (!json.embedding?.values || json.embedding.values.length === 0) {
    throw new Error("Resposta de embedding inválida do Gemini.");
  }

  return json.embedding.values;
}

/**
 * Constrói o texto de entrada para embedding de um briefing/projeto.
 * Concatena os campos mais relevantes para a busca semântica.
 */
export function buildEmbeddingText(data: {
  projectType: string;
  description: string;
  features?: string[];
  techStack?: string[];
}): string {
  const parts = [
    `Tipo: ${data.projectType}`,
    `Descrição: ${data.description}`,
  ];
  if (data.features?.length) {
    parts.push(`Funcionalidades: ${data.features.join(", ")}`);
  }
  if (data.techStack?.length) {
    parts.push(`Stack: ${data.techStack.join(", ")}`);
  }
  return parts.join(". ");
}

/**
 * Calcula a similaridade coseno entre dois vetores (range 0–1).
 * 1 = idênticos, 0 = sem relação semântica.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
