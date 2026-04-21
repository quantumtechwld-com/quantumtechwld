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
  scopeFindUnique: vi.fn(),
  proposalFindUnique: vi.fn(),
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
    scope: {
      findUnique: mocks.scopeFindUnique,
    },
    proposal: {
      findUnique: mocks.proposalFindUnique,
    },
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

vi.mock("@/app/portal/briefing/[id]/ScopeGenerator", () => ({
  default: ({ briefingId, initialScope }: { briefingId: string; initialScope: unknown }) => (
    <div>ScopeGeneratorMock:{briefingId}:{initialScope ? "with-scope" : "empty"}</div>
  ),
}));

import BriefingDetailPage from "@/app/portal/briefing/[id]/page";

describe("BriefingDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "client@example.com" } });
    mocks.briefingFindFirst.mockResolvedValue({
      id: "brief_1",
      projectType: "Website institucional",
      status: "RECEIVED",
      painPoints: "Baixa conversão na landing page",
      targetAudience: "Empresas B2B",
      budget: "3k-8k",
      timeline: "normal",
      features: ["crm", "analytics"],
    });
    mocks.scopeFindUnique.mockResolvedValue({
      features: [],
      userStories: [],
      screens: [],
      integrations: [],
      techRecommended: [],
      hoursEstimate: 60,
      costMin: 3000,
      costMax: 8000,
      confidence: 80,
    });
    mocks.proposalFindUnique.mockResolvedValue({ status: "SENT" });
  });

  it("renderiza briefing, scope e link para proposta quando visível", async () => {
    render(await BriefingDetailPage({ params: Promise.resolve({ id: "brief_1" }) }));

    expect(screen.getByText("Website institucional")).toBeInTheDocument();
    expect(screen.getByText("Baixa conversão na landing page")).toBeInTheDocument();
    expect(screen.getByText("crm")).toBeInTheDocument();
    expect(screen.getByText("analytics")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "viewProposal" })).toHaveAttribute("href", "/portal/briefing/brief_1/proposta");
    expect(screen.getByText("ScopeGeneratorMock:brief_1:with-scope")).toBeInTheDocument();
  });
});