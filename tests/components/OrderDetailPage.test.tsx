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
  userFindUnique: vi.fn(),
  orderMessageReadUpsert: vi.fn(),
  convertAndFormatByLocale: vi.fn(),
  getCurrencyForLocale: vi.fn(),
  getExchangeRate: vi.fn(),
  formatCurrency: vi.fn(),
  normalizeSupportedCurrency: vi.fn(),
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
    user: {
      findUnique: mocks.userFindUnique,
    },
    orderMessageRead: {
      upsert: mocks.orderMessageReadUpsert,
    },
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
  getLocale: async () => "pt-BR",
}));

vi.mock("@/app/portal/(app)/orders/[id]/OrderClientActions", () => ({
  OrderClientActions: ({ order }: { order: { id: string } }) => <div>OrderClientActionsMock:{order.id}</div>,
}));

vi.mock("@/components/MessagesPanel", () => ({
  MessagesPanel: ({ orderId }: { orderId: string }) => <div>MessagesPanelMock:{orderId}</div>,
}));

vi.mock("@/app/portal/(app)/orders/[id]/PayOrderButton", () => ({
  PayOrderButton: ({ orderId }: { orderId: string }) => <div>PayOrderButtonMock:{orderId}</div>,
}));

vi.mock("@/components/PixPaymentPanel", () => ({
  PixPaymentPanel: ({ amountCents, installmentLabel }: { amountCents: number; installmentLabel?: string }) => (
    <div>PixPaymentPanelMock:{installmentLabel}:{amountCents}</div>
  ),
}));

vi.mock("@/app/portal/(app)/orders/[id]/RatingWidget", () => ({
  RatingWidget: ({ orderId }: { orderId: string }) => <div>RatingWidgetMock:{orderId}</div>,
}));

vi.mock("@/lib/currency", () => ({
  convertAndFormatByLocale: mocks.convertAndFormatByLocale,
  getCurrencyForLocale: mocks.getCurrencyForLocale,
  getExchangeRate: mocks.getExchangeRate,
  formatCurrency: mocks.formatCurrency,
  normalizeSupportedCurrency: mocks.normalizeSupportedCurrency,
}));

import OrderDetailPage from "@/app/portal/(app)/orders/[id]/page";

describe("OrderDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "client@example.com" } });
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      title: "Nova funcionalidade crítica",
      type: "new_feature",
      orderRef: "QTA-001",
      status: "APPROVED",
      createdAt: new Date("2026-04-21T10:00:00.000Z"),
      description: "Descrição detalhada do pedido",
      urgency: "high",
      estimatedValue: 720,
      contractCurrency: "BRL",
      productionInfo: "Entrega em 10 dias úteis",
      adminNote: "Priorizar integração",
      client: { email: "client@example.com", name: "Joao" },
      payment: { status: "PENDING", amountCents: 12000 },
      rating: null,
    });
    mocks.userFindUnique.mockResolvedValue({ id: "user_1" });
    mocks.orderMessageReadUpsert.mockResolvedValue({});
    mocks.convertAndFormatByLocale.mockResolvedValue("R$ 720,00");
    mocks.getCurrencyForLocale.mockReturnValue("BRL");
    mocks.getExchangeRate.mockResolvedValue(6.17);
    mocks.formatCurrency.mockImplementation((value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`);
    mocks.normalizeSupportedCurrency.mockImplementation((value?: string | null) => {
      if (!value) return null;
      const normalized = value.toUpperCase();
      return ["BRL", "EUR", "USD"].includes(normalized) ? normalized : null;
    });
  });

  it("renderiza os dados principais do pedido e CTA de pagamento", async () => {
    render(await OrderDetailPage({
      params: Promise.resolve({ id: "ord_1" }),
      searchParams: Promise.resolve({}),
    }));

    expect(screen.getByText("Nova funcionalidade crítica")).toBeInTheDocument();
    expect(screen.getByText("QTA-001")).toBeInTheDocument();
    expect(screen.getByText("Descrição detalhada do pedido")).toBeInTheDocument();
    expect(screen.getByText("Entrega em 10 dias úteis")).toBeInTheDocument();
    expect(screen.getByText("Priorizar integração")).toBeInTheDocument();
    expect(screen.getByText("R$ 720,00")).toBeInTheDocument();
    expect(screen.getByText("OrderClientActionsMock:ord_1")).toBeInTheDocument();
    expect(screen.getByText("PayOrderButtonMock:ord_1")).toBeInTheDocument();
    expect(screen.getByText("MessagesPanelMock:ord_1")).toBeInTheDocument();
    expect(mocks.orderMessageReadUpsert).toHaveBeenCalledTimes(1);
  });

  it("mostra alerta de pagamento cancelado e link de fatura quando o pagamento ja foi confirmado", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      title: null,
      type: "new_feature",
      orderRef: null,
      status: "COMPLETED",
      createdAt: new Date("2026-04-21T10:00:00.000Z"),
      description: "Descrição detalhada do pedido",
      urgency: "high",
      estimatedValue: 720,
      contractCurrency: "BRL",
      productionInfo: "Entrega em 10 dias úteis",
      adminNote: null,
      client: { email: "client@example.com", name: "Joao" },
      payment: { status: "PAID", amountCents: 12000 },
      rating: { score: 5, comment: "Excelente" },
    });

    render(await OrderDetailPage({
      params: Promise.resolve({ id: "ord_1" }),
      searchParams: Promise.resolve({ payment: "cancelled" }),
    }));

    expect(screen.getByText("orderPayCancelled")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "orderInvoice" })).toHaveAttribute("href", "/portal/orders/ord_1/invoice");
    expect(screen.getByText("Excelente")).toBeInTheDocument();
    expect(screen.queryByText("PayOrderButtonMock:ord_1")).not.toBeInTheDocument();
  });

  it("converte a parcela PIX para BRL quando o locale resolvido e pt-BR", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      title: "PIX manual",
      type: "new_feature",
      orderRef: "QTA-PIX",
      status: "APPROVED",
      createdAt: new Date("2026-04-21T10:00:00.000Z"),
      description: "Pagamento via PIX",
      urgency: "high",
      estimatedValue: 720,
      contractCurrency: "BRL",
      productionInfo: "Entrega em 10 dias úteis",
      adminNote: null,
      client: { email: "client@example.com", name: "Joao" },
      payment: { status: "PENDING", amountCents: 12000 },
      financial: {
        status: "PENDING",
        installments: [
          {
            id: "inst_1",
            sequence: 1,
            amountCents: 9520,
            currency: "BRL",
            method: "MANUAL_PIX",
            status: "PENDING",
            dueDate: "2026-04-30T00:00:00.000Z",
          },
        ],
      },
      rating: null,
    });

    render(await OrderDetailPage({
      params: Promise.resolve({ id: "ord_1" }),
      searchParams: Promise.resolve({}),
    }));

    expect(screen.getByText("PixPaymentPanelMock:payInstallmentEntry:9520")).toBeInTheDocument();
  });
});