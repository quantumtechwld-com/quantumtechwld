import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  orderFindUnique: vi.fn(),
  orderFinancialFindUnique: vi.fn(),
  paymentUpsert: vi.fn(),
  orderUpdate: vi.fn(),
  appUrl: vi.fn(),
  stripeRetrieve: vi.fn(),
  stripeCreate: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: mocks.orderFindUnique,
      update: mocks.orderUpdate,
    },
    payment: {
      upsert: mocks.paymentUpsert,
    },
    orderFinancial: {
      findUnique: mocks.orderFinancialFindUnique,
    },
  },
}));

vi.mock("@/lib/app-url", () => ({
  appUrl: mocks.appUrl,
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        retrieve: mocks.stripeRetrieve,
        create: mocks.stripeCreate,
      },
    },
  },
}));

async function importRoute() {
  vi.resetModules();
  return import("@/app/api/orders/[id]/checkout/route");
}

describe("POST /api/orders/[id]/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_MOCK;
    mocks.auth.mockResolvedValue({
      user: {
        email: "client@example.com",
      },
    });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      status: "APPROVED",
      estimatedValue: 125,
      description: "Descricao do pedido",
      client: {
        email: "client@example.com",
        name: "Joao Silva",
      },
      payment: null,
    });
    mocks.paymentUpsert.mockResolvedValue({ id: "pay_1" });
    mocks.orderUpdate.mockResolvedValue({ id: "ord_1", status: "IN_PRODUCTION" });
    mocks.orderFinancialFindUnique.mockResolvedValue(null); // sem OrderFinancial por defeito
    mocks.appUrl.mockReturnValue("https://quantumtechwld.com");
    mocks.stripeRetrieve.mockResolvedValue({ status: "open", url: "https://stripe.test/existing" });
    mocks.stripeCreate.mockResolvedValue({
      id: "cs_test_1",
      url: "https://stripe.test/checkout",
    });
  });

  it("retorna 401 quando nao ha sessao", async () => {
    mocks.auth.mockResolvedValue(null);
    const { POST } = await importRoute();

    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/checkout", {
      method: "POST",
    }), { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("retorna 400 quando o pedido nao esta aprovado", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      status: "PENDING",
      estimatedValue: 125,
      client: { email: "client@example.com", name: "Joao Silva" },
      payment: null,
    });
    const { POST } = await importRoute();

    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/checkout", {
      method: "POST",
    }), { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Pedido deve estar Aprovado para pagamento");
  });

  it("em modo mock marca pagamento como pago e avanca o pedido", async () => {
    const { POST } = await importRoute();

    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/checkout", {
      method: "POST",
    }), { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mock).toBe(true);
    expect(body.url).toContain("/portal/orders/ord_1/payment/success");
    expect(mocks.paymentUpsert).toHaveBeenCalledTimes(1);
    expect(mocks.orderUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.stripeCreate).not.toHaveBeenCalled();
  });

  it("reutiliza sessao Stripe pendente quando ela ainda esta aberta", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_valid";
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      status: "APPROVED",
      estimatedValue: 125,
      description: "Descricao do pedido",
      client: {
        email: "client@example.com",
        name: "Joao Silva",
      },
      payment: {
        stripeSessionId: "cs_existing",
        status: "PENDING",
      },
    });
    const { POST } = await importRoute();

    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/checkout", {
      method: "POST",
    }), { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.url).toBe("https://stripe.test/existing");
    expect(mocks.stripeRetrieve).toHaveBeenCalledWith("cs_existing");
    expect(mocks.stripeCreate).not.toHaveBeenCalled();
    expect(mocks.paymentUpsert).not.toHaveBeenCalled();
  });

  it("cria nova sessao Stripe quando nao existe sessao pendente reutilizavel", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_valid";
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      status: "APPROVED",
      estimatedValue: 125,
      description: "Descricao do pedido",
      client: {
        email: "client@example.com",
        name: "Joao Silva",
      },
      payment: null,
    });
    const { POST } = await importRoute();

    const response = await POST(new NextRequest("http://localhost/api/orders/ord_1/checkout", {
      method: "POST",
    }), { params: Promise.resolve({ id: "ord_1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.url).toBe("https://stripe.test/checkout");
    expect(mocks.stripeCreate).toHaveBeenCalledTimes(1);
    expect(mocks.paymentUpsert).toHaveBeenCalledTimes(1);
  });
});