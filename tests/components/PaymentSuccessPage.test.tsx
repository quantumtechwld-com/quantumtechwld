/**
 * @vitest-environment jsdom
 */

import type { ComponentPropsWithoutRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

import PaymentSuccessPage from "@/app/portal/orders/[id]/payment/success/page";

describe("PaymentSuccessPage", () => {
  it("renderiza mensagem de sucesso e link de retorno ao pedido", async () => {
    render(await PaymentSuccessPage({ params: Promise.resolve({ id: "ord_1" }) }));

    expect(screen.getByText("paySuccessTitle")).toBeInTheDocument();
    expect(screen.getByText("paySuccessBody1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "paySuccessViewOrder" })).toHaveAttribute("href", "/portal/orders/ord_1");
  });
});