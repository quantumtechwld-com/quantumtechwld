import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  orderFindMany: vi.fn(),
  userFindUnique: vi.fn(),
  createOrderWithRef: vi.fn(),
  sendMail: vi.fn().mockResolvedValue(undefined),
  orderFinancialDeleteMany: vi.fn().mockResolvedValue(undefined),
  orderFinancialCreate: vi.fn().mockResolvedValue({ id: "fin_1" }),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
    },
    order: {
      findMany: mocks.orderFindMany,
    },
    orderFinancial: {
      deleteMany: mocks.orderFinancialDeleteMany,
      create: mocks.orderFinancialCreate,
    },
  },
}));

vi.mock("@/services/orders/createOrder", () => ({
  VALID_ORDER_TYPES: ["new_feature", "bug_fix", "new_project", "support", "other", "contact"],
  VALID_ORDER_URGENCIES: ["low", "normal", "high", "critical"],
  createOrderWithRef: mocks.createOrderWithRef,
}));

vi.mock("@/lib/email", () => ({
  sendMail: mocks.sendMail,
  tplOrderProposalSent: vi.fn().mockReturnValue("<html>proposta</html>"),
}));

vi.mock("@/lib/app-url", () => ({
  appUrl: () => "https://quantumtechwld.com",
}));

import { GET, POST } from "@/app/api/admin/orders/route";

describe("GET /api/admin/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "admin_1", email: "admin@example.com", role: "ADMIN" } });
    mocks.orderFindMany.mockResolvedValue([{ id: "ord_1" }]);
    mocks.userFindUnique.mockResolvedValue({
      id: "client_1",
      name: "Joao",
      email: "joao@example.com",
      company: "Quantum Client",
      role: "CLIENT",
      status: "ACTIVE",
      organizationId: null,
    });
    mocks.createOrderWithRef.mockResolvedValue({ id: "ord_2" });
  });

  it("retorna 401 quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/admin/orders"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Não autenticado.");
  });

  it("retorna 403 quando nao e admin", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "client@example.com", role: "CLIENT" } });

    const response = await GET(new NextRequest("http://localhost/api/admin/orders"));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Acesso negado.");
  });

  it("lista pedidos com filtros validos", async () => {
    const response = await GET(new NextRequest("http://localhost/api/admin/orders?status=APPROVED&clientId=user_1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.orders).toHaveLength(1);
    expect(mocks.orderFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: "APPROVED", clientId: "user_1" },
      take: 100,
    }));
  });

  it("cria pedido para cliente ativo quando o utilizador e admin", async () => {
    const response = await POST(new NextRequest("http://localhost/api/admin/orders", {
      method: "POST",
      body: JSON.stringify({
        clientId: "client_1",
        type: "support",
        title: "Suporte recorrente",
        description: "Abrir backlog recorrente para cliente enterprise",
        urgency: "high",
      }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.order.id).toBe("ord_2");
    expect(mocks.createOrderWithRef).toHaveBeenCalledWith(expect.objectContaining({
      clientId: "client_1",
      createdByAdminId: "admin_1",
    }));
  });

  it("cria pedido em PROPOSAL_SENT e envia email quando campos de proposta sao fornecidos", async () => {
    mocks.createOrderWithRef.mockResolvedValue({
      id: "ord_3",
      status: "PROPOSAL_SENT",
      type: "new_project",
      title: "Plataforma de vendas",
      estimatedValue: 2500,
      productionInfo: "Desenvolvimento full-stack em 4 semanas.",
    });

    const response = await POST(new NextRequest("http://localhost/api/admin/orders", {
      method: "POST",
      body: JSON.stringify({
        clientId: "client_1",
        type: "new_project",
        title: "Plataforma de vendas",
        description: "Criar plataforma de e-commerce B2B.",
        urgency: "high",
        productionInfo: "Desenvolvimento full-stack em 4 semanas.",
        estimatedValue: 2500,
        selectedCurrency: "EUR",
        adminNote: "Arrancar em maio.",
        downPaymentPct: 50,
        paymentMethod: "STRIPE",
      }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.order.id).toBe("ord_3");
    expect(mocks.createOrderWithRef).toHaveBeenCalledWith(expect.objectContaining({
      productionInfo: "Desenvolvimento full-stack em 4 semanas.",
      estimatedValue: 2500,
      adminNote: "Arrancar em maio.",
    }));
    // Email deve ser enviado de forma assíncrona
    await vi.waitFor(() => expect(mocks.sendMail).toHaveBeenCalled());
  });

  it("propaga organizationId do cliente ao criar pedido pelo admin", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "client_1",
      name: "Joao",
      email: "joao@example.com",
      company: "Empresa XYZ",
      role: "CLIENT",
      status: "ACTIVE",
      organizationId: "org_123",
    });
    mocks.createOrderWithRef.mockResolvedValue({ id: "ord_org" });

    await POST(new NextRequest("http://localhost/api/admin/orders", {
      method: "POST",
      body: JSON.stringify({
        clientId: "client_1",
        type: "support",
        title: "Pedido da empresa",
        description: "Pedido criado pelo admin para cliente com organização",
      }),
      headers: { "content-type": "application/json" },
    }));

    // Garante que organizationId do cliente é propagado para o pedido
    expect(mocks.createOrderWithRef).toHaveBeenCalledWith(expect.objectContaining({
      organizationId: "org_123",
    }));
  });

  it("cria pedido sem organizationId quando cliente nao tem organizacao", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "client_2",
      name: "Maria",
      email: "maria@example.com",
      company: null,
      role: "CLIENT",
      status: "ACTIVE",
      organizationId: null,
    });
    mocks.createOrderWithRef.mockResolvedValue({ id: "ord_no_org" });

    await POST(new NextRequest("http://localhost/api/admin/orders", {
      method: "POST",
      body: JSON.stringify({
        clientId: "client_2",
        type: "support",
        title: "Pedido individual",
        description: "Pedido de cliente sem organização",
      }),
      headers: { "content-type": "application/json" },
    }));

    expect(mocks.createOrderWithRef).toHaveBeenCalledWith(expect.objectContaining({
      organizationId: null,
    }));
  });

  it("retorna 422 quando o cliente selecionado nao e ativo", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "client_1",
      name: "Joao",
      email: "joao@example.com",
      company: "Quantum Client",
      role: "CLIENT",
      status: "PENDING",
      organizationId: null,
    });

    const response = await POST(new NextRequest("http://localhost/api/admin/orders", {
      method: "POST",
      body: JSON.stringify({
        clientId: "client_1",
        type: "support",
        title: "Suporte recorrente",
        description: "Abrir backlog recorrente para cliente enterprise",
      }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Só é possível criar pedido para clientes ativos.");
  });

  it("retorna 422 quando PIX manual e usado para cliente com moeda contratual nao BRL", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "client_us",
      name: "John",
      email: "john@example.com",
      company: null,
      locale: "en-US",
      billingCurrency: null,
      role: "CLIENT",
      status: "ACTIVE",
      organizationId: null,
      organization: null,
    });

    const response = await POST(new NextRequest("http://localhost/api/admin/orders", {
      method: "POST",
      body: JSON.stringify({
        clientId: "client_us",
        type: "new_project",
        title: "Projeto em USD",
        description: "Pedido internacional",
        productionInfo: "Execução em 3 semanas",
        estimatedValue: 500,
        selectedCurrency: "USD",
        paymentMethod: "MANUAL_PIX",
      }),
      headers: { "content-type": "application/json" },
    }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toContain("PIX manual");
    expect(mocks.createOrderWithRef).not.toHaveBeenCalled();
  });
});