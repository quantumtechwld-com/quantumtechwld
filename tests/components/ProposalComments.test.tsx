/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === "serverError" && typeof values?.status === "number") {
      return `serverError:${values.status}`;
    }
    return key;
  },
  useLocale: () => "pt-PT",
}));

import ProposalComments from "@/app/portal/briefing/[id]/proposta/ProposalComments";

describe("ProposalComments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra estado vazio quando a API nao retorna comentarios", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ comments: [] }),
    }));

    render(<ProposalComments proposalId="prop_1" />);

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(await screen.findByText("noComments")).toBeInTheDocument();
  });

  it("adiciona comentario quando o submit retorna sucesso", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ comments: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          comment: {
            id: "comment_1",
            excerpt: "Hero",
            body: "Ajustar headline",
            resolved: false,
            createdAt: "2026-04-21T10:00:00.000Z",
            author: { name: "Joao", email: "joao@example.com", role: "CLIENT" },
          },
        }),
      }));

    render(<ProposalComments proposalId="prop_1" />);

    await screen.findByText("noComments");
    await user.type(screen.getByPlaceholderText("commentExcerptPlaceholder"), "Hero");
    await user.type(screen.getByPlaceholderText("commentBodyPlaceholder"), "Ajustar headline");
    await user.click(screen.getByRole("button", { name: "commentSubmit" }));

    expect(await screen.findByText("Ajustar headline")).toBeInTheDocument();
    expect(screen.getByText("Joao")).toBeInTheDocument();
    await waitFor(() => {
      expect(fetch).toHaveBeenNthCalledWith(2, "/api/proposal/prop_1/comments", expect.objectContaining({ method: "POST" }));
    });
  });

  it("permite ao admin resolver comentario aberto", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          comments: [
            {
              id: "comment_1",
              excerpt: "Hero",
              body: "Ajustar headline",
              resolved: false,
              createdAt: "2026-04-21T10:00:00.000Z",
              author: { name: "Joao", email: "joao@example.com", role: "CLIENT" },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({}) }));

    render(<ProposalComments proposalId="prop_1" isAdmin={true} />);

    await screen.findByText("Ajustar headline");
    await user.click(screen.getByRole("button", { name: /resolve/i }));

    expect(await screen.findByText("noComments")).toBeInTheDocument();
    expect(fetch).toHaveBeenNthCalledWith(2, "/api/proposal/prop_1/comments", expect.objectContaining({ method: "PATCH" }));
  });
});