import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getExchangeRate: vi.fn(),
}));

vi.mock("@/lib/currency", async () => {
  const actual = await vi.importActual<typeof import("@/lib/currency")>("@/lib/currency");
  return {
    ...actual,
    getExchangeRate: mocks.getExchangeRate,
  };
});

import {
  buildInstallments,
  lockContractAmount,
  resolveContractCurrency,
  validatePaymentMethodCurrency,
} from "@/services/finance/contractCurrency";

describe("contractCurrency service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getExchangeRate.mockResolvedValue(6);
  });

  it("resolve BRL from client locale when no explicit billing currency exists", () => {
    expect(resolveContractCurrency({ locale: "pt-BR" })).toBe("BRL");
  });

  it("prioritizes organization billing currency over locale", () => {
    expect(resolveContractCurrency({ locale: "pt-BR", organizationCurrency: "USD" })).toBe("USD");
  });

  it("prioritizes explicit proposal currency over organization defaults", () => {
    expect(resolveContractCurrency({ explicitCurrency: "BRL", organizationCurrency: "USD", locale: "en-US" })).toBe("BRL");
  });

  it("locks contract amount using FX and rounds to cents", async () => {
    const locked = await lockContractAmount({ baseAmount: 120, contractCurrency: "BRL" });
    expect(locked.contractCurrency).toBe("BRL");
    expect(locked.totalAmountCents).toBe(72000);
    expect(locked.estimatedValue).toBe(720);
    expect(mocks.getExchangeRate).toHaveBeenCalledWith("EUR", "BRL");
  });

  it("rejects PIX outside BRL", () => {
    expect(validatePaymentMethodCurrency("MANUAL_PIX", "USD")).toContain("PIX manual");
  });

  it("creates installment schedule preserving currency", () => {
    expect(buildInstallments(10000, "USD", 50, "STRIPE")).toEqual([
      expect.objectContaining({ sequence: 1, amountCents: 5000, currency: "USD", method: "STRIPE" }),
      expect.objectContaining({ sequence: 2, amountCents: 5000, currency: "USD", method: "STRIPE" }),
    ]);
  });
});