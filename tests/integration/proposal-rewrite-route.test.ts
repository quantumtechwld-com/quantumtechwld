import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  proposalFindUnique: vi.fn(),
  geminiGenerate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    proposal: {
      findUnique: mocks.proposalFindUnique,
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

import { POST } from "@/app/api/proposal/[id]/rewrite/route";

describe("POST /api/proposal/[id]/rewrite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com", role: "ADMIN" } });
    mocks.proposalFindUnique.mockResolvedValue({
      id: "prop_1",
      briefing: { projectType: "website" },
    });
    mocks.geminiGenerate.mockResolvedValue({ text: "Texto reescrito" });
  });

  it("retorna 401 quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await POST(new NextRequest("http://localhost/api/proposal/prop_1/rewrite", {
      method: "POST",
      body: JSON.stringify({ excerpt: "Trecho" }),
      headers: { "content-type": "application/json" },
    }), { params: Promise.resolve({ id: "prop_1" }) });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autenticado.");
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "client@example.com", role: "CLIENT" } });

    const response = await POST(new NextRequest("http://localhost/api/proposal/prop_1/rewrite", {
      method: "POST",
      body: JSON.stringify({ excerpt: "Trecho" }),
      headers: { "content-type": "application/json" },
    }), { params: Promise.resolve({ id: "prop_1" }) });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Apenas admin pode usar esta funcionalidade.");
  });

  it("retorna 422 quando nao ha trecho para reescrever", async () => {
    const response = await POST(new NextRequest("http://localhost/api/proposal/prop_1/rewrite", {
      method: "POST",
      body: JSON.stringify({ excerpt: "  " }),
      headers: { "content-type": "application/json" },
    }), { params: Promise.resolve({ id: "prop_1" }) });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Selecione um trecho para reescrever.");
  });

  it("retorna texto reescrito quando a IA responde", async () => {
    const response = await POST(new NextRequest("http://localhost/api/proposal/prop_1/rewrite", {
      method: "POST",
      body: JSON.stringify({ excerpt: "Trecho original", instruction: "Tornar mais direto" }),
      headers: { "content-type": "application/json" },
    }), { params: Promise.resolve({ id: "prop_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.rewritten).toBe("Texto reescrito");
    expect(mocks.geminiGenerate).toHaveBeenCalledTimes(1);
  });
});