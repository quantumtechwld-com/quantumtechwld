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

vi.mock("next-intl", () => ({
  useLocale: () => "pt",
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, locale, children, ...props }: ComponentPropsWithoutRef<"a"> & { locale?: string }) => (
    <a href={locale && locale !== "pt" ? `/${locale}${href}` : (href ?? "/")} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/contact-url", () => ({
  getContactUrl: () => "/portal/contato",
}));

vi.mock("@/components/home/LogoAnimated", () => ({
  default: ({ size }: { size?: number }) => <svg data-testid="logo-animated" width={size} />,
}));

vi.mock("@/components/home/LogoTextAnimated", () => ({
  default: () => <span data-testid="logo-text">QuantumTech</span>,
}));

import SolutionHeader from "@/components/solutions/SolutionHeader";

describe("SolutionHeader", () => {
  it("renderiza o logo com link para a home", () => {
    render(<SolutionHeader />);
    const logoLink = screen.getByRole("link", { name: /quantumtech/i });
    expect(logoLink).toHaveAttribute("href", "/");
    expect(screen.getByTestId("logo-animated")).toBeInTheDocument();
  });

  it("exibe os três botões de idioma", () => {
    render(<SolutionHeader />);
    expect(screen.getByRole("link", { name: "PT" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "EN" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ES" })).toBeInTheDocument();
  });

  it("marca o idioma atual (pt) com aria-current", () => {
    render(<SolutionHeader />);
    expect(screen.getByRole("link", { name: "PT" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "EN" })).not.toHaveAttribute("aria-current");
  });

  it("renderiza o link voltar ao site (backToSite)", () => {
    render(<SolutionHeader />);
    // NextLink mock renderiza href direto — PT usa "/" sem prefixo
    const backLinks = screen.getAllByRole("link", { name: /backToSite|QuantumTech/i });
    const backLink = backLinks.find((l) => l.textContent?.includes("backToSite"));
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("renderiza o CTA com href para contato", () => {
    render(<SolutionHeader />);
    const cta = screen.getByRole("link", { name: "talkToUs" });
    expect(cta).toHaveAttribute("href", "/portal/contato");
  });

  it("EN produz link com prefixo de locale correto", () => {
    render(<SolutionHeader />);
    const enLink = screen.getByRole("link", { name: "EN" });
    expect(enLink).toHaveAttribute("href", "/en/");
  });
});
