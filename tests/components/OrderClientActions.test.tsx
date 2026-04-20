/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

import { OrderClientActions } from "@/app/portal/orders/[id]/OrderClientActions";

describe("OrderClientActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("nao renderiza nada fora do estado PROPOSAL_SENT", () => {
    const { container } = render(
      <OrderClientActions
        order={{
          id: "ord_1",
          status: "APPROVED",
          estimatedValue: 120,
          productionInfo: "Entrega em 10 dias",
          adminNote: null,
        }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("exige nota ao pedir revisao", async () => {
    const user = userEvent.setup();

    render(
      <OrderClientActions
        order={{
          id: "ord_1",
          status: "PROPOSAL_SENT",
          estimatedValue: 120,
          productionInfo: "Entrega em 10 dias",
          adminNote: null,
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: "orderActionsRevisionBtn" }));

    expect(screen.getByText("orderActionsRevisionRequired")).toBeInTheDocument();
  });

  it("confirma aprovacao e envia PATCH", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    }));

    render(
      <OrderClientActions
        order={{
          id: "ord_1",
          status: "PROPOSAL_SENT",
          estimatedValue: 120,
          productionInfo: "Entrega em 10 dias",
          adminNote: null,
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: "orderActionsApproveBtn" }));
    await user.click(screen.getByRole("button", { name: "orderActionsYesApprove" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/orders/ord_1", expect.objectContaining({ method: "PATCH" }));
    });
    expect(mocks.refresh).toHaveBeenCalled();
  });
});