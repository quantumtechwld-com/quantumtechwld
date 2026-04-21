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

const CLIENTS = [{ id: "client_1", name: "Joao", email: "joao@example.com", company: "Empresa A" }];
const OPEN_ORDER = { id: "ord_99", orderRef: "QT-0099", title: "Pedido existente", type: "support", status: "EVALUATING" };

/** Fetch stub: GET devolve open orders; POST devolve postResponse */
function stubFetch(openOrders: unknown[], postResponse: unknown) {
  vi.stubGlobal("fetch", vi.fn((url: string, opts?: RequestInit) => {
    if (opts?.method !== "POST") {
      return Promise.resolve({ ok: true, json: vi.fn().mockResolvedValue({ orders: openOrders }) });
    }
    return Promise.resolve({ ok: true, json: vi.fn().mockResolvedValue(postResponse) });
  }));
}

describe("AdminNewOrderForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria pedido com proposta e redireciona para o detalhe", async () => {
    const user = userEvent.setup();
    stubFetch([], { order: { id: "ord_1" } });

    render(<AdminNewOrderForm initialClientId="client_1" clients={CLIENTS} />);

    await user.type(screen.getByLabelText(/Título/i), "Painel executivo de vendas");
    await user.type(screen.getByLabelText(/Descrição/i), "Criar backlog inicial e escopo do pedido");
    await user.click(screen.getByRole("button", { name: "Alta" }));
    await user.type(screen.getByLabelText(/Informações de produção/i), "Full-stack em 4 semanas.");
    await user.type(screen.getByLabelText(/Valor estimado/i), "3000");
    await user.click(screen.getByRole("button", { name: "Criar e enviar proposta" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/admin/orders",
        expect.objectContaining({ method: "POST", body: expect.stringContaining("productionInfo") }),
      );
    });
    expect(mocks.push).toHaveBeenCalledWith("/admin/orders/ord_1");
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("mostra erro se nenhum cliente for selecionado", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn());

    render(<AdminNewOrderForm clients={CLIENTS} />);

    await user.click(screen.getByRole("button", { name: "Criar e enviar proposta" }));
    expect(screen.getByText("Selecione um cliente.")).toBeInTheDocument();
  });

  it("mostra erro de validacao quando productionInfo esta vazio", async () => {
    const user = userEvent.setup();
    stubFetch([], null);

    render(<AdminNewOrderForm initialClientId="client_1" clients={CLIENTS} />);

    await user.type(screen.getByLabelText(/Título/i), "Plataforma de vendas");
    await user.type(screen.getByLabelText(/Descrição/i), "Sistema B2B completo.");
    await user.click(screen.getByRole("button", { name: "Criar e enviar proposta" }));

    expect(screen.getByText("Informações de produção são obrigatórias.")).toBeInTheDocument();
  });

  it("NAO mostra seletor de pedido pai para tipo new_feature mesmo com pedidos abertos", async () => {
    // fetch com pedidos abertos, mas tipo é new_feature — seletor não deve aparecer
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ orders: [OPEN_ORDER] }),
    }));

    render(<AdminNewOrderForm initialClientId="client_1" clients={CLIENTS} />);
    // O tipo padrão é new_feature — não deve buscar nem mostrar seletor
    expect(screen.queryByText(/Selecione o pedido original/i)).not.toBeInTheDocument();
    // fetch não deve ser chamado para new_feature
    expect(fetch).not.toHaveBeenCalled();
  });

  it("mostra seletor de pedido pai ao escolher tipo correction", async () => {
    const user = userEvent.setup();
    stubFetch([OPEN_ORDER], { order: { id: "ord_2" } });

    render(<AdminNewOrderForm initialClientId="client_1" clients={CLIENTS} />);

    await user.selectOptions(screen.getByLabelText(/Tipo do pedido/i), "correction");

    await waitFor(() => {
      expect(screen.getByText(/Selecione o pedido original/i)).toBeInTheDocument();
    });
    expect(screen.getByText("QT-0099")).toBeInTheDocument();
    expect(screen.getByText("Pedido existente")).toBeInTheDocument();
  });

  it("mostra erro se tipo correction mas nenhum pedido pai selecionado", async () => {
    const user = userEvent.setup();
    stubFetch([OPEN_ORDER], null);

    render(<AdminNewOrderForm initialClientId="client_1" clients={CLIENTS} />);

    await user.selectOptions(screen.getByLabelText(/Tipo do pedido/i), "correction");
    await waitFor(() => expect(screen.getByText("QT-0099")).toBeInTheDocument());

    await user.type(screen.getByLabelText(/Título/i), "Corrigir bug de login");
    await user.type(screen.getByLabelText(/Descrição/i), "Corrige o fluxo de autenticação.");
    await user.type(screen.getByLabelText(/Informações de produção/i), "Fix em 2 dias.");
    await user.type(screen.getByLabelText(/Valor estimado/i), "100");
    await user.click(screen.getByRole("button", { name: "Criar e enviar proposta" }));

    // A mensagem de erro é específica sobre correção/alteração (diferente do label do seletor)
    expect(
      screen.getByText(/selecione o pedido original ao qual esta corre[çc][\u00e3a]o\/altera[\u00e7c][\u00e3a]o/i)
    ).toBeInTheDocument();
  });

  it("cria pedido correction vinculado ao pedido pai e envia parentOrderId", async () => {
    const user = userEvent.setup();
    stubFetch([OPEN_ORDER], { order: { id: "ord_correction_1" } });

    render(<AdminNewOrderForm initialClientId="client_1" clients={CLIENTS} />);

    await user.selectOptions(screen.getByLabelText(/Tipo do pedido/i), "correction");
    await waitFor(() => expect(screen.getByText("QT-0099")).toBeInTheDocument());

    // Selecionar o pedido pai
    await user.click(screen.getByRole("button", { name: /QT-0099/i }));
    expect(screen.getByText(/Pedido pai selecionado/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Título/i), "Corrigir bug de login");
    await user.type(screen.getByLabelText(/Descrição/i), "Corrige o fluxo de autenticação.");
    await user.type(screen.getByLabelText(/Informações de produção/i), "Fix em 2 dias.");
    await user.type(screen.getByLabelText(/Valor estimado/i), "100");
    await user.click(screen.getByRole("button", { name: "Criar e enviar proposta" }));

    await waitFor(() => {
      const body = JSON.parse(
        vi.mocked(fetch).mock.calls.find(([, o]) => (o as RequestInit)?.method === "POST")?.[1]?.body as string ?? "{}"
      );
      expect(body.parentOrderId).toBe("ord_99");
      expect(body.type).toBe("correction");
    });
    expect(mocks.push).toHaveBeenCalledWith("/admin/orders/ord_correction_1");
  });
});
