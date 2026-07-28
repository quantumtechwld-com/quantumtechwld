"use client";

import { useLocale, useTranslations } from "next-intl";
import NextLink from "next/link";
import { Zap, BrainCircuit, Bot } from "lucide-react";

const SOLUTIONS = [
  {
    key: "websites",
    slug: "websites-landing-pages",
    icon: Zap,
    accent: "text-violet-400",
    bg: "bg-violet-500/10",
    titleKey: "websitesTitle" as const,
    descKey: "websitesDesc" as const,
  },
  {
    key: "sistemas",
    slug: "sistemas-sob-medida",
    icon: BrainCircuit,
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    titleKey: "systemsTitle" as const,
    descKey: "systemsDesc" as const,
  },
  {
    key: "ia",
    slug: "ia-automacao",
    icon: Bot,
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    titleKey: "aiTitle" as const,
    descKey: "aiDesc" as const,
  },
] as const;

const LABEL: Record<string, string> = {
  pt: "Outras soluções",
  en: "Other solutions",
  es: "Otras soluciones",
};

const CTA: Record<string, string> = {
  pt: "Ver solução",
  en: "View solution",
  es: "Ver solución",
};

export default function SolutionRelated() {
  const locale = useLocale();
  const t = useTranslations("services");
  const prefix = locale === "pt" ? "" : `/${locale}`;

  return (
    <section className="border-t border-white/6 bg-[#07101e]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <p className="mb-8 text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
          {LABEL[locale] ?? LABEL.pt}
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          {SOLUTIONS.map(({ key, slug, icon: Icon, accent, bg, titleKey, descKey }) => (
            <NextLink
              key={key}
              href={`${prefix}/solutions/${slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/3 p-5 transition-all hover:-translate-y-1 hover:border-white/16 hover:bg-white/5"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={18} className={accent} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t(titleKey)}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">{t(descKey)}</p>
              </div>
              <span className={`mt-auto text-xs font-semibold ${accent} opacity-0 transition-opacity group-hover:opacity-100`}>
                {CTA[locale] ?? CTA.pt} →
              </span>
            </NextLink>
          ))}
        </div>
      </div>
    </section>
  );
}
