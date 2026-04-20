import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  orderFindUnique: vi.fn(),
  paymentFindUnique: vi.fn(),
  paymentCreate: vi.fn(),
  paymentFindFirst: vi.fn(),
  paymentIntentCreate: vi.fn(),
  sendMail: vi.fn(),
  tplOrderPaymentConfirmed: vi.fn(),
  tplOrderPaymentConfirmedAdmin: vi.fn(),
  appUrl: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: mocks.orderFindUnique,
    },
    payment: {
      findUnique: mocks.paymentFindUnique,
      create: mocks.paymentCreate,
      findFirst: mocks.paymentFindFirst,
    },
  },
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    paymentIntents: {
      create: mocks.paymentIntentCreate,
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

import { createPayment, fetchPaymentByOrderId } from "@/services/orders/paymentService";

describe("paymentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "new_feature",
      client: {
        email: "client@example.com",
        name: "Joao Silva",
      },
    });
    mocks.paymentFindUnique.mockResolvedValue(null);
    mocks.paymentIntentCreate.mockResolvedValue({ id: "pi_1" });
    mocks.paymentCreate.mockResolvedValue({
      id: "pay_1",
      orderId: "ord_1",
      amountCents: 12500,
      status: "PENDING",
    });
    mocks.paymentFindFirst.mockResolvedValue({ id: "pay_existing" });
    mocks.sendMail.mockResolvedValue(undefined);
    mocks.tplOrderPaymentConfirmed.mockReturnValue("<html>client</html>");
    mocks.tplOrderPaymentConfirmedAdmin.mockReturnValue("<html>admin</html>");
    mocks.appUrl.mockReturnValue("https://quantumtechwld.com");
    process.env.ADMIN_EMAIL = "admin@example.com";
  });

  it("retorna pagamento existente sem criar novo intent", async () => {
    const existingPayment = { id: "pay_existing", orderId: "ord_1" };
    mocks.paymentFindUnique.mockResolvedValue(existingPayment);

    const result = await createPayment("ord_1", 125);

    expect(result).toEqual(existingPayment);
    expect(mocks.paymentIntentCreate).not.toHaveBeenCalled();
    expect(mocks.paymentCreate).not.toHaveBeenCalled();
  });

  it("cria payment intent e usa appUrl nos emails", async () => {
    const result = await createPayment("ord_1", 125);

    expect(result).toEqual(expect.objectContaining({ id: "pay_1" }));
    expect(mocks.paymentIntentCreate).toHaveBeenCalledWith(expect.objectContaining({
      amount: 12500,
      currency: "eur",
      metadata: { orderId: "ord_1" },
    }));
    expect(mocks.paymentCreate).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(2);
    expect(mocks.tplOrderPaymentConfirmed).toHaveBeenCalledWith(expect.objectContaining({
      orderUrl: "https://quantumtechwld.com/portal/orders/ord_1",
    }));
    expect(mocks.tplOrderPaymentConfirmedAdmin).toHaveBeenCalledWith(expect.objectContaining({
      adminUrl: "https://quantumtechwld.com/admin/orders/ord_1",
    }));
  });

  it("busca pagamento por orderId", async () => {
    const result = await fetchPaymentByOrderId("ord_1");

    expect(result).toEqual({ id: "pay_existing" });
    expect(mocks.paymentFindFirst).toHaveBeenCalledWith({ where: { orderId: "ord_1" } });
  });
});