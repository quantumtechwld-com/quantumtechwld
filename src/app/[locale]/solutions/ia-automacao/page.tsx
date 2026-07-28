import type { Metadata } from "next";
import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  FileSearch,
  LayoutDashboard,
  MessageSquare,
  Network,
  Rocket,
  UserCheck,
  Workflow,
} from "lucide-react";
import { getContactUrl } from "@/lib/contact-url";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://quantumtechwld.com";

type Locale = (typeof routing.locales)[number];

const metadataByLocale: Record<Locale, { title: string; description: string }> = {
  pt: {
    title: "IA Generativa, RAG, Agentes Autônomos e Automação | QuantumTech",
    description:
      "Desenvolvemos agentes de IA com LLM, RAG e n8n. OpenAI, Claude, Gemini, LangChain e Agentic AI para empresas que querem escalar sem crescer o time.",
  },
  en: {
    title: "Generative AI, RAG, Autonomous Agents and LLM Automation | QuantumTech",
    description:
      "We build AI agents with LLMs, RAG and n8n automations. OpenAI, Claude, Gemini, LangChain and Agentic AI for businesses that need to scale without growing the team.",
  },
  es: {
    title: "IA Generativa, RAG, Agentes Autónomos y Automatización LLM | QuantumTech",
    description:
      "Desarrollamos agentes de IA con LLMs, RAG y n8n. OpenAI, Claude, Gemini, LangChain y Agentic AI para empresas que necesitan escalar sin crecer el equipo.",
  },
};

function resolveLocale(locale: string): Locale {
  return routing.locales.includes(locale as Locale) ? (locale as Locale) : "pt";
}

function withLocalePrefix(locale: Locale, path = "") {
  return locale === "pt" ? path || "/" : `/${locale}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const metadata = metadataByLocale[currentLocale];
  const path = withLocalePrefix(currentLocale, "/solutions/ia-automacao");

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: `${BASE_URL}${path}`,
      languages: {
        pt: `${BASE_URL}/solutions/ia-automacao`,
        en: `${BASE_URL}/en/solutions/ia-automacao`,
        es: `${BASE_URL}/es/solutions/ia-automacao`,
        "x-default": `${BASE_URL}/solutions/ia-automacao`,
      },
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: "website",
      url: `${BASE_URL}${path}`,
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
    },
  };
}

export default async function IaAutomacaoSolutionPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const currentLocale = resolveLocale(locale);
  const t = await getTranslations("solutionAI");

  const homeHref = withLocalePrefix(currentLocale, "/");
  const contactHref = getContactUrl(currentLocale);
  const solutionHref = `${BASE_URL}${withLocalePrefix(currentLocale, "/solutions/ia-automacao")}`;

  const problems = [1, 2, 3].map((index) => ({
    title: t(`problems.card${index}.title`),
    description: t(`problems.card${index}.description`),
  }));

  const deliverables = [1, 2].map((index) => ({
    title: t(`solution.deliverable${index}.title`),
    description: t(`solution.deliverable${index}.description`),
  }));

  const useCases = [1, 2, 3, 4, 5, 6].map((index) => ({
    title: t(`useCases.card${index}.title`),
    description: t(`useCases.card${index}.description`),
  }));

  const processSteps = [1, 2, 3, 4].map((index) => ({
    step: t(`process.step${index}.step`),
    title: t(`process.step${index}.title`),
    description: t(`process.step${index}.description`),
  }));

  const stackItems = [1, 2, 3, 4, 5, 6, 7].map((index) => t(`stack.items.item${index}`));

  const checklistItems = [1, 2, 3, 4].map((index) => t(`proof.checklist.item${index}`));

  const faqEntries = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => ({
    question: t(`faq.item${index}.question`),
    answer: t(`faq.item${index}.answer`),
  }));

  const deliverableIcons = [Bot, Network] as const;
  const useCaseIcons = [MessageSquare, Brain, FileSearch, Workflow, BarChart3, UserCheck] as const;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: t("meta.serviceName"),
        serviceType: t("meta.serviceType"),
        description: metadataByLocale[currentLocale].description,
        provider: {
          "@type": "Organization",
          name: "QuantumTech",
          url: BASE_URL,
        },
        areaServed: ["Brazil", "Portugal", "Europe", "United States"],
        url: solutionHref,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t("breadcrumb.home"),
            item: `${BASE_URL}${homeHref}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: t("breadcrumb.current"),
            item: solutionHref,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqEntries.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: entry.answer,
          },
        })),
      },
      {
        "@type": "HowTo",
        name: t("process.heading"),
        step: processSteps.map((s, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          name: s.title,
          text: s.description,
        })),
      },
    ],
  };

  return (
    <main className="bg-[#050816] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-white/8 bg-linear-to-b from-[#08101f] via-[#050816] to-[#050816]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-28">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <NextLink href={homeHref} className="transition-colors hover:text-white">
              {t("breadcrumb.home")}
            </NextLink>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{t("breadcrumb.current")}</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm font-medium text-emerald-300">
                <Brain size={14} aria-hidden="true" />
                {t("hero.badge")}
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
                {t("hero.title")}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
                {t("hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={contactHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/40"
                >
                  {t("hero.primaryCta")}
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <NextLink
                  href={homeHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/4 px-6 py-3.5 font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/8"
                >
                  {t("hero.secondaryCta")}
                </NextLink>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-sm">
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="rounded-2xl border border-white/8 bg-[#0b1528]/80 p-5">
                    <p className="text-3xl font-black text-white">{t(`hero.proof${index}.value`)}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-200">{t(`hero.proof${index}.title`)}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{t(`hero.proof${index}.description`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEMS ── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">{t("problems.eyebrow")}</p>
        <h2 className="max-w-3xl text-3xl font-extrabold text-white md:text-5xl">{t("problems.heading")}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">{t("problems.intro")}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {problems.map((problem, index) => (
            <article key={problem.title} className="rounded-3xl border border-white/8 bg-white/3 p-7">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
                <span className="text-lg font-black">0{index + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-white">{problem.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{problem.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── ROI STATS ── */}
      <section aria-label={t("stats.label")} className="border-y border-white/6 bg-[#070f1c]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 py-14 md:grid-cols-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="rounded-2xl border border-white/8 bg-white/3 p-6 text-center">
              <p className="text-4xl font-black text-emerald-300">{t(`stats.stat${index}.value`)}</p>
              <p className="mt-3 text-xs leading-5 text-slate-400">{t(`stats.stat${index}.label`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="border-y border-white/6 bg-white/3">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">{t("solution.eyebrow")}</p>
              <h2 className="text-3xl font-extrabold text-white md:text-5xl">{t("solution.heading")}</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">{t("solution.intro")}</p>
            </div>
            <div className="grid gap-5">
              {(() => {
                return deliverables.map((item, index) => {
                  const Icon = deliverableIcons[index] ?? Bot;
                  return (
                    <article key={item.title} className="rounded-3xl border border-white/8 bg-[#0b1528]/85 p-6">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                        <Icon size={22} aria-hidden="true" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p>
                    </article>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">{t("useCases.eyebrow")}</p>
        <h2 className="text-3xl font-extrabold text-white md:text-5xl">{t("useCases.heading")}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {useCases.map((item, index) => {
            const Icon = useCaseIcons[index] ?? Brain;
            return (
              <article key={item.title} className="rounded-3xl border border-white/8 bg-white/3 p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── DEMO IMAGE PLACEHOLDER ── */}
      <section className="mx-auto max-w-6xl px-6 pb-4">
        <figure
          aria-label={t("demo.imageAlt")}
          className="overflow-hidden rounded-3xl border border-dashed border-white/15 bg-[#08101f]"
        >
          <div className="flex min-h-80 flex-col items-center justify-center gap-4 p-10 text-center md:min-h-96">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/3">
              <LayoutDashboard size={28} className="text-slate-500" aria-hidden="true" />
            </div>
            <figcaption className="max-w-lg">
              <p className="text-sm font-semibold text-slate-400">{t("demo.imageCaption")}</p>
              <p className="mt-2 text-xs font-medium text-slate-600">{t("demo.imageSoon")}</p>
            </figcaption>
          </div>
        </figure>
      </section>

      {/* ── PROCESS ── */}
      <section className="border-y border-white/6 bg-[#08101f]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">{t("process.eyebrow")}</p>
          <h2 className="text-3xl font-extrabold text-white md:text-5xl">{t("process.heading")}</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {processSteps.map((item) => (
              <article key={item.step} className="rounded-3xl border border-white/8 bg-white/4 p-6">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-300">{item.step}</p>
                <h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── STACK + PROOF ── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-3xl border border-white/8 bg-[#0b1528]/90 p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">{t("stack.eyebrow")}</p>
            <h2 className="text-3xl font-extrabold text-white">{t("stack.heading")}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">{t("stack.intro")}</p>
            <ul className="mt-6 space-y-3">
              {stackItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-300">
                  <CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-300" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/8 bg-linear-to-br from-emerald-500/10 via-white/3 to-teal-700/10 p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">{t("proof.eyebrow")}</p>
            <h2 className="text-3xl font-extrabold text-white">{t("proof.heading")}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{t("proof.description")}</p>
            <div className="mt-6 rounded-2xl border border-white/8 bg-[#07101f]/75 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">{t("proof.caseLabel")}</p>
              <h3 className="mt-3 text-2xl font-bold text-white">{t("proof.caseTitle")}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{t("proof.caseDescription")}</p>
            </div>
            <ul className="mt-6 space-y-3">
              {checklistItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-300">
                  <Rocket size={18} className="mt-1 shrink-0 text-emerald-300" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-y border-white/6 bg-white/3">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">{t("faq.eyebrow")}</p>
          <h2 className="text-3xl font-extrabold text-white md:text-5xl">{t("faq.heading")}</h2>
          <div className="mt-10 grid gap-5">
            {faqEntries.map((item) => (
              <article key={item.question} className="rounded-3xl border border-white/8 bg-[#0b1528]/75 p-6">
                <h3 className="text-lg font-bold text-white">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-4xl border border-white/8 bg-linear-to-r from-emerald-500/10 via-teal-500/8 to-emerald-600/10 p-8 md:p-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">{t("cta.eyebrow")}</p>
          <h2 className="max-w-3xl text-3xl font-extrabold text-white md:text-5xl">{t("cta.heading")}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">{t("cta.description")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={contactHref}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/40"
            >
              {t("cta.primaryCta")}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <NextLink
              href={homeHref}
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/4 px-6 py-3.5 font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/8"
            >
              {t("cta.secondaryCta")}
            </NextLink>
          </div>
        </div>
      </section>
    </main>
  );
}
