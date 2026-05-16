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
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}));

import { RatingWidget } from "@/app/portal/(app)/orders/[id]/RatingWidget";

describe("RatingWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mantem o botao desabilitado ate selecionar uma nota", () => {
    render(<RatingWidget orderId="ord_1" />);

    expect(screen.getByRole("button", { name: "ratingSubmit" })).toBeDisabled();
  });

  it("submete a avaliacao e faz refresh da pagina", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: "rating_1" }),
    }));

    render(<RatingWidget orderId="ord_1" />);

    await user.click(screen.getByRole("button", { name: /1 ratingStar/ }));
    await user.type(screen.getByPlaceholderText("ratingCommentPlaceholder"), "Muito bom");
    await user.click(screen.getByRole("button", { name: "ratingSubmit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/orders/ord_1/rating", expect.objectContaining({ method: "POST" }));
    });
    expect(mocks.refresh).toHaveBeenCalled();
  });
});