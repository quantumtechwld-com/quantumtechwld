import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  briefingFindUnique: vi.fn(),
  scopeFindUnique: vi.fn(),
  proposalFindUnique: vi.fn(),
  proposalUpsert: vi.fn(),
  briefingUpdate: vi.fn(),
  geminiGenerate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    briefing: {
      findUnique: mocks.briefingFindUnique,
      update: mocks.briefingUpdate,
    },
    scope: {
      findUnique: mocks.scopeFindUnique,
    },
    proposal: {
      findUnique: mocks.proposalFindUnique,
      upsert: mocks.proposalUpsert,
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

import { POST } from "@/app/api/proposal/generate/route";

describe("POST /api/proposal/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.briefingFindUnique.mockResolvedValue({
      id: "brief_1",
      projectType: "website",
      painPoints: "processo manual",
      targetAudience: "clientes",
      budget: "3k-8k",
      timeline: "normal",
      user: { name: "Joao", email: "client@example.com" },
    });
    mocks.scopeFindUnique.mockResolvedValue({
      briefingId: "brief_1",
      features: [{ name: "Login", description: "Auth", priority: "high", estimatedHours: 10, area: "backend" }],
      techRecommended: ["Next.js"],
      integrations: ["Stripe"],
      hoursEstimate: 120,
      costMin: 5400,
      costMax: 10200,
      confidence: 80,
    });
    mocks.proposalFindUnique.mockResolvedValue(null);
    mocks.geminiGenerate.mockResolvedValue({
      text: JSON.stringify({ summary: "Resumo", content: "## Proposta" }),
    });
    mocks.proposalUpsert.mockResolvedValue({ id: "prop_1", status: "DRAFT", version: 1 });
    mocks.briefingUpdate.mockResolvedValue({ id: "brief_1", status: "PROPOSAL_SENT" });
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "CLIENT" } });

    const response = await POST(new NextRequest("http://localhost/api/proposal/generate", {
      method: "POST",
      body: JSON.stringify({ briefingId: "brief_1" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Não autorizado.");
  });

  it("retorna 422 quando nao existe escopo M2", async () => {
    mocks.scopeFindUnique.mockResolvedValue(null);

    const response = await POST(new NextRequest("http://localhost/api/proposal/generate", {
      method: "POST",
      body: JSON.stringify({ briefingId: "brief_1" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toContain("Nenhum escopo M2 encontrado");
  });

  it("gera proposta draft com versionamento inicial", async () => {
    const response = await POST(new NextRequest("http://localhost/api/proposal/generate", {
      method: "POST",
      body: JSON.stringify({ briefingId: "brief_1", send: false }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.proposal.id).toBe("prop_1");
    expect(mocks.proposalUpsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ version: 1, status: "DRAFT" }),
      update: expect.objectContaining({ version: 1, status: "DRAFT" }),
    }));
  });

  it("envia proposta e atualiza o briefing quando send=true", async () => {
    mocks.proposalFindUnique.mockResolvedValue({ briefingId: "brief_1", version: 2 });
    mocks.proposalUpsert.mockResolvedValue({ id: "prop_1", status: "SENT", version: 3 });

    const response = await POST(new NextRequest("http://localhost/api/proposal/generate", {
      method: "POST",
      body: JSON.stringify({ briefingId: "brief_1", send: true }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.proposal.status).toBe("SENT");
    expect(mocks.briefingUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.proposalUpsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ version: 3, status: "SENT" }),
      update: expect.objectContaining({ version: 3, status: "SENT" }),
    }));
  });
});