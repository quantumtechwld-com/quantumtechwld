import GsapAnimations from "./GsapAnimations";
import LogoAnimated from "./LogoAnimated";
import LogoTextAnimated from "./LogoTextAnimated";
import LeadForm from "@/components/lead-form";

// ── DATA ──────────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: "⚡",
    title: "Websites & Landing Pages",
    desc: "Páginas com alta performance, SEO técnico e foco em conversão. Do design ao deploy em dias.",
    gradient: "from-cyan-500/15 to-blue-600/10",
    accent: "text-cyan-400",
  },
  {
    icon: "🧠",
    title: "Sistemas sob Medida",
    desc: "CRMs, ERPs, portais e plataformas alinhadas ao processo de negócio, com UX premium.",
    gradient: "from-violet-500/15 to-purple-600/10",
    accent: "text-violet-400",
  },
  {
    icon: "🤖",
    title: "IA & Automação n8n",
    desc: "Agentes inteligentes, fluxos automatizados e integrações que eliminam trabalho manual.",
    gradient: "from-emerald-500/15 to-teal-600/10",
    accent: "text-emerald-400",
  },
];

const STATS = [
  { value: 70, suffix: "+", label: "Projetos entregues" },
  { value: 98, suffix: "%", label: "Clientes satisfeitos" },
  { value: 7, suffix: "d", label: "Para o primeiro MVP" },
  { value: 3, suffix: "x", label: "ROI médio em 6 meses" },
];

const TECHS = [
  "Next.js", "React", "Node.js", "TypeScript", "PostgreSQL",
  "n8n", "OpenAI", "Prisma", "TailwindCSS", "Docker", "AWS", "Redis",
];

const STEPS = [
  {
    num: "01",
    title: "Diagnóstico",
    desc: "Mapeamos objetivos, gargalos e métricas de sucesso do seu negócio e da concorrência.",
  },
  {
    num: "02",
    title: "Arquitetura & Design",
    desc: "Definimos stack, escopo técnico e cronograma com wireframes de alta fidelidade.",
  },
  {
    num: "03",
    title: "Entrega Contínua",
    desc: "Deploys incrementais com feedback constante, monitoramento e suporte dedicado.",
  },
];

const PROJECTS = [
  {
    label: "SaaS B2B",
    title: "Portal de Gestão Empresarial",
    tag: "React · Node · PostgreSQL",
    gradient: "from-cyan-600 via-blue-700 to-indigo-800",
    bars: [40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100],
  },
  {
    label: "E-commerce",
    title: "Plataforma de Vendas Omnichannel",
    tag: "Next.js · Stripe · Redis",
    gradient: "from-violet-600 via-purple-700 to-fuchsia-800",
    bars: [70, 45, 80, 55, 95, 60, 85, 40, 100, 75, 65, 90],
  },
  {
    label: "IA + Automação",
    title: "Agente de Atendimento Inteligente",
    tag: "OpenAI · n8n · WhatsApp",
    gradient: "from-emerald-600 via-teal-700 to-cyan-800",
    bars: [55, 80, 40, 95, 65, 75, 50, 85, 45, 90, 60, 100],
  },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function HomeClient() {
  return (
    <div className="overflow-x-hidden">
      <GsapAnimations />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header
        data-gsap="nav"
        className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#050816]/90 backdrop-blur-md"
      >
        <nav aria-label="Navegação principal" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <LogoAnimated size={34} />
            <LogoTextAnimated />
          </div>
          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#services" className="transition-colors hover:text-white">Serviços</a>
            <a href="#portfolio" className="transition-colors hover:text-white">Projetos</a>
            <a href="#lead" className="transition-colors hover:text-white">Contato</a>
          </div>
          <a
            href="#lead"
            className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            Fale conosco
          </a>
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
        <div data-orb="1" className="pointer-events-none absolute left-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[80px]" style={{ willChange: "transform" }} />
        <div data-orb="2" className="pointer-events-none absolute right-[8%] top-[28%] h-[450px] w-[450px] rounded-full bg-violet-500/10 blur-[70px]" style={{ willChange: "transform" }} />
        <div data-orb="3" className="pointer-events-none absolute bottom-[15%] left-[40%] h-[380px] w-[380px] rounded-full bg-indigo-600/10 blur-[60px]" style={{ willChange: "transform" }} />

        {/* Hero Content */}
        <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-14 px-6 pb-20 pt-28 md:grid-cols-2 md:items-center">

          {/* Left column */}
          <div>
            {/* Badge */}
            <div
              data-hero="badge"
              className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-2 text-sm font-medium text-cyan-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              Agência de software para negócios que crescem
            </div>

            {/* Title — split by words for GSAP */}
            <h1
              className="mb-7 text-5xl font-extrabold leading-[1.06] tracking-tight text-white md:text-[4.2rem] lg:text-[5rem]"
              style={{ perspective: 800 }}
            >
              {["Construímos", "produtos", "digitais", "que", "crescem."].map((word, i) => (
                <span
                  key={word}
                  data-hero="word"
                  className={`mr-[0.22em] inline-block last:mr-0 ${
                    i === 4
                      ? "bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent"
                      : ""
                  }`}
                >
                  {word}
                </span>
              ))}
            </h1>

            <p data-hero="sub" className="mb-10 max-w-[30rem] text-lg leading-relaxed text-slate-300">
              Da ideia ao lançamento: sites de alta conversão, sistemas sob medida,
              integrações com IA e automações com n8n para escalar sua operação.
            </p>

            <div className="mb-12 flex flex-wrap gap-4">
              <a
                data-hero="cta"
                href="#lead"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/40"
              >
                Solicitar proposta
              </a>
              <a
                data-hero="cta"
                href="https://wa.me/351912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white transition-all hover:border-white/30 hover:bg-white/10"
              >
                WhatsApp
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden={true}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>

            {/* Mini stats */}
            <div className="grid max-w-sm grid-cols-3 gap-3">
              {[["70+", "Projetos"], ["98%", "Satisfação"], ["7 dias", "1º MVP"]].map(([v, l]) => (
                <div
                  data-hero="stat"
                  key={l}
                  className="rounded-xl border border-white/8 bg-white/[0.04] p-4 text-center backdrop-blur"
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
              <p className="text-xs font-semibold text-emerald-300">✓ Lead qualificado</p>
              <p className="mt-0.5 text-[10px] text-emerald-400/60">via n8n · agora mesmo</p>
            </div>

            {/* Deploy badge */}
            <div
              data-float="deploy"
              className="absolute -bottom-4 -left-4 z-20 rounded-2xl border border-violet-500/30 bg-[#050816] px-4 py-3 shadow-xl"
            >
              <p className="text-xs font-semibold text-violet-300">⚡ Deploy concluído</p>
              <p className="mt-0.5 text-[10px] text-violet-400/60">v2.4.1 · produção</p>
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
              <div className="mb-5 overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/8 p-4">
                <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-cyan-400/60">Receita mensal</p>
                <div className="flex h-28 items-end gap-1.5">
                  {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-500 to-blue-400"
                      style={{ height: `${h}%`, opacity: 0.7 + i * 0.025 }}
                    />
                  ))}
                </div>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Receita", val: "R$ 84k", trend: "+8.2%", up: true },
                  { label: "Conversão", val: "12.4%", trend: "+3.1%", up: true },
                  { label: "Tickets", val: "231", trend: "-1.4%", up: false },
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
                  { label: "Campanhas ativas", pct: 78 },
                  { label: "Automações rodando", pct: 92 },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="mb-1 flex justify-between text-[10px] text-slate-400">
                      <span>{r.label}</span>
                      <span>{r.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
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
          <div className="h-8 w-px bg-gradient-to-b from-slate-500 to-transparent" />
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <div aria-hidden={true} className="relative overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...TECHS, ...TECHS].map((t, i) => (
            <span
              key={i}
              className="mx-10 text-xs font-bold uppercase tracking-[0.28em] text-slate-500"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section id="services" data-gsap="services" className="mx-auto w-full max-w-6xl px-6 py-28">
        <p data-gsap="services-label" className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-cyan-400">
          O que fazemos
        </p>
        <h2 data-gsap="services-heading" className="mb-4 max-w-2xl text-4xl font-extrabold text-white md:text-5xl">
          Serviços que{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            transformam negócios
          </span>
        </h2>
        <p data-gsap="services-heading" className="mb-16 max-w-md text-slate-400">
          Da estratégia ao código: entregamos tecnologia com visão de negócio.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map((svc) => (
            <article
              data-gsap="service-card"
              key={svc.title}
              aria-label={svc.title}
              className={`group relative cursor-default overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br ${svc.gradient} p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl`}
            >
              {/* Glow on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.04), transparent 60%)" }} />

              <div className="mb-5 text-4xl">{svc.icon}</div>
              <h3 className="mb-3 text-xl font-bold text-white">{svc.title}</h3>
              <p className="text-sm leading-relaxed text-slate-300/90">{svc.desc}</p>
              <div className={`mt-6 flex items-center gap-1.5 text-xs font-bold ${svc.accent} opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100`}>
                Ver detalhes <span>→</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section aria-label="Estatísticas" data-gsap="stats" className="border-y border-white/[0.06] bg-white/[0.02] py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
          {STATS.map((s) => (
            <div
              data-gsap="stat-card"
              key={s.label}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 text-center"
            >
              <p className="text-5xl font-black text-white">
                <span data-count-to={s.value}>0</span>
                <span className="text-cyan-400">{s.suffix}</span>
              </p>
              <p className="mt-2 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section data-gsap="steps" className="mx-auto w-full max-w-6xl px-6 py-28">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-violet-400">
          Processo
        </p>
        <h2 data-gsap="steps-heading" className="mb-16 text-4xl font-extrabold text-white md:text-5xl">
          Como trabalhamos
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {STEPS.map((step) => (
            <div data-gsap="step" key={step.num} className="relative pl-8">
              <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-violet-500/50 via-violet-500/20 to-transparent" />
              <span className="mb-4 block select-none text-7xl font-black leading-none text-white/[0.05]">
                {step.num}
              </span>
              <h3 className="mb-3 text-xl font-bold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PORTFOLIO ─────────────────────────────────────────────────────── */}
      <section id="portfolio" data-gsap="portfolio" className="mx-auto w-full max-w-6xl px-6 py-28">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">
          Cases recentes
        </p>
        <h2 data-gsap="portfolio-heading" className="mb-16 text-4xl font-extrabold text-white md:text-5xl">
          Projetos que entregamos
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PROJECTS.map((p) => (
            <div
              data-gsap="project"
              key={p.title}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl"
            >
              {/* Mock screenshot */}
              <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${p.gradient}`}>
                {/* Titlebar */}
                <div className="absolute inset-x-0 top-0 flex h-8 items-center gap-1.5 bg-black/25 px-4 backdrop-blur-sm">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                  <div className="mx-auto h-4 w-32 rounded-full bg-white/15" />
                </div>
                {/* UI mock content */}
                <div className="absolute inset-x-4 bottom-4 top-12 space-y-2.5 overflow-hidden rounded-xl bg-black/20 p-4 backdrop-blur-sm">
                  <div className="h-2 w-3/4 rounded-full bg-white/30" />
                  <div className="h-2 w-1/2 rounded-full bg-white/20" />
                  {/* Mini chart */}
                  <div className="flex h-10 items-end gap-0.5 rounded-lg bg-white/5 px-2 py-1.5">
                    {p.bars.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-[2px] bg-white/40"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-9 rounded-lg bg-white/20" />
                    <div className="h-9 rounded-lg bg-white/12" />
                    <div className="h-9 rounded-lg bg-white/20" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">{p.label}</p>
                <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-cyan-300">
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
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-cyan-500/8 via-violet-500/8 to-blue-600/8 p-14 text-center md:p-24">
          {/* Background radial */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.18),transparent_65%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,92,246,0.12),transparent_60%)]" />

          <div data-gsap="cta-inner" className="relative space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-400">
              Pronto para começar?
            </p>
            <h2 className="mx-auto max-w-2xl text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
              Transforme sua ideia<br />em produto real
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-300">
              Converse com nossa equipe e receba um diagnóstico técnico gratuito.
            </p>
            <div>
              <a
                href="#lead"
                className="inline-block rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(6,182,212,0.4)]"
              >
                Solicitar diagnóstico gratuito
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
              Fale com nosso agente e receba uma proposta
            </h2>
            <p className="mb-8 text-slate-300">
              Preencha em menos de 2 minutos. Qualificamos automaticamente via n8n
              e você recebe retorno rápido.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              {["Resposta em até 1 hora útil", "Escopo com stack e prazo sugeridos", "Sem compromisso"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-400">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div data-gsap="lead-form">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 py-12 text-center text-sm text-slate-600">
        <p className="mb-1 font-semibold text-slate-400">
          Quantum<span className="text-cyan-400">Tech</span>
        </p>
        <p>© 2026 Todos os direitos reservados.</p>
      </footer>

    </div>
  );
}
