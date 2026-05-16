/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendMagicLink: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "pt",
}));

vi.mock("@/app/portal/login/actions", () => ({
  sendMagicLink: mocks.sendMagicLink,
}));

import LoginPage from "@/app/portal/login/page";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra estado de envio concluido quando o magic link e enviado", async () => {
    const user = userEvent.setup();
    mocks.sendMagicLink.mockResolvedValue({ ok: true });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("loginEmailPlaceholder"), "cliente@example.com");
    await user.click(screen.getByRole("button", { name: "loginSend" }));

    expect(mocks.sendMagicLink).toHaveBeenCalledWith("cliente@example.com");
    expect(screen.getByText("loginSentTitle")).toBeInTheDocument();
    expect(screen.getByText("cliente@example.com")).toBeInTheDocument();
  });

  it("mostra erro mapeado e link de contato quando o utilizador nao existe", async () => {
    const user = userEvent.setup();
    mocks.sendMagicLink.mockResolvedValue({ ok: false, code: "NOT_FOUND" });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("loginEmailPlaceholder"), "inexistente@example.com");
    await user.click(screen.getByRole("button", { name: "loginSend" }));

    expect(screen.getByText("loginErrNotFound")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "loginContactLink" })).toHaveAttribute("href", "/portal/contato");
  });
});