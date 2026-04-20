import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  userFindUnique: vi.fn(),
  orderFindMany: vi.fn(),
  orderCreate: vi.fn(),
  sendMail: vi.fn(),
  tplOrderReceived: vi.fn(),
  generateOrderRefCandidates: vi.fn(),
  appUrl: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
    },
    order: {
      findMany: mocks.orderFindMany,
      create: mocks.orderCreate,
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendMail: mocks.sendMail,
  tplOrderReceived: mocks.tplOrderReceived,
}));

vi.mock("@/lib/order-ref", () => ({
  generateOrderRefCandidates: mocks.generateOrderRefCandidates,
}));

vi.mock("@/lib/app-url", () => ({
  appUrl: mocks.appUrl,
}));

import { GET, POST } from "@/app/api/orders/route";

describe("/api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      user: {
        id: "user_1",
        email: "client@example.com",
        role: "CLIENT",
      },
    });
    mocks.userFindUnique.mockResolvedValue({
      id: "user_1",
      name: "Joao Silva",
      email: "client@example.com",
      company: "Quantum",
    });
    mocks.orderFindMany.mockResolvedValue([{ id: "ord_1" }]);
    mocks.generateOrderRefCandidates.mockReturnValue(["QT-REF-001"]);
    mocks.orderCreate.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      title: "Nova funcionalidade",
      urgency: "normal",
      description: "Descricao do pedido",
      client: { name: "Joao Silva", email: "client@example.com" },
    });
    mocks.tplOrderReceived.mockReturnValue("<html>ok</html>");
    mocks.sendMail.mockResolvedValue(undefined);
    mocks.appUrl.mockReturnValue("https://quantumtechwld.com");
    process.env.ADMIN_EMAIL = "admin@example.com";
  });

  it("retorna 401 no GET quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autenticado.");
  });

  it("lista pedidos do utilizador autenticado no GET", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.orders).toHaveLength(1);
    expect(mocks.orderFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { clientId: "user_1" },
      take: 100,
    }));
  });

  it("retorna 422 quando o tipo do pedido e invalido", async () => {
    const request = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({
        type: "invalid_type",
        title: "Nova funcionalidade",
        description: "Descricao do pedido",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Tipo de pedido inválido.");
  });

  it("cria pedido valido e notifica admin", async () => {
    const request = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({
        type: "new_feature",
        title: "Nova funcionalidade",
        description: "Descricao do pedido",
        urgency: "normal",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.order.id).toBe("ord_1");
    expect(mocks.orderCreate).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
  });
});