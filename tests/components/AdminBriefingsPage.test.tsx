/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn(),
  briefingFindMany: vi.fn(),
  scopeFindMany: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
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
  },
}));

vi.mock("@/app/admin/components/AllBriefingsTable", () => ({
  default: ({ briefings, scopeSet }: { briefings: Array<{ id: string }>; scopeSet: Set<string> }) => (
    <div>
      AllBriefingsTableMock:{briefings.length}:{scopeSet.size}
    </div>
  ),
}));

import AdminBriefingsPage from "@/app/admin/briefing/page";

describe("AdminBriefingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { role: "ADMIN" } });
    mocks.briefingFindMany.mockResolvedValue([
      {
        id: "brief_1",
        user: { email: "joao@example.com", name: "Joao" },
      },
      {
        id: "brief_2",
        user: { email: "maria@example.com", name: "Maria" },
      },
    ]);
    mocks.scopeFindMany.mockResolvedValue([{ briefingId: "brief_1" }]);
  });

  it("renderiza cabecalho e tabela com contagem correta", async () => {
    render(await AdminBriefingsPage());

    expect(screen.getByText("Briefings")).toBeInTheDocument();
    expect(screen.getByText("2 briefing(s) submetido(s)")).toBeInTheDocument();
    expect(screen.getByText("AllBriefingsTableMock:2:1")).toBeInTheDocument();
  });
});