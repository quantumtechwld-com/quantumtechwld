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
  scopeFindMany: vi.fn(),
  orderCount: vi.fn(),
  paymentFindMany: vi.fn(),
  orderFindMany: vi.fn(),
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
  Users: () => <span>UsersIcon</span>,
  Package: () => <span>PackageIcon</span>,
  FileText: () => <span>FileTextIcon</span>,
  BookOpen: () => <span>BookOpenIcon</span>,
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    briefing: {
      findMany: mocks.briefingFindMany,
    },
    scope: {
      findMany: mocks.scopeFindMany,
    },
    order: {
      count: mocks.orderCount,
      findMany: mocks.orderFindMany,
    },
    payment: {
      findMany: mocks.paymentFindMany,
    },
  },
}));

vi.mock("@/app/admin/components/StatsGrid", () => ({
  default: ({ orderPending, orderCompleted }: { orderPending: number; orderCompleted: number }) => (
    <div>{`StatsGridMock:${orderPending}:${orderCompleted}`}</div>
  ),
}));

vi.mock("@/app/admin/components/BriefingStats", () => ({
  default: ({ counts }: { counts: { total: number; received: number } }) => (
    <div>{`BriefingStatsMock:${counts.total}:${counts.received}`}</div>
  ),
}));

vi.mock("@/app/admin/components/RecentOrdersTable", () => ({
  default: ({ recentOrders }: { recentOrders: Array<{ id: string }> }) => (
    <div>{`RecentOrdersTableMock:${recentOrders.length}`}</div>
  ),
}));

vi.mock("@/app/admin/components/AllBriefingsTable", () => ({
  default: ({ briefings, scopeSet }: { briefings: Array<{ id: string }>; scopeSet: Set<string> }) => (
    <div>{`AllBriefingsTableMock:${briefings.length}:${scopeSet.size}`}</div>
  ),
}));

import AdminDashboardPage from "@/app/admin/page";

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.briefingFindMany.mockResolvedValue([
      { id: "brief_1", status: "RECEIVED", user: { email: "a@example.com", name: "A" } },
      { id: "brief_2", status: "IN_PROGRESS", user: { email: "b@example.com", name: "B" } },
    ]);
    mocks.scopeFindMany.mockResolvedValue([{ briefingId: "brief_1" }]);
    mocks.orderCount
      .mockResolvedValueOnce(2)   // orderPending
      .mockResolvedValueOnce(0)   // orderProposalSent
      .mockResolvedValueOnce(0)   // orderApproved
      .mockResolvedValueOnce(0)   // orderInProd
      .mockResolvedValueOnce(3)   // orderCompleted
      .mockResolvedValueOnce(0);  // orderRejected
    mocks.paymentFindMany.mockResolvedValue([
      { amountCents: 500000, currency: "EUR", paidAt: new Date("2026-04-12T00:00:00.000Z") },
      { amountCents: 200000, currency: "BRL", paidAt: new Date("2026-04-18T00:00:00.000Z") },
    ]);
    mocks.orderFindMany.mockResolvedValue([{ id: "ord_1" }, { id: "ord_2" }]);
  });

  it("renderiza atalhos rápidos e blocos principais do dashboard", async () => {
    render(await AdminDashboardPage());

    expect(screen.getByRole("link", { name: /Utilizadores/i })).toHaveAttribute("href", "/admin/users");
    expect(screen.getByRole("link", { name: /Pedidos/i })).toHaveAttribute("href", "/admin/orders");
    expect(screen.getByText("StatsGridMock:2:3")).toBeInTheDocument();
    expect(screen.getByText("BriefingStatsMock:2:1")).toBeInTheDocument();
    expect(screen.getByText("RecentOrdersTableMock:2")).toBeInTheDocument();
    expect(screen.getByText("AllBriefingsTableMock:2:1")).toBeInTheDocument();
  });
});