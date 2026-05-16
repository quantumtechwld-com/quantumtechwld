/**
 * @vitest-environment jsdom
 */

import type { ComponentPropsWithoutRef } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
  notFound: vi.fn(),
  orderFindUnique: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  notFound: mocks.notFound,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: mocks.orderFindUnique,
    },
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string, values?: Record<string, unknown>) => {
    if (key === "invoicePaidAt" && typeof values?.date === "string") {
      return `invoicePaidAt:${values.date}`;
    }
    return key;
  },
  getLocale: async () => "pt-PT",
}));

vi.mock("@/app/portal/(app)/orders/[id]/invoice/PrintButton", () => ({
  PrintButton: () => <button type="button">PrintButtonMock</button>,
}));

import InvoicePage from "@/app/portal/(app)/orders/[id]/invoice/page";

describe("InvoicePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "client@example.com" } });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      type: "support",
      description: "Retainer mensal de suporte",
      client: {
        email: "client@example.com",
        name: "Joao",
        company: "Quantum Client",
        phone: "+351999999999",
      },
      payment: {
        status: "PAID",
        amountCents: 120000,
        currency: "EUR",
        paidAt: new Date("2026-04-21T10:00:00.000Z"),
        stripePaymentIntent: "pi_123",
      },
    });
  });

  it("renderiza a fatura paga com dados do cliente e pagamento", async () => {
    render(await InvoicePage({ params: Promise.resolve({ id: "ord_1" }) }));

    expect(screen.getAllByAltText("Quantum Technology")).toHaveLength(2);
    expect(screen.getByText("Joao")).toBeInTheDocument();
    expect(screen.getByText("Quantum Client")).toBeInTheDocument();
    expect(screen.getByText("Retainer mensal de suporte")).toBeInTheDocument();
    expect(screen.getByText(/pi_123/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "invoiceBack" })).toHaveAttribute("href", "/portal/orders/ord_1");
    expect(screen.getByRole("button", { name: "PrintButtonMock" })).toBeInTheDocument();
  });
});