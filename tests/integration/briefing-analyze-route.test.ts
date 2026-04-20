import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  generateEmbedding: vi.fn(),
  buildEmbeddingText: vi.fn(),
  cosineSimilarity: vi.fn(),
  referenceProjectFindMany: vi.fn(),
  geminiGenerate: vi.fn(),
}));

vi.mock("@/lib/embeddings", () => ({
  generateEmbedding: mocks.generateEmbedding,
  buildEmbeddingText: mocks.buildEmbeddingText,
  cosineSimilarity: mocks.cosineSimilarity,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    referenceProject: {
      findMany: mocks.referenceProjectFindMany,
    },
  },
}));

vi.mock("@/lib/gemini", () => ({
  geminiGenerate: mocks.geminiGenerate,
  GeminiError: class GeminiError extends Error {
    status: number;
    constructor(message: string, status = 500) {
      super(message);
      this.status = status;
    }
  },
}));

import { POST } from "@/app/api/briefing/analyze/route";

describe("POST /api/briefing/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    mocks.buildEmbeddingText.mockReturnValue("briefing text");
    mocks.generateEmbedding.mockResolvedValue([0.1, 0.2]);
    mocks.referenceProjectFindMany.mockResolvedValue([]);
    mocks.geminiGenerate.mockResolvedValue({
      text: JSON.stringify({
        projectType: "website",
        painPoints: "Problema principal",
        targetAudience: "Pequenas empresas",
        features: ["auth"],
        customFeatures: "",
        budget: "3k-8k",
        timeline: "normal",
      }),
    });
  });

  it("retorna 400 quando o texto esta vazio", async () => {
    const response = await POST(new NextRequest("http://localhost/api/briefing/analyze", {
      method: "POST",
      body: JSON.stringify({ text: "" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errorCode).toBe("errEmptyText");
  });

  it("retorna 500 quando falta a chave Gemini", async () => {
    delete process.env.GEMINI_API_KEY;

    const response = await POST(new NextRequest("http://localhost/api/briefing/analyze", {
      method: "POST",
      body: JSON.stringify({ text: "Preciso de um site" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.errorCode).toBe("errGeminiKey");
  });

  it("retorna 502 quando a resposta do modelo nao contem JSON valido", async () => {
    mocks.geminiGenerate.mockResolvedValue({ text: "sem json" });

    const response = await POST(new NextRequest("http://localhost/api/briefing/analyze", {
      method: "POST",
      body: JSON.stringify({ text: "Preciso de um site" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.errorCode).toBe("errInvalidAiResponse");
  });

  it("retorna estrutura analisada quando o modelo responde corretamente", async () => {
    const response = await POST(new NextRequest("http://localhost/api/briefing/analyze", {
      method: "POST",
      body: JSON.stringify({ text: "Preciso de um site institucional com login" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.projectType).toBe("website");
    expect(body.features).toEqual(["auth"]);
  });
});