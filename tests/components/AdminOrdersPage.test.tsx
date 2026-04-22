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
  userFindMany: vi.fn(),
  orderFindMany: vi.fn(),
  orderGroupBy: vi.fn(),
  orderMessageReadFindMany: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/orders",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
      findMany: mocks.userFindMany,
    },
    order: {
      findMany: mocks.orderFindMany,
      groupBy: mocks.orderGroupBy,
    },
    orderMessageRead: {
      findMany: mocks.orderMessageReadFindMany,
    },
  },
}));

import AdminOrdersPage from "@/app/admin/orders/page";

describe("AdminOrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com", role: "ADMIN" } });
    mocks.userFindUnique.mockResolvedValue({ id: "admin_1" });
    mocks.userFindMany.mockResolvedValue([]);
    mocks.orderFindMany.mockResolvedValue([]);
    mocks.orderGroupBy.mockResolvedValue([]);
    mocks.orderMessageReadFindMany.mockResolvedValue([]);
  });

  it("renderiza estado vazio quando nao existem pedidos", async () => {
    render(await AdminOrdersPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText(/Nenhum pedido encontrado/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Todos/ })[0]).toHaveAttribute("href", "/admin/orders");
  });

  it("renderiza lista com filtros e badge de mensagens nao lidas", async () => {
    mocks.orderFindMany.mockResolvedValue([
      {
        id: "ord_1",
        title: "Nova funcionalidade",
        type: "new_feature",
        orderRef: "QTA-001",
        description: "Descricao do pedido",
        status: "PROPOSAL_SENT",
        createdAt: new Date("2026-04-21T10:00:00.000Z"),
        client: { name: "Joao", email: "joao@example.com" },
        messages: [
          { id: "m1", createdAt: new Date("2026-04-21T11:00:00.000Z") },
          { id: "m2", createdAt: new Date("2026-04-21T12:00:00.000Z") },
        ],
      },
    ]);
    mocks.orderGroupBy.mockResolvedValue([
      { status: "PROPOSAL_SENT", _count: { id: 1 } },
      { status: "IN_PRODUCTION", _count: { id: 2 } },
    ]);
    mocks.orderMessageReadFindMany.mockResolvedValue([
      { orderId: "ord_1", lastReadAt: new Date("2026-04-21T10:30:00.000Z") },
    ]);

    render(await AdminOrdersPage({ searchParams: Promise.resolve({ status: "PROPOSAL_SENT" }) }));

    expect(screen.getByRole("link", { name: /Descricao do pedido/i })).toHaveAttribute("href", "/admin/orders/ord_1");
    expect(screen.getByText("Descricao do pedido")).toBeInTheDocument();
    expect(screen.getByText("2 novas")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Proposta enviada/ })[0]).toHaveAttribute("href", "/admin/orders?status=PROPOSAL_SENT");
    expect(screen.getAllByRole("link", { name: /Em produção/ })[0]).toHaveAttribute("href", "/admin/orders?status=IN_PRODUCTION");
  });
});