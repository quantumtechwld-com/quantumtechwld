/**
 * @vitest-environment jsdom
 */

import type { ComponentPropsWithoutRef } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
  notFound: vi.fn(),
  briefingFindFirst: vi.fn(),
  proposalFindUnique: vi.fn(),
  formatCurrencyRangeByCode: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  notFound: mocks.notFound,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    briefing: {
      findFirst: mocks.briefingFindFirst,
    },
    proposal: {
      findUnique: mocks.proposalFindUnique,
    },
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
  getLocale: async () => "pt-BR",
}));

vi.mock("@/lib/currency", () => ({
  formatCurrencyRangeByCode: mocks.formatCurrencyRangeByCode,
}));

vi.mock("@/app/portal/briefing/[id]/proposta/ProposalActions", () => ({
  default: ({ proposalId, briefingId }: { proposalId: string; briefingId: string }) => (
    <div>ProposalActionsMock:{proposalId}:{briefingId}</div>
  ),
}));

vi.mock("@/app/portal/briefing/[id]/proposta/ProposalComments", () => ({
  default: ({ proposalId }: { proposalId: string }) => <div>ProposalCommentsMock:{proposalId}</div>,
}));

import ProposalPage from "@/app/portal/briefing/[id]/proposta/page";

describe("ProposalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "client@example.com" } });
    mocks.briefingFindFirst.mockResolvedValue({ id: "brief_1", projectType: "Website institucional" });
    mocks.formatCurrencyRangeByCode.mockReturnValue("R$ 3.000,00 - R$ 8.000,00");
  });

  it("renderiza estado indisponivel quando a proposta ainda nao foi publicada", async () => {
    mocks.proposalFindUnique.mockResolvedValue({
      id: "prop_1",
      status: "DRAFT",
    });

    render(await ProposalPage({ params: Promise.resolve({ id: "brief_1" }) }));

    expect(screen.getByText("proposalNotAvailable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "backToBriefing" })).toHaveAttribute("href", "/portal/briefing/brief_1");
  });

  it("renderiza proposta publicada com métricas, ações e comentários", async () => {
    mocks.proposalFindUnique.mockResolvedValue({
      id: "prop_1",
      version: 2,
      status: "SENT",
      summary: "Resumo comercial da proposta",
      content: "Escopo completo com milestones",
      hoursTotal: 80,
      costCurrency: "BRL",
      costMin: 3000,
      costMax: 8000,
      clientNote: null,
      createdAt: new Date("2026-04-21T10:00:00.000Z"),
    });

    render(await ProposalPage({ params: Promise.resolve({ id: "brief_1" }) }));

    expect(screen.getByText("proposalTitle")).toBeInTheDocument();
    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.getByText("80h")).toBeInTheDocument();
    expect(screen.getByText("R$ 3.000,00 - R$ 8.000,00")).toBeInTheDocument();
    expect(screen.getByText("Resumo comercial da proposta")).toBeInTheDocument();
    expect(screen.getByText("Escopo completo com milestones")).toBeInTheDocument();
    expect(screen.getByText("ProposalActionsMock:prop_1:brief_1")).toBeInTheDocument();
    expect(screen.getByText("ProposalCommentsMock:prop_1")).toBeInTheDocument();
  });
});