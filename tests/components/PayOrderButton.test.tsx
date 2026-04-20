/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (values && (typeof values.amount === "string" || typeof values.amount === "number")) {
      return `${key}:${values.amount}`;
    }
    return key;
  },
  useLocale: () => "pt-BR",
}));

import { PayOrderButton } from "@/app/portal/orders/[id]/PayOrderButton";

describe("PayOrderButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra erro retornado pela API quando o checkout falha", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: "Falha ao iniciar checkout" }),
    }));

    render(<PayOrderButton orderId="ord_1" estimatedValue={125} />);

    await user.click(screen.getByRole("button", { name: /payBtn:/ }));

    expect(await screen.findByText("Falha ao iniciar checkout")).toBeInTheDocument();
  });

  it("redireciona para a url do checkout quando a API responde com sucesso", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ url: "https://stripe.test/checkout" }),
    }));

    Object.defineProperty(globalThis, "location", {
      value: { href: "http://localhost" },
      configurable: true,
      writable: true,
    });

    render(<PayOrderButton orderId="ord_1" estimatedValue={125} />);

    await user.click(screen.getByRole("button", { name: /payBtn:/ }));

    await waitFor(() => {
      expect(globalThis.location.href).toBe("https://stripe.test/checkout");
    });
  });
});