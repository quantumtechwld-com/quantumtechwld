import "server-only";
/**
 * Gemini API Client — cliente centralizado com retry automático.
 *
 * - Modelo configurável via env GEMINI_MODEL (padrão: gemini-2.5-flash)
 * - Retry com exponential backoff em 429 (rate limit por minuto no plano pago)
 * - Extrai texto das parts ignorando thoughts (Gemini 2.5 thinking mode)
 */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";

export type GeminiPart = { text?: string; thought?: boolean };

export type GeminiResult = {
  text: string;
  finishReason?: string;
};

export type GeminiGenerateOptions = {
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
};

/**
 * Chama generateContent com retry automático em 429.
 * Lança erro em outros status não-OK.
 */
export async function geminiGenerate(
  prompt: string,
  options: GeminiGenerateOptions = {}
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.2,
      maxOutputTokens: options.maxOutputTokens ?? 8192,
      ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
    },
  });

  const MAX_RETRIES = 3;
  let lastError = "";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 2s, 4s
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (res.status === 429) {
      lastError = `429 rate limit (attempt ${attempt + 1}/${MAX_RETRIES})`;
      console.warn(`[gemini] ${lastError}`);
      continue;
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new GeminiError(res.status, detail);
    }

    interface RawResponse {
      candidates?: Array<{
        content?: { parts?: GeminiPart[] };
        finishReason?: string;
      }>;
    }

    const data = (await res.json()) as RawResponse;
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const finishReason = data.candidates?.[0]?.finishReason;

    // Gemini 2.5 thinking mode: partes marcadas com thought=true são raciocínio interno
    const text = [...parts]
      .reverse()
      .find((p) => !p.thought && p.text)?.text ?? "";

    return { text, finishReason };
  }

  throw new GeminiError(429, `Excedido limite de tentativas. Último erro: ${lastError}`);
}

export class GeminiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string
  ) {
    super(`Gemini error ${status}: ${detail.slice(0, 200)}`);
    this.name = "GeminiError";
  }
}
