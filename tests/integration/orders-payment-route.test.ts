import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  orderFindUnique: vi.fn(),
  createPayment: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: mocks.orderFindUnique,
    },
  },
}));

vi.mock("@/services/orders/paymentService", () => ({
  createPayment: mocks.createPayment,
}));

import { POST } from "@/app/api/orders/payment/route";

describe("POST /api/orders/payment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      user: {
        email: "client@example.com",
      },
    });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      estimatedValue: 125,
      client: {
        email: "client@example.com",
      },
    });
    mocks.createPayment.mockResolvedValue({
      id: "pay_1",
      orderId: "ord_1",
      amountCents: 12500,
      status: "PENDING",
    });
  });

  it("retorna 401 quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await POST(new NextRequest("http://localhost/api/orders/payment", {
      method: "POST",
      body: JSON.stringify({ orderId: "ord_1" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autenticado.");
  });

  it("retorna 422 quando orderId nao e informado", async () => {
    const response = await POST(new NextRequest("http://localhost/api/orders/payment", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Parâmetro obrigatório: orderId.");
  });

  it("retorna 403 quando o pedido nao pertence ao utilizador", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      estimatedValue: 125,
      client: {
        email: "other@example.com",
      },
    });

    const response = await POST(new NextRequest("http://localhost/api/orders/payment", {
      method: "POST",
      body: JSON.stringify({ orderId: "ord_1" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Não autorizado.");
  });

  it("retorna 201 quando cria o pagamento com sucesso", async () => {
    const response = await POST(new NextRequest("http://localhost/api/orders/payment", {
      method: "POST",
      body: JSON.stringify({ orderId: "ord_1" }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.payment.id).toBe("pay_1");
    expect(mocks.createPayment).toHaveBeenCalledWith("ord_1", 125);
  });

  // ── Acesso por organização ────────────────────────────────────────────────

  it("membro da mesma org pode criar pagamento", async () => {
    mocks.auth.mockResolvedValue({
      user: { email: "member@org.com", role: "CLIENT", organizationId: "org_1" },
    });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      estimatedValue: 200,
      organizationId: "org_1",
      client: { email: "owner@org.com" },
    });

    const response = await POST(new NextRequest("http://localhost/api/orders/payment", {
      method: "POST",
      body: JSON.stringify({ orderId: "ord_1" }),
      headers: { "content-type": "application/json" },
    }));

    expect(response.status).toBe(201);
    expect(mocks.createPayment).toHaveBeenCalledWith("ord_1", 200);
  });

  it("membro de org diferente recebe 403", async () => {
    mocks.auth.mockResolvedValue({
      user: { email: "outsider@other.com", role: "CLIENT", organizationId: "org_2" },
    });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      estimatedValue: 200,
      organizationId: "org_1",
      client: { email: "owner@org.com" },
    });

    const response = await POST(new NextRequest("http://localhost/api/orders/payment", {
      method: "POST",
      body: JSON.stringify({ orderId: "ord_1" }),
      headers: { "content-type": "application/json" },
    }));

    expect(response.status).toBe(403);
  });
});