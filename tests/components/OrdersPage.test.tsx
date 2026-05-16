/**
 * @vitest-environment jsdom
 */

import type { ComponentPropsWithoutRef } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
  userFindUnique: vi.fn(),
  orderFindMany: vi.fn(),
  orderMessageReadFindMany: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("lucide-react", () => ({
  ClipboardList: () => <span>ClipboardListIcon</span>,
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
    orderMessageRead: {
      findMany: mocks.orderMessageReadFindMany,
    },
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string, values?: Record<string, unknown>) => {
    if ((key === "ordersUnreadPlural" || key === "ordersUnreadSingle") && typeof values?.count === "number") {
      return `${key}:${values.count}`;
    }
    return key;
  },
  getLocale: async () => "pt-BR",
}));

import OrdersPage from "@/app/portal/(app)/orders/page";

describe("OrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "client@example.com" } });
    mocks.userFindUnique.mockResolvedValue({ id: "user_1" });
    mocks.orderFindMany.mockResolvedValue([]);
    mocks.orderMessageReadFindMany.mockResolvedValue([]);
  });

  it("renderiza empty state quando o cliente ainda nao tem pedidos", async () => {
    render(await OrdersPage());

    expect(screen.getByText("ordersTitle")).toBeInTheDocument();
    expect(screen.getByText("ordersEmptyTitle")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ordersFirstOrder" })).toHaveAttribute("href", "/portal/orders/new");
    expect(screen.getByRole("link", { name: "ordersNewBtn" })).toHaveAttribute("href", "/portal/orders/new");
  });

  it("renderiza lista com badge de mensagens nao lidas e link para detalhe", async () => {
    mocks.orderFindMany.mockResolvedValue([
      {
        id: "ord_1",
        title: "Novo dashboard executivo",
        type: "new_feature",
        orderRef: "QTA-500",
        description: "Descrição longa do pedido para validar o cartão da listagem.",
        status: "PROPOSAL_SENT",
        createdAt: new Date("2026-04-21T10:00:00.000Z"),
        messages: [
          { id: "m1", createdAt: new Date("2026-04-21T11:00:00.000Z") },
          { id: "m2", createdAt: new Date("2026-04-21T12:00:00.000Z") },
        ],
      },
    ]);
    mocks.orderMessageReadFindMany.mockResolvedValue([
      { orderId: "ord_1", lastReadAt: new Date("2026-04-21T11:30:00.000Z") },
    ]);

    render(await OrdersPage());

    expect(screen.getByRole("link", { name: /Novo dashboard executivo/i })).toHaveAttribute("href", "/portal/orders/ord_1");
    expect(screen.getByText("Descrição longa do pedido para validar o cartão da listagem.")).toBeInTheDocument();
    expect(screen.getByText("ordersUnreadSingle:1")).toBeInTheDocument();
    expect(screen.getByText("QTA-500")).toBeInTheDocument();
  });
});