/**
 * @vitest-environment jsdom
 */

import type { ComponentPropsWithoutRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

import SistemasSobMedidaSolutionPage from "@/app/[locale]/solutions/sistemas-sob-medida/page";

describe("SistemasSobMedidaSolutionPage", () => {
  it("renderiza o título principal e o problema central", async () => {
    render(await SistemasSobMedidaSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    expect(screen.getByText("hero.title")).toBeInTheDocument();
    expect(screen.getByText("problems.heading")).toBeInTheDocument();
  });

  it("renderiza o breadcrumb com link para a home", async () => {
    render(await SistemasSobMedidaSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    expect(screen.getByRole("link", { name: "breadcrumb.home" })).toHaveAttribute("href", "/");
  });

  it("renderiza os 2 deliverables da solução", async () => {
    render(await SistemasSobMedidaSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    expect(screen.getByText("solution.deliverable1.title")).toBeInTheDocument();
    expect(screen.getByText("solution.deliverable2.title")).toBeInTheDocument();
  });

  it("renderiza os 4 use cases", async () => {
    render(await SistemasSobMedidaSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    expect(screen.getByText("useCases.card1.title")).toBeInTheDocument();
    expect(screen.getByText("useCases.card4.title")).toBeInTheDocument();
  });

  it("renderiza os 5 itens do FAQ", async () => {
    render(await SistemasSobMedidaSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    expect(screen.getByText("faq.item1.question")).toBeInTheDocument();
    expect(screen.getByText("faq.item5.question")).toBeInTheDocument();
  });

  it("CTA principal aponta para o contato", async () => {
    render(await SistemasSobMedidaSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    const ctaLinks = screen.getAllByRole("link").filter(
      (l) => l.textContent?.includes("cta.primaryCta"),
    );
    expect(ctaLinks.length).toBeGreaterThan(0);
    expect(ctaLinks[0].getAttribute("href")).toMatch(/^\/portal\/contato/);
  });

  it("renderiza corretamente com locale EN", async () => {
    render(await SistemasSobMedidaSolutionPage({ params: Promise.resolve({ locale: "en" }) }));
    expect(screen.getByRole("link", { name: "breadcrumb.home" })).toHaveAttribute("href", "/en/");
  });
});
