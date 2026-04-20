/**
 * @vitest-environment jsdom
 */

import type { ComponentPropsWithoutRef } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
  briefingFindMany: vi.fn(),
  briefingCount: vi.fn(),
  orderFindMany: vi.fn(),
  orderCount: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("lucide-react", () => ({
  FileText: () => <span>FileTextIcon</span>,
  Clock: () => <span>ClockIcon</span>,
  CheckCircle2: () => <span>CheckCircle2Icon</span>,
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    briefing: {
      findMany: mocks.briefingFindMany,
      count: mocks.briefingCount,
    },
    order: {
      findMany: mocks.orderFindMany,
      count: mocks.orderCount,
    },
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
  getLocale: async () => "pt-PT",
}));

import PortalPage from "@/app/portal/page";

describe("PortalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "client@example.com", name: "Joao" } });
    mocks.briefingFindMany.mockResolvedValue([]);
    mocks.orderFindMany.mockResolvedValue([]);
    mocks.briefingCount.mockResolvedValue(0);
    mocks.orderCount.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
  });

  it("renderiza empty state quando o cliente ainda nao tem briefings", async () => {
    render(await PortalPage());

    expect(screen.getByText("tagline")).toBeInTheDocument();
    expect(screen.getByText("heading")).toBeInTheDocument();
    expect(screen.getByText("Joao")).toBeInTheDocument();
    expect(screen.getByText("emptyState")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "submitBriefing" })).toHaveAttribute("href", "/portal/orders/new");
  });

  it("renderiza briefing e alerta de pedido pendente quando existem dados", async () => {
    mocks.briefingFindMany.mockResolvedValue([
      {
        id: "brief_1",
        projectType: "website",
        painPoints: "Problema central",
        status: "RECEIVED",
        budget: "3k-8k",
        timeline: "normal",
        complexityScore: 6,
        hoursMin: 40,
        hoursMax: 80,
        features: ["auth"],
        createdAt: new Date("2026-04-21T10:00:00.000Z"),
      },
    ]);
    mocks.orderFindMany.mockResolvedValue([
      {
        id: "ord_1",
        description: "Nova automacao importante para o cliente com detalhe grande o suficiente para truncar no cartão.",
        status: "PROPOSAL_SENT",
      },
    ]);
    mocks.briefingCount.mockResolvedValue(1);
    mocks.orderCount.mockResolvedValueOnce(1).mockResolvedValueOnce(0);

    render(await PortalPage());

    expect(screen.getByText("pendingTitle")).toBeInTheDocument();
    expect(screen.getByText("Problema central")).toBeInTheDocument();
    expect(screen.getByText("auth")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "viewScope" })).toHaveAttribute("href", "/portal/briefing/brief_1");
    expect(screen.getByRole("link", { name: "pendingViewAll" })).toHaveAttribute("href", "/portal/orders");
  });
});