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

import WebsiteLandingPagesSolutionPage from "@/app/[locale]/solutions/websites-landing-pages/page";

describe("WebsiteLandingPagesSolutionPage", () => {
  it("renderiza o conteúdo principal e links básicos da solução", async () => {
    render(await WebsiteLandingPagesSolutionPage({ params: Promise.resolve({ locale: "pt" }) }));

    expect(screen.getByText("hero.title")).toBeInTheDocument();
    expect(screen.getByText("problems.heading")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "breadcrumb.home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "hero.secondaryCta" })).toHaveAttribute("href", "/");
  });
});