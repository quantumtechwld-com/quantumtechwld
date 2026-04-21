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

/** Stub genérico do fetch que retorna { orders: [] } para o GET de pedidos abertos
 *  e recebe as chamadas de POST de criação conforme configurado por cada teste. */
function stubFetchNoOpenOrders(postResponse: unknown) {
  vi.stubGlobal("fetch", vi.fn((url: string, opts?: RequestInit) => {
    if (opts?.method !== "POST") {
      return Promise.resolve({
        ok: true,
        json: vi.fn().mockResolvedValue({ orders: [] }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: vi.fn().mockResolvedValue(postResponse),
    });
  }));
}

describe("AdminNewOrderForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria pedido com proposta e redireciona para o detalhe", async () => {
    const user = userEvent.setup();
    stubFetchNoOpenOrders({ order: { id: "ord_1" } });

    render(
      <AdminNewOrderForm
        initialClientId="client_1"
        clients={[{ id: "client_1", name: "Joao", email: "joao@example.com", company: "Empresa A" }]}
      />
    );

    await user.type(screen.getByLabelText(/Título/i), "Painel executivo de vendas");
    await user.type(screen.getByLabelText(/Descrição/i), "Criar backlog inicial e escopo do pedido");
    await user.click(screen.getByRole("button", { name: "Alta" }));
    await user.type(screen.getByLabelText(/Informações de produção/i), "Full-stack em 4 semanas.");
    await user.type(screen.getByLabelText(/Valor estimado/i), "3000");
    await user.click(screen.getByRole("button", { name: "Criar e enviar proposta" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/admin/orders",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("productionInfo"),
        }),
      );
    });
    expect(mocks.push).toHaveBeenCalledWith("/admin/orders/ord_1");
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("mostra erro se nenhum cliente for selecionado", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());

    render(
      <AdminNewOrderForm
        clients={[{ id: "client_1", name: "Joao", email: "joao@example.com", company: "Empresa A" }]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Criar e enviar proposta" }));

    expect(screen.getByText("Selecione um cliente.")).toBeInTheDocument();
  });

  it("mostra erro de validacao quando productionInfo esta vazio", async () => {
    const user = userEvent.setup();
    stubFetchNoOpenOrders(null);

    render(
      <AdminNewOrderForm
        initialClientId="client_1"
        clients={[{ id: "client_1", name: "Joao", email: "joao@example.com", company: "Empresa A" }]}
      />
    );

    await user.type(screen.getByLabelText(/Título/i), "Plataforma de vendas");
    await user.type(screen.getByLabelText(/Descrição/i), "Sistema B2B completo.");
    // Deixar productionInfo vazio e clicar submeter
    await user.click(screen.getByRole("button", { name: "Criar e enviar proposta" }));

    expect(screen.getByText("Informações de produção são obrigatórias.")).toBeInTheDocument();
  });

  it("mostra banner de pedidos abertos quando cliente ja tem pedido em aberto", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        orders: [
          { id: "ord_99", orderRef: "QT-0099", title: "Pedido existente", type: "support", status: "EVALUATING" },
        ],
      }),
    }));

    render(
      <AdminNewOrderForm
        initialClientId="client_1"
        clients={[{ id: "client_1", name: "Joao", email: "joao@example.com", company: "Empresa A" }]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Este cliente já tem 1 pedido em aberto/i)).toBeInTheDocument();
    });
    expect(screen.getByText("QT-0099")).toBeInTheDocument();
    expect(screen.getByText("Pedido existente")).toBeInTheDocument();

    // Banner pode ser dispensado
    await user.click(screen.getByRole("button", { name: /Fechar aviso/i }));
    expect(screen.queryByText(/Este cliente já tem 1 pedido em aberto/i)).not.toBeInTheDocument();
  });

  it("nao mostra banner quando cliente nao tem pedidos abertos", async () => {
    stubFetchNoOpenOrders(null);

    render(
      <AdminNewOrderForm
        initialClientId="client_1"
        clients={[{ id: "client_1", name: "Joao", email: "joao@example.com", company: "Empresa A" }]}
      />
    );

    // Aguarda fetch completar
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/pedido.*aberto/i)).not.toBeInTheDocument();
  });
});