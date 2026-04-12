import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { getTranslations, getLocale } from "next-intl/server";

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

  const [briefings, pendingOrders] = await Promise.all([
    prisma.briefing.findMany({
      where: { user: { email: session.user.email } },
      orderBy: { createdAt: "desc" },
    }),
    db.order.findMany({
      where: {
        client: { email: session.user.email },
        status: { in: ["PENDING", "PROPOSAL_SENT", "IN_PRODUCTION"] },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-widest text-accent-light">{t("tagline")}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">{t("heading")}</h1>
          <p className="mt-1 truncate text-sm text-slate-400">{session.user.email}</p>
        </div>
        <div className="-mx-1 overflow-x-auto pb-1 sm:mx-0 sm:overflow-visible sm:pb-0">
          <div className="flex min-w-max items-center gap-2 px-1 sm:min-w-0 sm:flex-wrap sm:justify-end sm:px-0">
            <Link
              href="/portal/orders"
              className="whitespace-nowrap rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              {t("navOrders")}
            </Link>
            <Link
              href="/portal/biblioteca"
              className="whitespace-nowrap rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              {t("navLibrary")}
            </Link>
            <Link
              href="/portal/guide"
              className="whitespace-nowrap rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              {t("navGuide")}
            </Link>
            <Link
              href="/portal/profile"
              className="whitespace-nowrap rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              {t("navProfile")}
            </Link>
            <SignOutButton className="whitespace-nowrap rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10" label={t("profileSignOut")} />
          </div>
        </div>
      </div>

      {/* Alertas de pedidos activos */}
      {pendingOrders.length > 0 && (
        <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/5 p-4">
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

      {briefings.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
          <p className="text-slate-400">{t("emptyState")}</p>
          <Link
            href="/#lead"
            className="mt-4 inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
          >
            {t("submitBriefing")}
          </Link>
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
    </main>
  );
}
