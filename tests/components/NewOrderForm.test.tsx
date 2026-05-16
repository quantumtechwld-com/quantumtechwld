/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

import { NewOrderForm } from "@/app/portal/(app)/orders/new/NewOrderForm";

describe("NewOrderForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("valida titulo obrigatorio antes de submeter", async () => {
    const user = userEvent.setup();

    render(<NewOrderForm />);

    await user.type(screen.getByLabelText(/newOrderDescLabel/), "Descricao valida");
    await user.click(screen.getByRole("button", { name: "newOrderSubmit" }));

    expect(screen.getByText("newOrderTitleRequired")).toBeInTheDocument();
  });

  it("submete pedido valido e navega para a listagem", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ order: { id: "ord_1" } }),
    }));

    render(<NewOrderForm />);

    await user.type(screen.getByLabelText(/newOrderTitleLabel/), "Nova funcionalidade critica");
    await user.type(screen.getByLabelText(/newOrderDescLabel/), "Precisamos automatizar o fluxo.");
    await user.click(screen.getByRole("button", { name: "urgencyHigh" }));
    await user.click(screen.getByRole("button", { name: "newOrderSubmit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/orders", expect.objectContaining({ method: "POST" }));
    });
    expect(mocks.push).toHaveBeenCalledWith("/portal/orders");
    expect(mocks.refresh).toHaveBeenCalled();
  });
});