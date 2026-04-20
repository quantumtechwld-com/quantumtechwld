import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  generateEmbedding: vi.fn(),
  buildEmbeddingText: vi.fn(),
  referenceProjectCreate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/embeddings", () => ({
  generateEmbedding: mocks.generateEmbedding,
  buildEmbeddingText: mocks.buildEmbeddingText,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    referenceProject: {
      create: mocks.referenceProjectCreate,
    },
  },
}));

import { POST } from "@/app/api/library/add/route";

describe("POST /api/library/add", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.buildEmbeddingText.mockReturnValue("embedding text");
    mocks.generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
    mocks.referenceProjectCreate.mockResolvedValue({ id: "ref_1" });
  });

  it("retorna 403 quando o utilizador nao e admin", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "CLIENT" } });

    const response = await POST(new NextRequest("http://localhost/api/library/add", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Não autorizado.");
  });

  it("retorna 400 quando os campos obrigatorios faltam", async () => {
    const response = await POST(new NextRequest("http://localhost/api/library/add", {
      method: "POST",
      body: JSON.stringify({ title: "Projeto" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Campos obrigatórios ausentes.");
  });

  it("retorna 502 quando falha a geracao do embedding", async () => {
    mocks.generateEmbedding.mockRejectedValue(new Error("gemini offline"));

    const response = await POST(new NextRequest("http://localhost/api/library/add", {
      method: "POST",
      body: JSON.stringify({
        title: "Projeto X",
        description: "Descricao",
        projectType: "website",
        features: ["auth"],
        techStack: ["nextjs"],
        complexityScore: 7,
        hoursActual: 120,
        budgetRange: "8k-20k",
      }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("Falha ao gerar embedding.");
  });

  it("cria projeto de referencia com sucesso", async () => {
    const response = await POST(new NextRequest("http://localhost/api/library/add", {
      method: "POST",
      body: JSON.stringify({
        title: "Projeto X",
        description: "Descricao",
        projectType: "website",
        features: ["auth"],
        techStack: ["nextjs"],
        complexityScore: 7,
        hoursActual: 120,
        budgetRange: "8k-20k",
      }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.id).toBe("ref_1");
    expect(mocks.referenceProjectCreate).toHaveBeenCalledTimes(1);
  });
});