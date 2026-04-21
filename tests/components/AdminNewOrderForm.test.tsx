/**
 * @vitest-environment jsdom
 */

import type { ComponentPropsWithoutRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { AdminNewOrderForm } from "@/app/admin/orders/new/AdminNewOrderForm";

describe("AdminNewOrderForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria pedido para cliente escolhido e redireciona para o detalhe", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ order: { id: "ord_1" } }),
    }));

    render(
      <AdminNewOrderForm
        initialClientId="client_1"
        clients={[{ id: "client_1", name: "Joao", email: "joao@example.com", company: "Empresa A" }]}
      />
    );

    await user.type(screen.getByLabelText(/Título/i), "Painel executivo de vendas");
    await user.type(screen.getByLabelText(/Descrição/i), "Criar backlog inicial e escopo do pedido");
    await user.click(screen.getByRole("button", { name: "Alta" }));
    await user.click(screen.getByRole("button", { name: "Criar pedido" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/admin/orders", expect.objectContaining({ method: "POST" }));
    });
    expect(mocks.push).toHaveBeenCalledWith("/admin/orders/ord_1");
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("mostra erro se nenhum cliente for selecionado", async () => {
    const user = userEvent.setup();

    render(
      <AdminNewOrderForm
        clients={[{ id: "client_1", name: "Joao", email: "joao@example.com", company: "Empresa A" }]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Criar pedido" }));

    expect(screen.getByText("Selecione um cliente.")).toBeInTheDocument();
  });
});