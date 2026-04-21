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
  orderUpdate: vi.fn(),
  userFindUnique: vi.fn(),
  orderMessageReadUpsert: vi.fn(),
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
      update: mocks.orderUpdate,
    },
    user: {
      findUnique: mocks.userFindUnique,
    },
    orderMessageRead: {
      upsert: mocks.orderMessageReadUpsert,
    },
  },
}));

vi.mock("@/components/home/LogoAnimated", () => ({
  default: () => <div>LogoAnimatedMock</div>,
}));

vi.mock("@/components/MessagesPanel", () => ({
  MessagesPanel: ({ orderId }: { orderId: string }) => <div>MessagesPanelMock:{orderId}</div>,
}));

vi.mock("@/app/admin/orders/[id]/OrderAdminActions", () => ({
  OrderAdminActions: ({ order, paymentPaid }: { order: { id: string; status: string }; paymentPaid?: boolean }) => (
    <div>OrderAdminActionsMock:{order.id}:{order.status}:{String(paymentPaid)}</div>
  ),
}));

import AdminOrderDetailPage from "@/app/admin/orders/[id]/page";

describe("AdminOrderDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN", email: "admin@example.com" } });
    mocks.userFindUnique.mockResolvedValue({ id: "admin_1" });
    mocks.orderMessageReadUpsert.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      title: "Nova funcionalidade premium",
      type: "new_feature",
      orderRef: "QTA-101",
      status: "IN_PRODUCTION",
      createdAt: new Date("2026-04-21T10:00:00.000Z"),
      urgency: "high",
      estimatedValue: 1200,
      description: "Implementar novo fluxo de onboarding",
      productionInfo: "Backend e dashboard administrativo",
      adminNote: "Entrega em duas fases",
      client: { id: "client_1", name: "Joao", email: "joao@example.com" },
      payment: {
        status: "PAID",
        amountCents: 120000,
        currency: "EUR",
        paidAt: new Date("2026-04-22T10:00:00.000Z"),
      },
      rating: {
        score: 5,
        comment: "Excelente entrega",
        createdAt: new Date("2026-04-23T10:00:00.000Z"),
      },
    });
  });

  it("renderiza detalhes do pedido, pagamento, rating e canal de mensagens", async () => {
    render(await AdminOrderDetailPage({ params: Promise.resolve({ id: "ord_1" }) }));

    expect(screen.getByText("Nova funcionalidade premium")).toBeInTheDocument();
    expect(screen.getByText("QTA-101")).toBeInTheDocument();
    expect(screen.getByText("Joao")).toBeInTheDocument();
    expect(screen.getByText("joao@example.com")).toBeInTheDocument();
    expect(screen.getByText("Implementar novo fluxo de onboarding")).toBeInTheDocument();
    expect(screen.getByText("Backend e dashboard administrativo")).toBeInTheDocument();
    expect(screen.getByText("Entrega em duas fases")).toBeInTheDocument();
    expect(screen.getByText("Pago ✓")).toBeInTheDocument();
    expect(screen.getByText("Excelente entrega")).toBeInTheDocument();
    expect(screen.getByText("OrderAdminActionsMock:ord_1:IN_PRODUCTION:true")).toBeInTheDocument();
    expect(screen.getByText("MessagesPanelMock:ord_1")).toBeInTheDocument();
    expect(mocks.orderMessageReadUpsert).toHaveBeenCalledTimes(1);
  });

  it("muda pedido pendente para evaluating antes de renderizar as acoes", async () => {
    mocks.orderFindUnique.mockResolvedValue({
      id: "ord_1",
      title: null,
      type: "support",
      orderRef: null,
      status: "PENDING",
      createdAt: new Date("2026-04-21T10:00:00.000Z"),
      urgency: "normal",
      estimatedValue: null,
      description: "Apoio técnico mensal",
      productionInfo: null,
      adminNote: null,
      client: { id: "client_1", name: "Joao", email: "joao@example.com" },
      payment: null,
      rating: null,
    });

    render(await AdminOrderDetailPage({ params: Promise.resolve({ id: "ord_1" }) }));

    expect(mocks.orderUpdate).toHaveBeenCalledWith({ where: { id: "ord_1" }, data: { status: "EVALUATING" } });
    expect(screen.getByText("OrderAdminActionsMock:ord_1:EVALUATING:false")).toBeInTheDocument();
  });
});