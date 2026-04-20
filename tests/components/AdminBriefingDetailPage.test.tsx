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
  briefingFindUnique: vi.fn(),
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
      findUnique: mocks.briefingFindUnique,
    },
    scope: {
      findUnique: mocks.scopeFindUnique,
    },
    proposal: {
      findUnique: mocks.proposalFindUnique,
    },
  },
}));

vi.mock("@/components/home/LogoAnimated", () => ({
  default: () => <div>LogoAnimatedMock</div>,
}));

vi.mock("@/app/admin/briefing/[id]/AdminStatusForm", () => ({
  default: ({ briefingId }: { briefingId: string }) => <div>AdminStatusFormMock:{briefingId}</div>,
}));

vi.mock("@/app/admin/briefing/[id]/ScopeView", () => ({
  default: ({ briefingId }: { briefingId: string }) => <div>ScopeViewMock:{briefingId}</div>,
}));

vi.mock("@/app/admin/briefing/[id]/ProposalManager", () => ({
  default: ({ briefingId, hasScope }: { briefingId: string; hasScope: boolean }) => (
    <div>ProposalManagerMock:{briefingId}:{String(hasScope)}</div>
  ),
}));

import AdminBriefingDetailPage from "@/app/admin/briefing/[id]/page";

describe("AdminBriefingDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.briefingFindUnique.mockResolvedValue({
      id: "brief_1",
      status: "RECEIVED",
      createdAt: new Date("2026-04-21T10:00:00.000Z"),
      projectType: "landing_page",
      budget: "3k-8k",
      timeline: "normal",
      targetAudience: "Pequenas empresas",
      complexityScore: 6,
      painPoints: "Processo manual de captação",
      features: ["auth", "dashboard"],
      customFeatures: "Integração com CRM",
      user: { name: "Joao", email: "joao@example.com" },
    });
    mocks.scopeFindUnique.mockResolvedValue({ briefingId: "brief_1", hoursEstimate: 120 });
    mocks.proposalFindUnique.mockResolvedValue({
      id: "prop_1",
      version: 1,
      status: "DRAFT",
      summary: "Resumo",
      content: "Conteúdo",
      hoursTotal: 120,
      costMin: 5400,
      costMax: 10200,
      clientNote: null,
      reviewedAt: null,
      createdAt: new Date("2026-04-21T11:00:00.000Z"),
    });
  });

  it("renderiza os dados principais do briefing e os blocos de gestão", async () => {
    render(await AdminBriefingDetailPage({ params: Promise.resolve({ id: "brief_1" }) }));

    expect(screen.getByText(/Briefing #brief_1/i)).toBeInTheDocument();
    expect(screen.getByText("Joao")).toBeInTheDocument();
    expect(screen.getByText("joao@example.com")).toBeInTheDocument();
    expect(screen.getByText("Landing Page")).toBeInTheDocument();
    expect(screen.getByText("Processo manual de captação")).toBeInTheDocument();
    expect(screen.getByText("auth")).toBeInTheDocument();
    expect(screen.getByText("dashboard")).toBeInTheDocument();
    expect(screen.getByText("Integração com CRM")).toBeInTheDocument();
    expect(screen.getByText("AdminStatusFormMock:brief_1")).toBeInTheDocument();
    expect(screen.getByText("ScopeViewMock:brief_1")).toBeInTheDocument();
    expect(screen.getByText("ProposalManagerMock:brief_1:true")).toBeInTheDocument();
  });
});