import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";

export default async function GuidePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-10">
        <Link href="/portal" className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
          ← Portal
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-white">Guia do Portal</h1>
        <p className="mt-1 text-sm text-slate-400">
          Como funciona a plataforma Quantum Technology, passo a passo.
        </p>
      </div>

      <div className="space-y-6">

        {/* 1. Briefing */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-300">1</span>
            <h2 className="text-base font-semibold text-white">Briefing inicial</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Tudo começa no formulário da página principal. Descreva o seu projeto — tipo, dor que quer resolver,
            público-alvo, funcionalidades desejadas, orçamento e prazo. A nossa IA analisa o briefing
            e calcula automaticamente uma pontuação de complexidade, horas estimadas e projetos semelhantes
            já entregues pela equipa.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-sky-300">Análise por IA</span>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-sky-300">Projetos similares</span>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-sky-300">Escopo técnico</span>
          </div>
        </section>

        {/* 2. Proposta */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-300">2</span>
            <h2 className="text-base font-semibold text-white">Proposta comercial</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Com base no escopo técnico gerado, a equipa prepara uma proposta detalhada com horas, custos
            e condições. Pode rever a proposta, deixar comentários em parágrafos específicos ou pedir
            uma reformulação assistida por IA. Quando estiver de acordo, aprove para avançar.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-violet-300">Comentários inline</span>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-violet-300">Reescrita por IA</span>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-violet-300">Aprovação</span>
          </div>
        </section>

        {/* 3. Pedido de serviço */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-300">3</span>
            <h2 className="text-base font-semibold text-white">Pedido de serviço</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Além dos briefings, pode criar pedidos diretos — para uma nova funcionalidade, correção de
            bug, suporte técnico ou projeto novo. Cada pedido tem um canal de mensagens dedicado para
            comunicação em tempo real com a equipa.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">Nova funcionalidade</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">Bug fix</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">Suporte</span>
          </div>
        </section>

        {/* 4. Pagamento */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/20 text-sm font-bold text-purple-300">4</span>
            <h2 className="text-base font-semibold text-white">Pagamento seguro</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Quando a proposta estiver aprovada, é gerada uma sessão de pagamento via Stripe. Pode
            pagar com cartão de crédito ou débito de forma segura. Após confirmação, o pedido é
            automaticamente movido para <strong className="text-white">Em produção</strong> e recebe
            uma fatura digital disponível para download.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-purple-300">Stripe</span>
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-purple-300">Fatura PDF</span>
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-purple-300">Pagamento seguro</span>
          </div>
        </section>

        {/* 5. Conclusão e avaliação */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/20 text-sm font-bold text-yellow-300">5</span>
            <h2 className="text-base font-semibold text-white">Conclusão e avaliação</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Quando o trabalho estiver entregue, o pedido é marcado como <strong className="text-white">Concluído</strong>.
            Nesse momento pode deixar uma avaliação de 1 a 5 estrelas com comentário opcional.
            O feedback é usado pela equipa para melhorar continuamente o serviço.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-yellow-300">1–5 estrelas</span>
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-yellow-300">Comentário</span>
          </div>
        </section>

        {/* Estados */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Estados de um pedido</h2>
          <div className="grid gap-2 text-xs">
            {[
              { status: "Pendente",          color: "bg-blue-500/20 text-blue-300",    desc: "Aguarda avaliação da equipa." },
              { status: "Em análise",         color: "bg-yellow-500/20 text-yellow-300", desc: "A equipa está a analisar o pedido." },
              { status: "Proposta enviada",   color: "bg-sky-500/20 text-sky-300",      desc: "Tem uma proposta para rever e aprovar." },
              { status: "Aprovado",           color: "bg-emerald-500/20 text-emerald-300", desc: "Proposta aprovada — aguarda pagamento." },
              { status: "Revisão solicitada", color: "bg-orange-500/20 text-orange-300", desc: "Pediu alterações à proposta." },
              { status: "Recusado",           color: "bg-red-500/20 text-red-300",       desc: "Pedido recusado pela equipa ou por si." },
              { status: "Em produção",        color: "bg-purple-500/20 text-purple-300", desc: "A equipa está a trabalhar no pedido." },
              { status: "Concluído",          color: "bg-green-500/20 text-green-300",   desc: "Trabalho entregue." },
            ].map(({ status, color, desc }) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-medium ${color}`}>{status}</span>
                <span className="text-slate-400">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ajuda */}
        <div className="rounded-2xl border border-white/10 bg-white/3 p-5 text-center">
          <p className="text-sm text-slate-400 mb-3">
            Tem alguma dúvida? Use o canal de mensagens no seu pedido ou contacte-nos diretamente.
          </p>
          <Link
            href="/portal/orders/new"
            className="inline-flex rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Novo pedido →
          </Link>
        </div>

      </div>
    </main>
  );
}
