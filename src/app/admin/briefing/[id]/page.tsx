import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { GeneratedScope } from "@/app/api/briefing/scope/route";
import AdminStatusForm from "./AdminStatusForm";
import ScopeView from "./ScopeView";
import ProposalManager from "./ProposalManager";
import {
  BRIEFING_STATUS_LABEL as STATUS_LABEL,
  BRIEFING_STATUS_COLOR as STATUS_COLOR,
  PROJECT_TYPE_LABEL as PROJECT_LABEL,
} from "@/lib/constants";

export default async function AdminBriefingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/portal");
  }

  const { id } = await params;

  const briefing = await prisma.briefing.findUnique({
    where: { id },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!briefing) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scopeRaw = await (prisma as any).scope.findUnique({
    where: { briefingId: id },
  }) as {
    hoursEstimate: number;
    costMin: number;
    costMax: number;
    confidence: number;
    features: GeneratedScope["features"];
    userStories: GeneratedScope["userStories"];
    screens: string[];
    integrations: string[];
    techRecommended: string[];
  } | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proposalRaw = await (prisma as any).proposal.findUnique({
    where: { briefingId: id },
  }) as {
    id: string;
    version: number;
    status: string;
    summary: string;
    content: string;
    hoursTotal: number;
    costMin: number;
    costMax: number;
    clientNote: string | null;
    reviewedAt: string | null;
    createdAt: Date;
  } | null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-cyan-500 text-sm font-bold hover:opacity-80 transition-opacity mr-1">
              A
            </Link>
            <Link href="/admin" className="text-white/50 hover:text-white/80 transition-colors text-sm">
              ← Admin Panel
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-white/70 text-sm font-medium">Briefing #{id.slice(-8)}</span>
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[briefing.status]}`}>
            {STATUS_LABEL[briefing.status]}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Client + Project Info */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Client card */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Cliente</h2>
            <div>
              <p className="text-white font-semibold text-lg">{briefing.user.name ?? "Sem nome"}</p>
              <p className="text-white/50 text-sm">{briefing.user.email}</p>
            </div>
            <div className="pt-2 border-t border-white/5 text-xs text-white/40">
              Submetido em {new Date(briefing.createdAt).toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Status management card */}
          <AdminStatusForm briefingId={id} currentStatus={briefing.status} statusLabels={STATUS_LABEL} />
        </div>

        {/* Brief details */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Detalhes do Briefing</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Detail label="Tipo de Projecto" value={PROJECT_LABEL[briefing.projectType] ?? briefing.projectType} />
            <Detail label="Orçamento" value={briefing.budget} />
            <Detail label="Prazo" value={briefing.timeline} />
            <Detail label="Público-Alvo" value={briefing.targetAudience} />
            {briefing.complexityScore != null && (
              <Detail label="Complexidade Calc." value={`${briefing.complexityScore} pts`} />
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Problemas a Resolver</p>
            <p className="text-white/80 text-sm leading-relaxed">{briefing.painPoints}</p>
          </div>
          {briefing.features.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wider">Funcionalidades</p>
              <div className="flex flex-wrap gap-2">
                {briefing.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-md bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-white/70"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
          {briefing.customFeatures && (
            <div className="space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wider">Funcionalidades Extras</p>
              <p className="text-white/80 text-sm leading-relaxed">{briefing.customFeatures}</p>
            </div>
          )}
        </div>

        {/* Scope section */}
        <ScopeView briefingId={id} initialScope={scopeRaw} />

        {/* M3: Proposta Comercial */}
        <div>
          <h2 className="text-base font-semibold text-white/70 uppercase tracking-wider mb-4">Proposta Comercial (M3)</h2>
          <ProposalManager
            briefingId={id}
            initialProposal={proposalRaw ? { ...proposalRaw, createdAt: proposalRaw.createdAt.toISOString() } as never : null}
            hasScope={!!scopeRaw}
          />
        </div>
      </main>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white/80 text-sm">{value}</p>
    </div>
  );
}
