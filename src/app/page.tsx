import LeadForm from "@/components/lead-form";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.22),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.25),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.18),transparent_35%)]" />

      <section className="mx-auto grid min-h-[92vh] w-full max-w-6xl gap-14 px-6 py-16 md:grid-cols-2 md:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-sky-200 backdrop-blur">
            Agência de software para negócios que querem escalar
          </div>

          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            Construímos produtos digitais que vendem, automatizam e crescem.
          </h1>

          <p className="max-w-xl text-lg text-slate-200/90">
            Da ideia ao lançamento: sites de alta conversão, sistemas sob medida,
            integrações com IA e automações com n8n para acelerar sua operação.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#lead"
              className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
            >
              Solicitar proposta
            </a>
            <a
              href="https://wa.me/351912345678"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/25 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Falar no WhatsApp
            </a>
          </div>

          <div className="grid max-w-xl grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-2xl font-bold text-white">+70</p>
              <p className="text-slate-300">Projetos entregues</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-slate-300">Clientes satisfeitos</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-2xl font-bold text-white">7 dias</p>
              <p className="text-slate-300">MVP inicial</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/8 p-8 backdrop-blur-xl">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-sky-200">
            Nosso método
          </p>
          <h2 className="mb-8 text-2xl font-semibold text-white">
            Execução rápida com visão de negócio
          </h2>
          <div className="space-y-5 text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">1) Diagnóstico técnico + comercial</p>
              <p>Mapeamos gargalos, objetivos e métricas de sucesso.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">2) Produto orientado a conversão</p>
              <p>UX premium, copy estratégica e stack escalável.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">3) Automação e inteligência</p>
              <p>Fluxos com n8n e IA para ganho real de produtividade.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-8 md:py-12">
        <h2 className="mb-6 text-3xl font-bold text-white">Serviços principais</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Websites e Landing Pages",
              text: "Páginas com alta performance, SEO e foco em geração de leads.",
            },
            {
              title: "Sistemas sob medida",
              text: "CRMs, painéis e plataformas internas alinhadas ao seu processo.",
            },
            {
              title: "Automação com n8n + IA",
              text: "Agentes e fluxos automáticos para atendimento, vendas e operação.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="mb-3 text-xl font-semibold text-white">{item.title}</h3>
              <p className="text-slate-300">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="lead" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Fale com nosso agente e receba uma proposta inicial
            </h2>
            <p className="mb-6 text-slate-300">
              Preencha o briefing em menos de 2 minutos. O lead é enviado para o
              fluxo n8n, qualificado automaticamente e você recebe retorno rápido.
            </p>
            <ul className="space-y-3 text-slate-200">
              <li>• Resposta inicial em até 1 hora útil</li>
              <li>• Escopo com sugestão de stack e prazo</li>
              <li>• Opção de contato por WhatsApp ou e-mail</li>
            </ul>
          </div>
          <LeadForm />
        </div>
      </section>
    </main>
  );
}
