import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProposalActions from "./ProposalActions";
import ProposalComments from "./ProposalComments";
import { getTranslations, getLocale } from "next-intl/server";
import { formatCurrencyRangeByLocale } from "@/lib/currency";

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function ProposalPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  // Verificar que o briefing pertence ao utilizador
  const briefing = await prisma.briefing.findFirst({
    where: { id, user: { email: session.user.email } },
    select: { id: true, projectType: true },
  });

  if (!briefing) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proposal = await (prisma as any).proposal.findUnique({
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
    createdAt: Date;
  } | null;

  if (!proposal || proposal.status === "DRAFT") {
    const t = await getTranslations("briefing");
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="mb-8 flex items-center gap-3 text-sm text-slate-400">
          <Link href="/portal" className="hover:text-white transition">{t("navPortal")}</Link>
          <span>/</span>
          <Link href={`/portal/briefing/${id}`} className="hover:text-white transition">{t("navBriefing")}</Link>
          <span>/</span>
          <span className="text-white">{t("navProposal")}</span>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-10 text-center">
          <p className="text-slate-400">
            {t("proposalNotAvailable")}
          </p>
          <Link
            href={`/portal/briefing/${id}`}
            className="mt-6 inline-flex rounded-xl border border-white/20 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/10 transition"
          >
            {t("backToBriefing")}
          </Link>
        </div>
      </main>
    );
  }

  const isApproved   = proposal.status === "APPROVED";
  const isRevision   = proposal.status === "REVISION";
  const canAct       = proposal.status === "SENT";

  const t = await getTranslations("briefing");
  const locale = await getLocale();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-3 text-sm text-slate-400">
        <Link href="/portal" className="hover:text-white transition">{t("navPortal")}</Link>
        <span>/</span>
        <Link href={`/portal/briefing/${id}`} className="hover:text-white transition">
          {briefing.projectType}
        </Link>
        <span>/</span>
        <span className="text-white">{t("navProposal")}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">{t("proposalTitle")}</h1>
          <span className="text-xs text-slate-500">v{proposal.version}</span>
        </div>
        {isApproved && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          {t("proposalApproved")}
          </div>
        )}
        {isRevision && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm text-orange-300">
            {t("proposalRevision")}
            {proposal.clientNote && (
              <p className="mt-1 text-xs text-orange-200/70">{t("proposalRevisionNote")} &ldquo;{proposal.clientNote}&rdquo;</p>
            )}
          </div>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{t("fieldHours")}</p>
          <p className="text-2xl font-bold text-white">{proposal.hoursTotal}h</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{t("fieldInvestment")}</p>
          <p className="text-lg font-bold text-white">
            {formatCurrencyRangeByLocale(proposal.costMin, proposal.costMax, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{t("fieldDate")}</p>
          <p className="text-sm text-white">
            {new Date(proposal.createdAt).toLocaleDateString(locale, { day: "2-digit", month: "long" })}
          </p>
        </div>
      </div>

      {/* Sumário */}
      <div className="mb-8 rounded-2xl border border-white/15 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">{t("fieldSummary")}</p>
        <p className="text-slate-200 leading-relaxed">{proposal.summary}</p>
      </div>

      {/* Conteúdo completo */}
      <div className="mb-8 rounded-2xl border border-white/15 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">{t("fieldFullProposal")}</p>
        <div className="prose prose-invert prose-sm max-w-none">
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
            {proposal.content}
          </pre>
        </div>
      </div>

      {/* Ações (apenas quando status=SENT) */}
      {canAct && (
        <ProposalActions proposalId={proposal.id} briefingId={id} />
      )}

      {/* Comentários */}
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/3 p-6">
        <ProposalComments proposalId={proposal.id} />
      </div>
    </main>
  );
}
