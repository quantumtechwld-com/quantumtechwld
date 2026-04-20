/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OrderList from "@/components/orders/OrderList";

describe("OrderList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra estado vazio quando a API nao retorna pedidos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ orders: [] }),
    }));

    render(<OrderList />);

    expect(screen.getByText("Carregando pedidos...")).toBeInTheDocument();
    expect(await screen.findByText("Nenhum pedido encontrado.")).toBeInTheDocument();
  });

  it("renderiza a lista de pedidos devolvida pela API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        orders: [
          {
            id: "ord_1",
            type: "new_feature",
            description: "Nova automacao de fluxo",
            status: "IN_PRODUCTION",
            createdAt: "2026-04-21T10:00:00.000Z",
          },
        ],
      }),
    }));

    render(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText("new_feature")).toBeInTheDocument();
    });
    expect(screen.getByText("Nova automacao de fluxo")).toBeInTheDocument();
    expect(screen.getByText("IN_PRODUCTION")).toBeInTheDocument();
  });
});