/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import AllBriefingsTable from "@/app/admin/components/AllBriefingsTable";

describe("AllBriefingsTable", () => {
  it("mostra estado vazio quando nao existem briefings", () => {
    render(
      <AllBriefingsTable
        briefings={[]}
        PROJECT_LABEL={{}}
        STATUS_LABEL={{}}
        STATUS_COLOR={{}}
        scopeSet={new Set()}
      />
    );

    expect(screen.getByText("Ainda não há briefings submetidos.")).toBeInTheDocument();
  });

  it("renderiza briefing com badge de escopo gerado e link de detalhes", () => {
    render(
      <AllBriefingsTable
        briefings={[
          {
            id: "brief_1",
            user: { name: "Joao", email: "joao@example.com" },
            projectType: "website",
            status: "RECEIVED",
            createdAt: new Date("2026-04-21T10:00:00Z"),
          },
        ]}
        PROJECT_LABEL={{ website: "Website" }}
        STATUS_LABEL={{ RECEIVED: "Recebido" }}
        STATUS_COLOR={{ RECEIVED: "bg-slate-500 text-white" }}
        scopeSet={new Set(["brief_1"])}
      />
    );

    expect(screen.getByText("Joao")).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument();
    expect(screen.getByText("Recebido")).toBeInTheDocument();
    expect(screen.getByText("Gerado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver detalhes/i })).toHaveAttribute("href", "/admin/briefing/brief_1");
  });
});