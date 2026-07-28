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

import IaAutomacaoSolutionPage from "@/app/[locale]/solutions/ia-automacao/page";

describe("IaAutomacaoSolutionPage", () => {
  it("renderiza o título principal e o hero badge", async () => {
    render(await IaAutomacaoSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    expect(screen.getByText("hero.title")).toBeInTheDocument();
    expect(screen.getByText("hero.badge")).toBeInTheDocument();
  });

  it("renderiza o breadcrumb com link para a home", async () => {
    render(await IaAutomacaoSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    expect(screen.getByRole("link", { name: "breadcrumb.home" })).toHaveAttribute("href", "/");
  });

  it("renderiza os 2 deliverables", async () => {
    render(await IaAutomacaoSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    expect(screen.getByText("solution.deliverable1.title")).toBeInTheDocument();
    expect(screen.getByText("solution.deliverable2.title")).toBeInTheDocument();
  });

  it("renderiza os 6 use cases", async () => {
    render(await IaAutomacaoSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    expect(screen.getByText("useCases.card1.title")).toBeInTheDocument();
    expect(screen.getByText("useCases.card6.title")).toBeInTheDocument();
  });

  it("renderiza a imagem de demonstração com caption e complemento", async () => {
    render(await IaAutomacaoSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    // Placeholder ativo
    expect(screen.getByText("demo.imageCaption")).toBeInTheDocument();
    expect(screen.getByText("demo.imageSoon")).toBeInTheDocument();
  });

  it("renderiza os 8 itens do FAQ", async () => {
    render(await IaAutomacaoSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    expect(screen.getByText("faq.item1.question")).toBeInTheDocument();
    expect(screen.getByText("faq.item8.question")).toBeInTheDocument();
  });

  it("CTA principal aponta para o contato", async () => {
    render(await IaAutomacaoSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));
    const ctaLinks = screen.getAllByRole("link").filter(
      (l) => l.textContent?.includes("cta.primaryCta"),
    );
    expect(ctaLinks.length).toBeGreaterThan(0);
    expect(ctaLinks[0]).toHaveAttribute("href", "/portal/contato");
  });

  it("renderiza corretamente com locale EN", async () => {
    render(await IaAutomacaoSolutionPage({ params: Promise.resolve({ locale: "en" }) }));
    expect(screen.getByRole("link", { name: "breadcrumb.home" })).toHaveAttribute("href", "/en/");
  });
});
