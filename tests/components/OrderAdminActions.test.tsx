/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

import { OrderAdminActions } from "@/app/admin/orders/[id]/OrderAdminActions";

describe("OrderAdminActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("nao renderiza quando o pedido nao tem acoes disponiveis", () => {
    const { container } = render(
      <OrderAdminActions order={{ id: "ord_1", status: "COMPLETED", type: "support" }} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("valida campos obrigatorios antes de enviar proposta", async () => {
    const user = userEvent.setup();

    render(
      <OrderAdminActions order={{ id: "ord_1", status: "EVALUATING", type: "support" }} />
    );

    await user.click(screen.getByRole("button", { name: "Enviar proposta" }));

    expect(screen.getByText("Informações de produção são obrigatórias.")).toBeInTheDocument();
  });

  it("envia proposta com valor e nota quando os campos sao validos", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    }));

    render(
      <OrderAdminActions order={{ id: "ord_1", status: "EVALUATING", type: "support" }} />
    );

    await user.type(screen.getByLabelText(/Informações de produção/i), "Implementação e QA");
    await user.type(screen.getByLabelText(/Valor estimado/i), "1200");
    await user.type(screen.getByLabelText(/Nota adicional/i), "Prioridade alta");
    await user.click(screen.getByRole("button", { name: "Enviar proposta" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/orders/ord_1", expect.objectContaining({ method: "PATCH" }));
    });
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("pede confirmacao antes de marcar em producao", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    }));

    render(
      <OrderAdminActions order={{ id: "ord_1", status: "APPROVED", type: "support" }} />
    );

    await user.click(screen.getByRole("button", { name: "Marcar em produção" }));
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/orders/ord_1", expect.objectContaining({ method: "PATCH" }));
    });
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("mostra mensagem automatica quando o pagamento ja foi confirmado", () => {
    render(
      <OrderAdminActions order={{ id: "ord_1", status: "APPROVED", type: "support" }} paymentPaid={true} />
    );

    expect(screen.getByText(/Pagamento confirmado pelo Stripe/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Marcar em produção" })).not.toBeInTheDocument();
  });
});