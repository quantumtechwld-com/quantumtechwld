/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next-navigation", () => ({}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { ProfileForm } from "@/app/portal/profile/ProfileForm";

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("salva dados com sucesso e atualiza a tela", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    }));

    render(
      <ProfileForm user={{ name: "Joao", email: "client@example.com", phone: "", company: "" }} />
    );

    await user.type(screen.getByLabelText("profileCompany"), "Quantum Client");
    await user.type(screen.getByLabelText("profilePhone"), "+351999999999");
    await user.click(screen.getByRole("button", { name: "profileSave" }));

    expect(await screen.findByText("profileSaved")).toBeInTheDocument();
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/profile", expect.objectContaining({ method: "PATCH" }));
    });
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("mostra erro quando a API falha", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: "Falha ao salvar" }),
    }));

    render(
      <ProfileForm user={{ name: "Joao", email: "client@example.com", phone: "", company: "" }} />
    );

    await user.click(screen.getByRole("button", { name: "profileSave" }));

    expect(await screen.findByText("Falha ao salvar")).toBeInTheDocument();
  });
});