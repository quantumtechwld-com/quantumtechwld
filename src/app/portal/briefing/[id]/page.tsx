import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ScopeGenerator from "./ScopeGenerator";
import type { GeneratedScope } from "@/app/api/briefing/scope/route";

const STATUS_LABEL: Record<string, string> = {
  RECEIVED:       "Recebido",
  IN_ANALYSIS:    "Em análise",
  PROPOSAL_SENT:  "Proposta enviada",
  IN_NEGOTIATION: "Em negociação",
  APPROVED:       "Aprovado",
  IN_PROGRESS:    "Em desenvolvimento",
  DELIVERED:      "Entregue",
};

const STATUS_COLOR: Record<string, string> = {
  RECEIVED:       "bg-slate-500/30 text-slate-200",
  IN_ANALYSIS:    "bg-yellow-500/20 text-yellow-300",
  PROPOSAL_SENT:  "bg-blue-500/20 text-blue-300",
  IN_NEGOTIATION: "bg-purple-500/20 text-purple-300",
  APPROVED:       "bg-emerald-500/20 text-emerald-300",
  IN_PROGRESS:    "bg-sky-500/20 text-sky-300",
  DELIVERED:      "bg-green-500/20 text-green-300",
};

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function BriefingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const briefing = await prisma.briefing.findFirst({
    where: { id, user: { email: session.user.email } },
  });

  if (!briefing) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scopeRow = await (prisma as any).scope.findUnique({ where: { briefingId: id } });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proposalRow = await (prisma as any).proposal.findUnique({
    where: { briefingId: id },
    select: { status: true },
  }) as { status: string } | null;
  const proposalVisible = proposalRow && proposalRow.status !== "DRAFT";

  const initialScope: GeneratedScope | null = scopeRow
    ? {
        features:        scopeRow.features,
        userStories:     scopeRow.userStories,
        screens:         scopeRow.screens,
        integrations:    scopeRow.integrations,
        techRecommended: scopeRow.techRecommended,
        hoursEstimate:   scopeRow.hoursEstimate,
        costMin:         scopeRow.costMin,
        costMax:         scopeRow.costMax,
        confidence:      scopeRow.confidence,
      }
    : null;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      {/* Navegação */}
      <div className="mb-8 flex items-center gap-3 text-sm text-slate-400">
        <Link href="/portal" className="hover:text-white transition">
          Portal
        </Link>
        <span>/</span>
        <span className="text-white">Briefing</span>
      </div>

      {/* Cabeçalho do briefing */}
      <div className="mb-8 rounded-2xl border border-white/15 bg-white/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Tipo de projeto</p>
            <h1 className="text-2xl font-bold text-white">{briefing.projectType}</h1>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${STATUS_COLOR[briefing.status] ?? "bg-slate-500/30 text-slate-200"}`}
          >
            {STATUS_LABEL[briefing.status] ?? briefing.status}
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Problema principal</p>
            <p className="text-sm text-slate-300">{briefing.painPoints}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Público-alvo</p>
            <p className="text-sm text-slate-300">{briefing.targetAudience}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-0.5">Orçamento</p>
            <p className="text-white">{briefing.budget}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-0.5">Prazo</p>
            <p className="text-white">{briefing.timeline}</p>
          </div>
          {briefing.complexityScore && (
            <>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-0.5">Complexidade</p>
                <p className="text-white">{briefing.complexityScore}/10</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-0.5">Estimativa inicial</p>
                <p className="text-white">{briefing.hoursMin}–{briefing.hoursMax}h</p>
              </div>
            </>
          )}
        </div>

        {briefing.features.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {briefing.features.map((f: string) => (
              <span
                key={f}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {proposalVisible && (
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-slate-400">A sua proposta comercial está disponível.</p>
            <Link
              href={`/portal/briefing/${id}/proposta`}
              className="rounded-xl bg-sky-500/15 px-4 py-2 text-sm font-medium text-sky-300 hover:bg-sky-500/25 transition"
            >
              Ver proposta →
            </Link>
          </div>
        )}
      </div>

      {/* Escopo M2 */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Escopo Técnico</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Gerado pelo Cérebro de Arquitetura (M2)
            </p>
          </div>
        </div>
        <ScopeGenerator
          briefingId={briefing.id}
          initialScope={initialScope}
        />
      </div>
    </main>
  );
}
