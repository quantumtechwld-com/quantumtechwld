import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  orderFindUnique: vi.fn(),
  orderUpdate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: mocks.orderFindUnique,
      update: mocks.orderUpdate,
    },
  },
}));

vi.mock("@/services/orders/createOrder", () => ({
  VALID_ORDER_TYPES: ["new_feature", "bug_fix", "new_project", "support", "other", "contact"],
  VALID_ORDER_URGENCIES: ["low", "normal", "high", "critical"],
}));

import { PATCH } from "@/app/api/admin/orders/[id]/route";

function makeRequest(id: string, body: unknown) {
  return new NextRequest(`http://localhost/api/admin/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("PATCH /api/admin/orders/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "admin_1", email: "admin@example.com", role: "ADMIN" } });
    mocks.orderFindUnique.mockResolvedValue({ status: "EVALUATING" });
    mocks.orderUpdate.mockResolvedValue({
      id: "ord_1",
      type: "bug_fix",
      title: "Novo título corrigido",
      description: "Descricao actualizada",
      urgency: "high",
      status: "EVALUATING",
    });
  });
  it("retorna 401 quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);
    const response = await PATCH(makeRequest("ord_1", { title: "X" }), { params: Promise.resolve({ id: "ord_1" }) });
    expect(response.status).toBe(401);
  });

  it("retorna 403 quando utilizador nao e admin", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "client@example.com", role: "CLIENT" } });
    const response = await PATCH(makeRequest("ord_1", { title: "X" }), { params: Promise.resolve({ id: "ord_1" }) });
    expect(response.status).toBe(403);
  });

  it("retorna 404 quando pedido nao existe", async () => {
    mocks.orderFindUnique.mockResolvedValue(null);
    const response = await PATCH(makeRequest("ord_x", { title: "X" }), { params: Promise.resolve({ id: "ord_x" }) });
    expect(response.status).toBe(404);
  });

  it("retorna 422 quando pedido nao esta em PENDING nem EVALUATING", async () => {
    mocks.orderFindUnique.mockResolvedValue({ status: "PROPOSAL_SENT" });
    const response = await PATCH(makeRequest("ord_1", { title: "X" }), { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error).toMatch(/Pendente ou Em análise/);
  });

  it("retorna 422 quando nenhum campo e enviado", async () => {
    const response = await PATCH(makeRequest("ord_1", {}), { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error).toMatch(/Nenhum campo/);
  });

  it("retorna 422 para tipo invalido", async () => {
    const response = await PATCH(makeRequest("ord_1", { type: "invalid" }), { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error).toMatch(/Tipo de pedido inválido/);
  });

  it("retorna 422 para urgencia invalida", async () => {
    const response = await PATCH(makeRequest("ord_1", { urgency: "extreme" }), { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error).toMatch(/Urgência inválida/);
  });

  it("actualiza tipo, titulo, descricao e urgencia com sucesso", async () => {
    const response = await PATCH(
      makeRequest("ord_1", { type: "bug_fix", title: "Novo título corrigido", description: "Descricao actualizada", urgency: "high" }),
      { params: Promise.resolve({ id: "ord_1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.order.title).toBe("Novo título corrigido");
    expect(mocks.orderUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "ord_1" },
      data: expect.objectContaining({ type: "bug_fix", urgency: "high" }),
    }));
  });

  it("actualiza apenas o titulo sem alterar outros campos", async () => {
    mocks.orderUpdate.mockResolvedValue({ id: "ord_1", title: "Só o título", status: "PENDING" });
    const response = await PATCH(
      makeRequest("ord_1", { title: "Só o título" }),
      { params: Promise.resolve({ id: "ord_1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.orderUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: { title: "Só o título" },
    }));
    expect(body.order.title).toBe("Só o título");
  });
});
