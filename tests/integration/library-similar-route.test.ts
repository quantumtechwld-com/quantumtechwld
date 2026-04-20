import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  generateEmbedding: vi.fn(),
  buildEmbeddingText: vi.fn(),
  cosineSimilarity: vi.fn(),
  referenceProjectFindMany: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

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

import { POST } from "@/app/api/library/similar/route";

describe("POST /api/library/similar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user_1" } });
    mocks.buildEmbeddingText.mockReturnValue("embedding query");
    mocks.generateEmbedding.mockResolvedValue([0.1, 0.2]);
    mocks.referenceProjectFindMany.mockResolvedValue([
      {
        id: "ref_1",
        title: "Projeto Similar",
        description: "Desc",
        projectType: "website",
        features: ["auth"],
        techStack: ["nextjs"],
        complexityScore: 5,
        hoursActual: 80,
        budgetRange: "3k-8k",
        embedding: JSON.stringify([0.1, 0.2]),
      },
      {
        id: "ref_2",
        title: "Projeto Distante",
        description: "Desc",
        projectType: "mobile",
        features: ["push"],
        techStack: ["react-native"],
        complexityScore: 8,
        hoursActual: 200,
        budgetRange: "over20k",
        embedding: JSON.stringify([0.9, 0.9]),
      },
    ]);
    mocks.cosineSimilarity
      .mockReturnValueOnce(0.82)
      .mockReturnValueOnce(0.42);
  });

  it("retorna 401 quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await POST(new NextRequest("http://localhost/api/library/similar", {
      method: "POST",
      body: JSON.stringify({ description: "site institucional" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autenticado.");
  });

  it("retorna 400 quando faltam description e projectType", async () => {
    const response = await POST(new NextRequest("http://localhost/api/library/similar", {
      method: "POST",
      body: JSON.stringify({ features: ["auth"] }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Informe description ou projectType.");
  });

  it("retorna 502 quando falha a geracao do embedding", async () => {
    mocks.generateEmbedding.mockRejectedValue(new Error("embedding failed"));

    const response = await POST(new NextRequest("http://localhost/api/library/similar", {
      method: "POST",
      body: JSON.stringify({ description: "site institucional" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("Falha ao gerar embedding.");
  });

  it("retorna apenas projetos acima da similaridade minima", async () => {
    const response = await POST(new NextRequest("http://localhost/api/library/similar", {
      method: "POST",
      body: JSON.stringify({ description: "site institucional", limit: 5 }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.projects).toHaveLength(1);
    expect(body.projects[0].id).toBe("ref_1");
    expect(body.projects[0].similarity).toBe(0.82);
  });
});