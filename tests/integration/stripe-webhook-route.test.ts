import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  paymentUpdate: vi.fn(),
  paymentUpdateMany: vi.fn(),
  paymentInstallmentUpdateMany: vi.fn(),
  orderUpdate: vi.fn(),
  sendMail: vi.fn(),
  tplOrderPaymentConfirmed: vi.fn(),
  tplOrderPaymentConfirmedAdmin: vi.fn(),
  appUrl: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: mocks.constructEvent,
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    payment: {
      update: mocks.paymentUpdate,
      updateMany: mocks.paymentUpdateMany,
    },
    paymentInstallment: {
      updateMany: mocks.paymentInstallmentUpdateMany,
    },
    order: {
      update: mocks.orderUpdate,
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendMail: mocks.sendMail,
  tplOrderPaymentConfirmed: mocks.tplOrderPaymentConfirmed,
  tplOrderPaymentConfirmedAdmin: mocks.tplOrderPaymentConfirmedAdmin,
}));

vi.mock("@/lib/app-url", () => ({
  appUrl: mocks.appUrl,
}));

import { POST } from "@/app/api/webhooks/stripe/route";

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.EMAIL_ADMIN = "admin@example.com";
    mocks.appUrl.mockReturnValue("https://quantumtechwld.com");
    mocks.paymentUpdate.mockResolvedValue({ id: "pay_1" });
    mocks.paymentUpdateMany.mockResolvedValue({ count: 1 });
    mocks.paymentInstallmentUpdateMany.mockResolvedValue({ count: 1 });
    mocks.orderUpdate.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      client: {
        name: "Joao Silva",
        email: "client@example.com",
      },
    });
    mocks.tplOrderPaymentConfirmed.mockReturnValue("<html>client</html>");
    mocks.tplOrderPaymentConfirmedAdmin.mockReturnValue("<html>admin</html>");
    mocks.sendMail.mockResolvedValue(undefined);
  });

  it("retorna 400 quando faltam assinatura ou secret", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const request = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing signature or secret");
  });

  it("retorna 400 quando a assinatura e invalida", async () => {
    mocks.constructEvent.mockImplementation(() => {
      throw new Error("invalid signature");
    });

    const request = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: {
        "content-type": "application/json",
        "stripe-signature": "sig_test",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid signature");
  });

  it("confirma pagamento e move pedido para producao no checkout.session.completed", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_1",
          metadata: { orderId: "ord_1" },
          payment_intent: "pi_test_1",
          amount_total: 12500,
        },
      },
    });

    const request = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({ id: "evt_1" }),
      headers: {
        "content-type": "application/json",
        "stripe-signature": "sig_test",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(mocks.paymentUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.orderUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(2);
  });

  it("marca pagamento como falhado em checkout.session.expired", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.expired",
      data: {
        object: {
          id: "cs_test_1",
        },
      },
    });

    const request = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({ id: "evt_2" }),
      headers: {
        "content-type": "application/json",
        "stripe-signature": "sig_test",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(mocks.paymentUpdateMany).toHaveBeenCalledTimes(1);
  });
});