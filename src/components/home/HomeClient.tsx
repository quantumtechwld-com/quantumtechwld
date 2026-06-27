"use client";


import { Zap, BrainCircuit, Bot, Rocket } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import NextLink from "next/link";
import { getContactUrl } from "@/lib/contact-url";
import { Link } from "@/i18n/navigation";
import GsapAnimations from "./GsapAnimations";
import LogoAnimated from "./LogoAnimated";
import LogoTextAnimated from "./LogoTextAnimated";
import LeadForm from "@/components/lead-form";
import type { LucideIcon } from "lucide-react";

// ── Dados não traduzíveis (nomes de tecnologias) ─────────────────────────────
const TECHS = [
  "Next.js", "React", "Node.js", "TypeScript", "PostgreSQL",
  "n8n", "OpenAI", "Prisma", "TailwindCSS", "Docker", "AWS", "Redis",
  "WordPress", "Python (Django/FastAPI)", "Java", "Go Lang", "Vue.js", "Angular", "MySQL", "MongoDB",
  "Laravel", ".NET", "GSAP", "Kubernetes", "Azure", "gRPC", "REST", "GraphQL",
  "Flutter", "React Native",
];

const MARQUEE_ITEMS = [
  ...TECHS.map((t) => ({ id: `a-${t}`, t })),
  ...TECHS.map((t) => ({ id: `b-${t}`, t })),
];

const SERVICE_ICONS: [LucideIcon, string, string][] = [
  [Zap,          "from-blue-500/15 to-indigo-600/10", "text-accent"],
  [BrainCircuit, "from-violet-500/15 to-purple-600/10", "text-violet-400"],
  [Bot,          "from-emerald-500/15 to-teal-600/10", "text-emerald-400"],
];

// ── Seletor de idioma compacto ────────────────────────────────────────────────
function LangSwitcher({ current }: Readonly<{ current: string }>) {
  const locales = [
    { code: "pt", label: "PT" },
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
  ];

  return (
    <div className="hidden items-center gap-1 md:flex">
      {locales.map(({ code, label }) => (
        <Link
          key={code}
          href="/"
          locale={code}
          className={`rounded px-2 py-1 text-xs font-bold transition-colors ${
            current === code
              ? "bg-white/10 text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function HomeClient() {
  const t = useTranslations();
  const locale = useLocale();

  // Dados traduzíveis construídos dentro do componente
  const SERVICES = [
    {
      Icon: SERVICE_ICONS[0][0],
      title: t("services.websitesTitle"),
      desc: t("services.websitesDesc"),
      gradient: SERVICE_ICONS[0][1],
      accent: SERVICE_ICONS[0][2],
    },
    {
      Icon: SERVICE_ICONS[1][0],
      title: t("services.systemsTitle"),
      desc: t("services.systemsDesc"),
      gradient: SERVICE_ICONS[1][1],
      accent: SERVICE_ICONS[1][2],
    },
    {
      Icon: SERVICE_ICONS[2][0],
      title: t("services.aiTitle"),
      desc: t("services.aiDesc"),
      gradient: SERVICE_ICONS[2][1],
      accent: SERVICE_ICONS[2][2],
      tags: ["OpenAI", "n8n", "LLM"],
    },
  ];

  const STATS = [
    { value: 70, suffix: "+", label: t("stats.projectsDelivered") },
    { value: 98, suffix: "%", label: t("stats.satisfiedClients") },
    { value: 7,  suffix: "d", label: t("stats.firstMvp") },
    { value: 3,  suffix: "x", label: t("stats.avgRoi") },
  ];

  const STEPS = [
    {
      num: "01",
      title: t("process.diagnosisTitle"),
      desc: t("process.diagnosisDesc"),
    },
    {
      num: "02",
      title: t("process.architectureTitle"),
      desc: t("process.architectureDesc"),
    },
    {
      num: "03",
      title: t("process.deliveryTitle"),
      desc: t("process.deliveryDesc"),
    },
  ];

  const PROJECTS = [
    {
      label: t("portfolio.saasLabel"),
      title: t("portfolio.saasTitle"),
      desc: t("portfolio.saasDesc"),
      tag: "React · Node · PostgreSQL",
      gradient: "from-blue-600 via-indigo-700 to-violet-800",
    },
    {
      label: t("portfolio.ecommerceLabel"),
      title: t("portfolio.ecommerceTitle"),
      desc: t("portfolio.ecommerceDesc"),
      tag: "Next.js · Stripe · Redis",
      gradient: "from-violet-600 via-purple-700 to-fuchsia-800",
    },
    {
      label: t("portfolio.aiLabel"),
      title: t("portfolio.aiTitle"),
      desc: t("portfolio.aiDesc"),
      tag: "OpenAI · n8n · WhatsApp · LLM",
      gradient: "from-emerald-600 via-teal-700 to-teal-900",
    },
  ];

  // Título hero: palavras normais + última palavra destacada
  const heroWords = t("hero.titleWords").split(" ");
  const heroHighlight = t("hero.titleHighlight");

  return (
    <div className="overflow-x-hidden">
      <GsapAnimations />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header
        data-gsap="nav"
        className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#050816]/90 backdrop-blur-md"
      >
        <nav aria-label="Navegação principal" className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:h-16 md:py-0">
          <div className="flex min-w-0 items-center gap-2.5">
            <LogoAnimated size={34} />
            <div className="min-w-0 max-[380px]:hidden">
              <LogoTextAnimated />
            </div>
          </div>
          <div className="hidden items-center gap-8 text-sm font-bold text-slate-300 md:flex">
            <a href="#services" className="transition-colors hover:text-white">{t("nav.services")}</a>
            <a href="#portfolio" className="transition-colors hover:text-white">{t("nav.projects")}</a>
            <a href="#lead" className="transition-colors hover:text-white">{t("nav.contact")}</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LangSwitcher current={locale} />
            <NextLink
              href="/portal"
              className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-slate-300 transition-all hover:border-white/30 hover:text-white sm:px-4 sm:text-sm"
            >
              {t("nav.clientArea")}
            </NextLink>
            <a
              href="#lead"
              className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-light hover:shadow-[0_0_20px_var(--accent-glow)] sm:px-5 sm:text-sm"
            >
              {t("nav.talkToUs")}
            </a>
          </div>
        </nav>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden">

        {/* Base BG */}
        <div className="absolute inset-0 bg-[#050816]" />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial glow orbs */}
        <div data-orb="1" className="pointer-events-none absolute left-[10%] top-[20%] h-125 w-125 rounded-full bg-violet-600/12 blur-[80px]" style={{ willChange: "transform" }} />
        <div data-orb="2" className="pointer-events-none absolute right-[8%] top-[28%] h-112.5 w-112.5 rounded-full bg-violet-600/12 blur-[70px]" style={{ willChange: "transform" }} />
        <div data-orb="3" className="pointer-events-none absolute bottom-[15%] left-[40%] h-95 w-95 rounded-full bg-violet-600/12 blur-[60px]" style={{ willChange: "transform" }} />

        {/* Hero Content */}
        <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-14 px-6 pb-20 pt-28 md:grid-cols-2 md:items-center">

          {/* Left column */}
          <div>
            {/* Badge */}
            <div
              data-hero="badge"
              className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-2 text-sm font-medium text-violet-300"
            >
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" /></span>
              <span>{t("hero.badge")}</span>
            </div>

            {/* Title — split por palavras para o GSAP */}
            <h1
              className="mb-7 text-5xl font-extrabold leading-[1.06] tracking-tight text-white md:text-[4.2rem] lg:text-[5rem]"
              style={{ perspective: 800 }}
            >
              {[...heroWords, heroHighlight].map((word, i, arr) => (
                <span
                  key={`${word}-${i}`}
                  data-hero="word"
                  className={`mr-[0.22em] inline-block last:mr-0 ${
                    i === arr.length - 1
                      ? "bg-linear-to-r from-violet-400 via-violet-500 to-purple-600 bg-clip-text text-transparent"
                      : ""
                  }`}
                >
                  {word}
                </span>
              ))}
            </h1>

            <p data-hero="sub" className="mb-10 max-w-120 text-lg leading-relaxed text-slate-300">
              {t("hero.subtitle")}
            </p>

            <div className="mb-12 flex flex-wrap gap-4">
              <a
                data-hero="cta"
                href="#lead"
                className="rounded-xl bg-linear-to-r from-violet-600 to-violet-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/40"
              >
                {t("hero.ctaProposal")}
              </a>
              <a
                data-hero="cta"
                href="https://wa.me/351912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white transition-all hover:border-white/30 hover:bg-white/10"
              >
                {t("hero.ctaWhatsapp")}
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden={true}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>

            {/* Mini stats */}
            <div className="grid max-w-sm grid-cols-3 gap-3">
              {[
                ["70+", t("hero.statProjects")],
                ["98%", t("hero.statSatisfaction")],
                [t("hero.statMvpValue"), t("hero.statMvp")],
              ].map(([v, l]) => (
                <div
                  data-hero="stat"
                  key={l}
                  className="rounded-xl border border-white/8 bg-white/4 p-4 text-center backdrop-blur"
                >
                  <p className="text-2xl font-bold text-white">{v}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — floating dashboard mockup */}
          <div data-hero="mockup" className="relative hidden md:block">
            {/* Notification badge */}
            <div
              data-float="notif"
              className="absolute -right-4 -top-6 z-20 rounded-2xl border border-emerald-500/30 bg-[#050816] px-4 py-3 shadow-xl"
            >
              <p className="text-xs font-semibold text-emerald-300">{t("hero.notifLead")}</p>
              <p className="mt-0.5 text-[10px] text-emerald-400/60">{t("hero.notifLeadSub")}</p>
            </div>

            {/* Deploy badge */}
            <div
              data-float="deploy"
              className="absolute -bottom-4 -left-4 z-20 rounded-2xl border border-violet-500/30 bg-[#050816] px-4 py-3 shadow-xl"
            >
              <p className="flex items-center gap-1.5 text-xs font-semibold text-violet-300">
                <Rocket size={12} aria-hidden="true" />
                {t("hero.notifDeploy")}
              </p>
              <p className="mt-0.5 text-[10px] text-violet-400/60">{t("hero.notifDeploySub")}</p>
            </div>

            {/* Main card */}
            <div className="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628]/80 p-6 shadow-2xl">
              {/* Titlebar */}
              <div className="mb-5 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <div className="ml-auto h-5 w-40 rounded-full bg-white/8" />
              </div>

              {/* Chart */}
              <div className="mb-5 overflow-hidden rounded-xl bg-linear-to-br from-violet-500/15 to-violet-500/8 p-4">
                <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-violet-400/60">{t("hero.chartRevenue")}</p>
                <div className="flex h-28 items-end gap-1.5">
                  {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                    <div
                      key={h}
                      className="flex-1 rounded-t-sm bg-linear-to-t from-violet-500 to-violet-400"
                      style={{ height: `${h}%`, opacity: 0.7 + i * 0.025 }}
                    />
                  ))}
                </div>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t("hero.kpiRevenue"),    val: "R$ 84k", trend: "+8.2%", up: true },
                  { label: t("hero.kpiConversion"),  val: "12.4%",  trend: "+3.1%", up: true },
                  { label: t("hero.kpiTickets"),     val: "231",    trend: "-1.4%", up: false },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-white/5 p-3">
                    <p className="text-[9px] font-medium uppercase tracking-wider text-slate-500">{item.label}</p>
                    <p className="mt-1 text-sm font-bold text-white">{item.val}</p>
                    <p className={`mt-0.5 text-[10px] font-medium ${item.up ? "text-emerald-400" : "text-rose-400"}`}>
                      {item.trend}
                    </p>
                  </div>
                ))}
              </div>

              {/* Progress row */}
              <div className="mt-5 space-y-2.5">
                {[
                  { label: t("hero.progressCampaigns"),   pct: 78 },
                  { label: t("hero.progressAutomations"), pct: 92 },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="mb-1 flex justify-between text-[10px] text-slate-400">
                      <span>{r.label}</span>
                      <span>{r.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-violet-500 to-violet-400"
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          data-hero="scroll"
          aria-hidden={true}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 opacity-35"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-slate-500">scroll</span>
          <div className="h-8 w-px bg-linear-to-b from-slate-500 to-transparent" />
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <div aria-hidden={true} className="relative overflow-hidden border-y border-white/20 bg-white/5 py-5">
        <div className="flex w-max animate-marquee">
          {MARQUEE_ITEMS.map(({ id, t: tech }) => (
            <span
              key={id}
              className="mx-10 text-xs font-bold uppercase tracking-[0.28em] text-white"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section id="services" data-gsap="services" className="mx-auto w-full max-w-6xl px-6 py-28">
        <p data-gsap="services-label" className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-accent">
          {t("services.label")}
        </p>
        <h2 data-gsap="services-heading" className="mb-4 max-w-2xl text-4xl font-extrabold text-white md:text-5xl">
          {t("services.heading").split(" ").slice(0, -1).join(" ")}{" "}
          <span className="bg-linear-to-r from-violet-400 via-violet-500 to-purple-600 bg-clip-text text-transparent">
            {t("services.heading").split(" ").at(-1)}
          </span>
        </h2>
        <p data-gsap="services-heading" className="mb-16 max-w-md text-slate-400">
          {t("services.subheading")}
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map((svc) => (
            <article
              data-gsap="service-card"
              key={svc.title}
              aria-label={svc.title}
              className={`group relative cursor-default overflow-hidden rounded-2xl border border-white/8 bg-linear-to-br ${svc.gradient} p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl`}
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.04), transparent 60%)" }} />

              <div className="mb-5">
                <svc.Icon size={40} className={svc.accent} aria-hidden="true" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">{svc.title}</h3>
              <p className="text-sm leading-relaxed text-slate-300/90">{svc.desc}</p>
              {svc.tags && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {svc.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className={`mt-6 flex items-center gap-1.5 text-xs font-bold ${svc.accent} opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100`}>
                <a href="#lead" className="flex items-center gap-1.5">{t("services.cta")} <span>→</span></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section aria-label="Estatísticas" data-gsap="stats" className="border-y border-white/6 bg-white/2 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
          {STATS.map((s) => (
            <div
              data-gsap="stat-card"
              key={s.label}
              className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center"
            >
              <p className="text-5xl font-black text-white">
                <span data-count-to={s.value}>0</span>
                <span className="text-accent">{s.suffix}</span>
              </p>
              <p className="mt-2 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section data-gsap="steps" className="mx-auto w-full max-w-6xl px-6 py-28">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-violet-400">
          {t("process.label")}
        </p>
        <h2 data-gsap="steps-heading" className="mb-16 text-4xl font-extrabold text-white md:text-5xl">
          {t("process.heading")}
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {STEPS.map((step) => (
            <div data-gsap="step" key={step.num} className="relative pl-8">
              <div className="absolute left-0 top-0 h-full w-px bg-linear-to-b from-violet-500/50 via-violet-500/20 to-transparent" />
              <span className="mb-4 block select-none text-7xl font-black leading-none text-white/15">
                {step.num}
              </span>
              <h3 className="mb-3 text-xl font-bold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 text-center">
          <p className="text-sm font-medium leading-relaxed text-slate-200 md:text-base">
            {t("process.dashboardNote")}
          </p>
        </div>
      </section>

      {/* ── PORTFOLIO ─────────────────────────────────────────────────────── */}
      <section id="portfolio" data-gsap="portfolio" className="mx-auto w-full max-w-6xl px-6 py-28">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">
          {t("portfolio.label")}
        </p>
        <h2 data-gsap="portfolio-heading" className="mb-16 text-4xl font-extrabold text-white md:text-5xl">
          {t("portfolio.heading")}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PROJECTS.map((p) => (
            <div
              data-gsap="project"
              key={p.title}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-white/2 transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl"
            >
              <div className="flex h-48 items-center bg-slate-50 px-6 sm:h-52 md:h-48 lg:h-56">
                <p className="text-sm font-semibold leading-relaxed text-slate-600">{p.desc}</p>
              </div>

              <div className="p-6">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">{p.label}</p>
                <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-violet-300">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500">{p.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section data-gsap="cta" className="mx-auto w-full max-w-6xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-linear-to-br from-violet-500/8 via-violet-600/8 to-purple-600/8 p-14 text-center md:p-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(155,89,255,0.18),transparent_65%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,92,246,0.12),transparent_60%)]" />

          <div data-gsap="cta-inner" className="relative space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent">
              {t("cta.label")}
            </p>
            <h2 className="mx-auto max-w-2xl text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
              {t("cta.heading").split("\n").map((line, i) => (
                <span key={line}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-300">
              {t("cta.subheading")}
            </p>
            <div>
              <a
                href="#lead"
                className="inline-block rounded-xl bg-linear-to-r from-violet-600 to-violet-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:scale-105 hover:shadow-[0_0_50px_var(--accent-glow)]"
              >
                {t("cta.button")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── LEAD FORM ─────────────────────────────────────────────────────── */}
      <section id="lead" data-gsap="lead" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-14 md:grid-cols-2 md:items-start">
          <div data-gsap="lead-left">
            <h2 className="mb-4 text-3xl font-extrabold text-white md:text-4xl">
              {t("lead.heading")}
            </h2>
            <p className="mb-8 text-slate-300">
              {t("lead.subheading")}
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              {[t("lead.benefit1"), t("lead.benefit2"), t("lead.benefit3")].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-400">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <NextLink
              href={getContactUrl(locale)}
              className="mt-6 inline-block text-sm text-slate-400 hover:text-accent transition-colors"
            >
              {t("lead.quickContact")}
            </NextLink>
          </div>
          <div data-gsap="lead-form">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/6 px-6 py-12 text-center text-sm text-slate-600">
        <p className="mb-1 font-semibold text-slate-400">
          Quantum<span className="text-accent">Tech</span>
        </p>
        <div className="mt-4 mb-4 flex items-center justify-center gap-5">
          {/* LinkedIn */}
          <a href="https://www.linkedin.com/company/quantumtech-software-agency" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-500 transition-colors hover:text-[#0A66C2]">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          {/* Facebook */}
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-500 transition-colors hover:text-[#1877F2]">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
          </a>
          {/* Instagram */}
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-500 transition-colors hover:text-[#E1306C]">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
        </div>
        <p>{t("footer.rights")}</p>
        {/* Bandeiras das regiões de atuação — SVG local com alt text para SEO e acessibilidade */}
        <div
          className="mt-3 flex items-center justify-center gap-4 text-slate-500"
          aria-label={t("footer.regionsLabel")}
        >
          <span className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/flags/flag-us.svg" alt={t("footer.regionUSA")} width={24} height={16} className="rounded-xs shadow-sm" />
            <span className="text-xs font-medium tracking-wide">{t("footer.regionUSA")}</span>
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/flags/flag-br.svg" alt={t("footer.regionBrazil")} width={24} height={16} className="rounded-xs shadow-sm" />
            <span className="text-xs font-medium tracking-wide">{t("footer.regionBrazil")}</span>
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/flags/flag-eu.svg" alt={t("footer.regionEurope")} width={24} height={16} className="rounded-xs shadow-sm" />
            <span className="text-xs font-medium tracking-wide">{t("footer.regionEurope")}</span>
          </span>
        </div>
      </footer>

    </div>
  );
}
