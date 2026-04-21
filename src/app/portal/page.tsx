import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Bell, Zap, CheckCircle2, XCircle } from "lucide-react";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, ORDER_TYPE_LABEL } from "@/lib/constants";

export default async function PortalPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const t = await getTranslations("portal");
  const locale = await getLocale();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;

  const [proposalSentOrders, recentOrders, proposalSentCount, inProductionCount, completedCount, rejectedCount] = await Promise.all([
    db.order.findMany({
      where: { client: { email: session.user.email }, status: "PROPOSAL_SENT" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, type: true, estimatedValue: true },
    }),
    db.order.findMany({
      where: { client: { email: session.user.email }, status: { notIn: ["DRAFT"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, type: true, status: true, createdAt: true, orderRef: true },
    }),
    db.order.count({ where: { client: { email: session.user.email }, status: "PROPOSAL_SENT" } }),
    db.order.count({ where: { client: { email: session.user.email }, status: "IN_PRODUCTION" } }),
    db.order.count({ where: { client: { email: session.user.email }, status: "COMPLETED" } }),
    db.order.count({ where: { client: { email: session.user.email }, status: "REJECTED" } }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">

      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-widest text-accent-light">{t("tagline")}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">{t("heading")}</h1>
          <p className="mt-1 text-sm font-semibold text-white">{session.user.name ?? session.user.email}</p>
        </div>
        <Link
          href="/portal/orders/new"
          className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
        >
          + Novo pedido
        </Link>
      </div>

      {/* Cards de estado */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
            <Bell size={15} className="text-amber-300" />
          </div>
          <p className="text-2xl font-bold text-white">{proposalSentCount}</p>
          <p className="mt-0.5 text-xs text-slate-400">Aguardam resposta</p>
        </div>
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15">
            <Zap size={15} className="text-violet-300" />
          </div>
          <p className="text-2xl font-bold text-white">{inProductionCount}</p>
          <p className="mt-0.5 text-xs text-slate-400">Em produção</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
            <CheckCircle2 size={15} className="text-emerald-300" />
          </div>
          <p className="text-2xl font-bold text-white">{completedCount}</p>
          <p className="mt-0.5 text-xs text-slate-400">Concluídos</p>
        </div>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15">
            <XCircle size={15} className="text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white">{rejectedCount}</p>
          <p className="mt-0.5 text-xs text-slate-400">Recusados</p>
        </div>
      </div>

      {/* Requer atenção — apenas PROPOSAL_SENT */}
      {proposalSentOrders.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-amber-300">Aguardam a sua resposta</p>
            <Link href="/portal/orders" className="text-xs text-accent hover:text-accent-light">
              Ver todos →
            </Link>
          </div>
          <div className="grid gap-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {proposalSentOrders.map((o: any) => (
              <Link
                key={o.id}
                href={`/portal/orders/${o.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 hover:bg-white/8 transition"
              >
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate">{o.title ?? (ORDER_TYPE_LABEL[o.type] ?? o.type)}</p>
                  {o.estimatedValue != null && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {Number(o.estimatedValue).toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
                    </p>
                  )}
                </div>
                <span className="ml-3 shrink-0 rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                  Proposta enviada
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos recentes */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">Pedidos recentes</h2>
        <Link href="/portal/orders" className="text-xs text-accent hover:text-accent-light transition-colors">
          Ver todos →
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
          <p className="text-slate-400">Ainda não tem pedidos.</p>
          <div className="mt-4 flex justify-center">
            <Link
              href="/portal/orders/new"
              className="inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
            >
              Submeter primeiro pedido
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {recentOrders.map((o: any) => (
            <Link
              key={o.id}
              href={`/portal/orders/${o.id}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/8 transition"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{o.title ?? (ORDER_TYPE_LABEL[o.type] ?? o.type)}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(o.createdAt).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })}
                  {o.orderRef && <span className="ml-2 font-mono">{o.orderRef}</span>}
                </p>
              </div>
              <span className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[o.status] ?? "bg-slate-500/20 text-slate-300"}`}>
                {ORDER_STATUS_LABEL[o.status] ?? o.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
