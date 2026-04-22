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
  Bell: () => <span>BellIcon</span>,
  Zap: () => <span>ZapIcon</span>,
  Eye: () => <span>EyeIcon</span>,
  XCircle: () => <span>XCircleIcon</span>,
  X: () => <span>XIcons</span>,
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
    mocks.orderFindMany.mockResolvedValue([]);
    mocks.orderCount
      .mockResolvedValueOnce(0)  // proposalSent
      .mockResolvedValueOnce(0)  // inProduction
      .mockResolvedValueOnce(0)  // inReview
      .mockResolvedValueOnce(0)  // completed
      .mockResolvedValueOnce(0); // rejected
  });

  it("renderiza empty state quando o cliente ainda nao tem pedidos", async () => {
    render(await PortalPage());

    expect(screen.getByText("tagline")).toBeInTheDocument();
    expect(screen.getByText("heading")).toBeInTheDocument();
    expect(screen.getByText("Joao")).toBeInTheDocument();
    expect(screen.getByText("Ainda não tem pedidos.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ Novo pedido" })).toHaveAttribute("href", "/portal/orders/new");
  });

  it("renderiza painel amber quando existem pedidos com proposta enviada", async () => {
    mocks.orderFindMany.mockResolvedValue([
      {
        id: "ord_1",
        title: "Automação de fluxo",
        type: "automation",
        status: "PROPOSAL_SENT",
        createdAt: new Date("2026-04-21T10:00:00.000Z"),
        orderRef: null,
        estimatedValue: null,
      },
    ]);
    mocks.orderCount
      .mockResolvedValueOnce(1)  // proposalSent
      .mockResolvedValueOnce(0)  // inProduction
      .mockResolvedValueOnce(0)  // inReview
      .mockResolvedValueOnce(0)  // completed
      .mockResolvedValueOnce(0); // rejected

    render(await PortalPage());

    expect(screen.getByText("Aguardam a sua resposta")).toBeInTheDocument();
    expect(screen.getAllByText("Automação de fluxo").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Ver todos →" })[0]).toHaveAttribute("href", "/portal/orders");
  });
});