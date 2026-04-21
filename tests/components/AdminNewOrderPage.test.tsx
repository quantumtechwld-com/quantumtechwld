/**
 * @vitest-environment jsdom
 */

import type { ComponentPropsWithoutRef } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
  userFindMany: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
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
      findMany: mocks.userFindMany,
    },
  },
}));

vi.mock("@/app/admin/orders/new/AdminNewOrderForm", () => ({
  AdminNewOrderForm: ({ clients, initialClientId }: { clients: Array<{ id: string }>; initialClientId: string }) => (
    <div>AdminNewOrderFormMock:{clients.length}:{initialClientId}</div>
  ),
}));

import AdminNewOrderPage from "@/app/admin/orders/new/page";

describe("AdminNewOrderPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.userFindMany.mockResolvedValue([{ id: "client_1" }, { id: "client_2" }]);
  });

  it("carrega clientes ativos e passa clientId inicial ao formulário", async () => {
    render(await AdminNewOrderPage({ searchParams: Promise.resolve({ clientId: "client_2" }) }));

    expect(screen.getByText("Novo pedido para cliente")).toBeInTheDocument();
    expect(screen.getByText("AdminNewOrderFormMock:2:client_2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /← Pedidos/i })).toHaveAttribute("href", "/admin/orders");
  });
});