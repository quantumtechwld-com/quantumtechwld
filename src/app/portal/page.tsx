import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { FileText, Clock, CheckCircle2 } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  RECEIVED:        "bg-slate-500/30 text-slate-200",
  IN_ANALYSIS:     "bg-yellow-500/20 text-yellow-300",
  PROPOSAL_SENT:   "bg-blue-500/20 text-blue-300",
  IN_NEGOTIATION:  "bg-purple-500/20 text-purple-300",
  APPROVED:        "bg-emerald-500/20 text-emerald-300",
  IN_PROGRESS:     "bg-accent/20 text-accent-light",
  DELIVERED:       "bg-green-500/20 text-green-300",
};

export default async function PortalPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const t = await getTranslations("portal");
  const locale = await getLocale();

  const STATUS_LABEL: Record<string, string> = {
    RECEIVED:        t("statusReceived"),
    IN_ANALYSIS:     t("statusInAnalysis"),
    PROPOSAL_SENT:   t("statusProposalSent"),
    IN_NEGOTIATION:  t("statusInNegotiation"),
    APPROVED:        t("statusApproved"),
    IN_PROGRESS:     t("statusInProgress"),
    DELIVERED:       t("statusDelivered"),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;

  const [briefings, pendingOrders, briefingCount, activeOrderCount, completedOrderCount] = await Promise.all([
    prisma.briefing.findMany({
      where: { user: { email: session.user.email } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id:              true,
        projectType:     true,
        painPoints:      true,
        status:          true,
        budget:          true,
        timeline:        true,
        complexityScore: true,
        hoursMin:        true,
        hoursMax:        true,
        features:        true,
        createdAt:       true,
      },
    }),
    db.order.findMany({
      where: {
        client: { email: session.user.email },
        status: { in: ["PENDING", "PROPOSAL_SENT", "IN_PRODUCTION"] },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.briefing.count({ where: { user: { email: session.user.email } } }),
    db.order.count({
      where: {
        client: { email: session.user.email },
        status: { in: ["PENDING", "EVALUATING", "PROPOSAL_SENT", "APPROVED", "REVISION", "IN_PRODUCTION"] },
      },
    }),
    db.order.count({ where: { client: { email: session.user.email }, status: "COMPLETED" } }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">

      {/* Cabeçalho */}
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-accent-light">{t("tagline")}</p>
        <h1 className="mt-1 text-3xl font-bold text-white">{t("heading")}</h1>
        <p className="mt-1 text-sm font-semibold text-white">{session.user.name ?? session.user.email}</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
            <FileText size={15} className="text-accent-light" />
          </div>
          <p className="text-2xl font-bold text-white">{briefingCount}</p>
          <p className="mt-0.5 text-xs text-slate-400">Briefings</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
            <Clock size={15} className="text-amber-300" />
          </div>
          <p className="text-2xl font-bold text-white">{activeOrderCount}</p>
          <p className="mt-0.5 text-xs text-slate-400">Pedidos ativos</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
            <CheckCircle2 size={15} className="text-emerald-300" />
          </div>
          <p className="text-2xl font-bold text-white">{completedOrderCount}</p>
          <p className="mt-0.5 text-xs text-slate-400">Concluídos</p>
        </div>
      </div>

      {/* Alertas de pedidos activos */}
      {pendingOrders.length > 0 && (
        <div className="mb-8 rounded-2xl border border-accent/30 bg-accent/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-accent-light">{t("pendingTitle")}</p>
            <Link href="/portal/orders" className="text-xs text-accent hover:text-accent-light">
              {t("pendingViewAll")}
            </Link>
          </div>
          <div className="grid gap-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {pendingOrders.map((o: any) => {
              const alertColor: Record<string, string> = {
                PROPOSAL_SENT: "bg-accent/20 text-accent-light border border-accent/30",
                IN_PRODUCTION: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
              };
              const alertLabel: Record<string, string> = {
                PROPOSAL_SENT: t("alertProposalSent"),
                IN_PRODUCTION: t("alertInProduction"),
              };
              const colorClass = alertColor[o.status] ?? "bg-blue-500/20 text-blue-300 border border-blue-500/30";
              const labelText  = alertLabel[o.status]  ?? t("alertPending");
              return (
                <Link
                  key={o.id}
                  href={`/portal/orders/${o.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/8 transition"
                >
                  <span className="text-slate-300 truncate">{o.description.slice(0, 60)}{o.description.length > 60 ? "…" : ""}</span>
                  <span className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                    {labelText}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Briefings recentes */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">Briefings recentes</h2>
        <Link href="/portal/orders" className="text-xs text-accent hover:text-accent-light transition-colors">
          Ver pedidos →
        </Link>
      </div>

      {briefings.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
          <p className="text-slate-400">{t("emptyState")}</p>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/portal/orders/new"
              className="inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
            >
              {t("submitBriefing")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {briefings.map((b: (typeof briefings)[number]) => (
            <div
              key={b.id}
              className="rounded-2xl border border-white/15 bg-white/5 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{b.projectType}</p>
                  <p className="mt-1 text-sm text-slate-400 line-clamp-2">{b.painPoints}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[b.status] ?? "bg-slate-500/30 text-slate-200"}`}
                >
                  {STATUS_LABEL[b.status] ?? b.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-400">
                <div>
                  <p className="text-slate-500 uppercase tracking-wider mb-0.5">{t("fieldBudget")}</p>
                  <p className="text-white">{b.budget}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wider mb-0.5">{t("fieldTimeline")}</p>
                  <p className="text-white">{b.timeline}</p>
                </div>
                {b.complexityScore && (
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider mb-0.5">{t("fieldComplexity")}</p>
                    <p className="text-white">{b.complexityScore}/10 · {b.hoursMin}–{b.hoursMax}h</p>
                  </div>
                )}
              </div>

              {b.features.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {b.features.map((f: string) => (
                    <span
                      key={f}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  {t("submittedOn")}{" "}
                  {new Date(b.createdAt).toLocaleDateString(locale, {
                    day: "2-digit", month: "long", year: "numeric",
                  })}
                </p>
                <Link
                  href={`/portal/briefing/${b.id}`}
                  className="rounded-xl bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent-light transition hover:bg-accent/25"
                >
                  {t("viewScope")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA novo projeto */}
      {briefingCount > 0 && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/3 p-5">
          <div>
            <p className="text-sm font-medium text-white">Novo projeto?</p>
            <p className="mt-0.5 text-xs text-slate-400">Envie um pedido diretamente pelo portal.</p>
          </div>
          <Link
            href="/portal/orders/new"
            className="shrink-0 rounded-xl border border-accent/30 bg-accent/15 px-4 py-2 text-sm font-medium text-accent-light transition hover:bg-accent/25"
          >
            Submeter →
          </Link>
        </div>
      )}
    </main>
  );
}
