import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  briefingFindUnique: vi.fn(),
  briefingUpdate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    briefing: {
      findUnique: mocks.briefingFindUnique,
      update: mocks.briefingUpdate,
    },
  },
}));

import { PATCH } from "@/app/api/admin/briefing/[id]/route";

describe("PATCH /api/admin/briefing/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.briefingFindUnique.mockResolvedValue({ id: "brief_1" });
    mocks.briefingUpdate.mockResolvedValue({ id: "brief_1", status: "APPROVED" });
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue({ user: { role: "CLIENT" } });

    const response = await PATCH(new NextRequest("http://localhost/api/admin/briefing/brief_1", {
      method: "PATCH",
      body: JSON.stringify({ status: "APPROVED" }),
      headers: { "content-type": "application/json" },
    }), { params: Promise.resolve({ id: "brief_1" }) });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Não autorizado.");
  });

  it("retorna 400 para status invalido", async () => {
    const response = await PATCH(new NextRequest("http://localhost/api/admin/briefing/brief_1", {
      method: "PATCH",
      body: JSON.stringify({ status: "INVALID" }),
      headers: { "content-type": "application/json" },
    }), { params: Promise.resolve({ id: "brief_1" }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Status inválido.");
  });

  it("atualiza o status do briefing", async () => {
    const response = await PATCH(new NextRequest("http://localhost/api/admin/briefing/brief_1", {
      method: "PATCH",
      body: JSON.stringify({ status: "APPROVED" }),
      headers: { "content-type": "application/json" },
    }), { params: Promise.resolve({ id: "brief_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.briefing.status).toBe("APPROVED");
    expect(mocks.briefingUpdate).toHaveBeenCalledTimes(1);
  });
});