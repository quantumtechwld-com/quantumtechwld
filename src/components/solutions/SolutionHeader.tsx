"use client";

import { useLocale, useTranslations } from "next-intl";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getContactUrl } from "@/lib/contact-url";
import LogoAnimated from "@/components/home/LogoAnimated";
import LogoTextAnimated from "@/components/home/LogoTextAnimated";

const LOCALES = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
] as const;

/** Gera o href da home respeitando localePrefix: "as-needed" (PT sem prefixo) */
function homeHref(locale: string) {
  return locale === "pt" ? "/" : `/${locale}`;
}

export default function SolutionHeader() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const contactHref = getContactUrl(locale, {
    source: "site",
    medium: "organic",
    campaign: "solution-nav",
    content: "header-cta",
  });
  const home = homeHref(locale);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#050816]/90 backdrop-blur-md">
      <nav
        aria-label="Navegação da página de solução"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
      >
        {/* Logo — sempre visível */}
        <NextLink
          href={home}
          className="flex min-w-0 items-center gap-2.5"
          aria-label="QuantumTech — página inicial"
        >
          <LogoAnimated size={34} />
          <div className="min-w-0 max-[380px]:hidden">
            <LogoTextAnimated />
          </div>
        </NextLink>

        {/* Lado direito */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Seletor de idioma — visível a partir de sm (≥640px) */}
          <div className="hidden items-center gap-1 sm:flex" aria-label="Selecionar idioma">
            {LOCALES.map(({ code, label }) => (
              <Link
                key={code}
                href="/"
                locale={code}
                className={`rounded px-2 py-1 text-xs font-bold transition-colors ${
                  locale === code
                    ? "bg-white/10 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                aria-current={locale === code ? "true" : undefined}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Voltar ao site — apenas desktop (≥768px) */}
          <NextLink
            href={home}
            className="hidden items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-slate-300 transition-all hover:border-white/30 hover:text-white md:flex"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            {t("backToSite")}
          </NextLink>

          {/* CTA — sempre visível, compacto no mobile */}
          <a
            href={contactHref}
            className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-light hover:shadow-[0_0_20px_var(--accent-glow)] sm:px-5"
          >
            {t("talkToUs")}
          </a>
        </div>
      </nav>
    </header>
  );
}

