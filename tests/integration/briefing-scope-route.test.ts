import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  briefingFindFirst: vi.fn(),
  briefingUpdate: vi.fn(),
  scopeFindUnique: vi.fn(),
  scopeUpsert: vi.fn(),
  referenceProjectFindMany: vi.fn(),
  generateEmbedding: vi.fn(),
  buildEmbeddingText: vi.fn(),
  cosineSimilarity: vi.fn(),
  geminiGenerate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    briefing: {
      findFirst: mocks.briefingFindFirst,
      update: mocks.briefingUpdate,
    },
    scope: {
      findUnique: mocks.scopeFindUnique,
      upsert: mocks.scopeUpsert,
    },
    referenceProject: {
      findMany: mocks.referenceProjectFindMany,
    },
  },
}));

vi.mock("@/lib/embeddings", () => ({
  generateEmbedding: mocks.generateEmbedding,
  buildEmbeddingText: mocks.buildEmbeddingText,
  cosineSimilarity: mocks.cosineSimilarity,
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

import { POST } from "@/app/api/briefing/scope/route";

describe("POST /api/briefing/scope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    mocks.auth.mockResolvedValue({ user: { id: "user_1" } });
    mocks.briefingFindFirst.mockResolvedValue({
      id: "brief_1",
      userId: "user_1",
      projectType: "website",
      painPoints: "processo manual",
      targetAudience: "clientes",
      features: ["auth"],
      customFeatures: "",
      budget: "3k-8k",
      timeline: "normal",
      complexityScore: 6,
    });
    mocks.scopeFindUnique.mockResolvedValue(null);
    mocks.buildEmbeddingText.mockReturnValue("scope text");
    mocks.generateEmbedding.mockResolvedValue([0.1, 0.2]);
    mocks.referenceProjectFindMany.mockResolvedValue([]);
    mocks.geminiGenerate.mockResolvedValue({
      text: JSON.stringify({
        features: [{ name: "Login", description: "Autenticação", priority: "high", estimatedHours: 12, area: "backend" }],
        userStories: [{ role: "cliente", action: "entrar", goal: "aceder ao portal" }],
        screens: ["Login"],
        integrations: ["Stripe"],
        techRecommended: ["Next.js"],
        hoursEstimate: 120,
        costMin: 5400,
        costMax: 10200,
        confidence: 80,
      }),
    });
    mocks.scopeUpsert.mockResolvedValue({ id: "scope_1", briefingId: "brief_1", hoursEstimate: 120 });
    mocks.briefingUpdate.mockResolvedValue({ id: "brief_1", status: "IN_ANALYSIS" });
  });

  it("retorna 401 quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await POST(new NextRequest("http://localhost/api/briefing/scope", {
      method: "POST",
      body: JSON.stringify({ briefingId: "brief_1" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autenticado.");
  });

  it("retorna 400 quando briefingId nao foi enviado", async () => {
    const response = await POST(new NextRequest("http://localhost/api/briefing/scope", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("briefingId obrigatório.");
  });

  it("retorna escopo existente quando regenerate nao foi pedido", async () => {
    mocks.scopeFindUnique.mockResolvedValue({ id: "scope_existing", briefingId: "brief_1" });

    const response = await POST(new NextRequest("http://localhost/api/briefing/scope", {
      method: "POST",
      body: JSON.stringify({ briefingId: "brief_1" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.scope.id).toBe("scope_existing");
    expect(mocks.geminiGenerate).not.toHaveBeenCalled();
  });

  it("gera e persiste novo escopo quando necessario", async () => {
    const response = await POST(new NextRequest("http://localhost/api/briefing/scope", {
      method: "POST",
      body: JSON.stringify({ briefingId: "brief_1", regenerate: true }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.scope.id).toBe("scope_1");
    expect(mocks.scopeUpsert).toHaveBeenCalledTimes(1);
    expect(mocks.briefingUpdate).toHaveBeenCalledTimes(1);
  });
});