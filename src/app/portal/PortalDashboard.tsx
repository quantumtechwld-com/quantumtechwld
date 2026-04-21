"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Zap, Eye, CheckCircle2, XCircle, X } from "lucide-react";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, ORDER_TYPE_LABEL } from "@/lib/constants";

type OrderRow = {
  id: string;
  title: string | null;
  type: string;
  status: string;
  createdAt: string;
  orderRef: string | null;
  estimatedValue: number | null;
};

type Counts = {
  proposalSent: number;
  inProduction: number;
  inReview: number;
  completed: number;
  rejected: number;
};

type FilterType = "PROPOSAL_SENT" | "IN_PRODUCTION" | "IN_REVIEW" | "COMPLETED" | "REJECTED" | null;

type Props = Readonly<{
  tagline: string;
  heading: string;
  userName: string | null | undefined;
  userEmail: string;
  locale: string;
  allOrders: OrderRow[];
  counts: Counts;
}>;

const FILTER_LABEL: Record<string, string> = {
  PROPOSAL_SENT: "Aguardam resposta",
  IN_PRODUCTION: "Em produção",
  IN_REVIEW:     "Em revisão",
  COMPLETED:     "Concluídos",
  REJECTED:      "Recusados",
};

export function PortalDashboard({ tagline, heading, userName, userEmail, locale, allOrders, counts }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);

  function toggleFilter(f: FilterType) {
    setActiveFilter(prev => (prev === f ? null : f));
  }

  const proposalSentOrders = allOrders.filter(o => o.status === "PROPOSAL_SENT").slice(0, 3);
  const inReviewOrders     = allOrders.filter(o => o.status === "IN_REVIEW").slice(0, 3);
  const displayedOrders    = activeFilter
    ? allOrders.filter(o => o.status === activeFilter)
    : allOrders.slice(0, 5);

  const cardBase = "cursor-pointer rounded-2xl border p-4 text-left transition-all";

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">

      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-widest text-accent-light">{tagline}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">{heading}</h1>
          <p className="mt-1 text-sm font-semibold text-white">{userName ?? userEmail}</p>
        </div>
        <Link
          href="/portal/orders/new"
          className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
        >
          + Novo pedido
        </Link>
      </div>

      {/* Cards clicáveis */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <button
          type="button"
          onClick={() => toggleFilter("PROPOSAL_SENT")}
          className={`${cardBase} border-amber-500/30 ${activeFilter === "PROPOSAL_SENT" ? "bg-amber-500/15 ring-2 ring-amber-500/50" : "bg-amber-500/5 hover:bg-amber-500/10"}`}
        >
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
            <Bell size={15} className="text-amber-300" />
          </div>
          <p className="text-2xl font-bold text-white">{counts.proposalSent}</p>
          <p className="mt-0.5 text-xs text-slate-400">Aguardam resposta</p>
        </button>

        <button
          type="button"
          onClick={() => toggleFilter("IN_PRODUCTION")}
          className={`${cardBase} border-violet-500/30 ${activeFilter === "IN_PRODUCTION" ? "bg-violet-500/15 ring-2 ring-violet-500/50" : "bg-violet-500/5 hover:bg-violet-500/10"}`}
        >
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15">
            <Zap size={15} className="text-violet-300" />
          </div>
          <p className="text-2xl font-bold text-white">{counts.inProduction}</p>
          <p className="mt-0.5 text-xs text-slate-400">Em produção</p>
        </button>

        <button
          type="button"
          onClick={() => toggleFilter("IN_REVIEW")}
          className={`${cardBase} border-sky-500/30 ${activeFilter === "IN_REVIEW" ? "bg-sky-500/15 ring-2 ring-sky-500/50" : "bg-sky-500/5 hover:bg-sky-500/10"}`}
        >
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15">
            <Eye size={15} className="text-sky-300" />
          </div>
          <p className="text-2xl font-bold text-white">{counts.inReview}</p>
          <p className="mt-0.5 text-xs text-slate-400">Em revisão</p>
        </button>

        <button
          type="button"
          onClick={() => toggleFilter("COMPLETED")}
          className={`${cardBase} border-emerald-500/30 ${activeFilter === "COMPLETED" ? "bg-emerald-500/15 ring-2 ring-emerald-500/50" : "bg-emerald-500/5 hover:bg-emerald-500/10"}`}
        >
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
            <CheckCircle2 size={15} className="text-emerald-300" />
          </div>
          <p className="text-2xl font-bold text-white">{counts.completed}</p>
          <p className="mt-0.5 text-xs text-slate-400">Concluídos</p>
        </button>

        <button
          type="button"
          onClick={() => toggleFilter("REJECTED")}
          className={`${cardBase} border-red-500/30 ${activeFilter === "REJECTED" ? "bg-red-500/15 ring-2 ring-red-500/50" : "bg-red-500/5 hover:bg-red-500/10"}`}
        >
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15">
            <XCircle size={15} className="text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white">{counts.rejected}</p>
          <p className="mt-0.5 text-xs text-slate-400">Recusados</p>
        </button>
      </div>

      {/* Painel sky — pedidos em revisão pelo cliente */}
      {!activeFilter && inReviewOrders.length > 0 && (
        <div className="mb-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-sky-300">A aguardar a sua revisão</p>
            <Link href="/portal/orders" className="text-xs text-accent hover:text-accent-light">
              Ver todos →
            </Link>
          </div>
          <div className="grid gap-2">
            {inReviewOrders.map((o) => (
              <Link
                key={o.id}
                href={`/portal/orders/${o.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 hover:bg-white/8 transition"
              >
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate">{o.title ?? (ORDER_TYPE_LABEL[o.type] ?? o.type)}</p>
                </div>
                <span className="ml-3 shrink-0 rounded-full border border-sky-500/30 bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-sky-300">
                  Em revisão
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Painel amber — apenas quando sem filtro ativo */}
      {!activeFilter && proposalSentOrders.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-amber-300">Aguardam a sua resposta</p>
            <Link href="/portal/orders" className="text-xs text-accent hover:text-accent-light">
              Ver todos →
            </Link>
          </div>
          <div className="grid gap-2">
            {proposalSentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/portal/orders/${o.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 hover:bg-white/8 transition"
              >
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate">{o.title ?? (ORDER_TYPE_LABEL[o.type] ?? o.type)}</p>
                  {o.estimatedValue != null && o.estimatedValue > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {o.estimatedValue.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
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

      {/* Lista de pedidos */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
          {activeFilter ? FILTER_LABEL[activeFilter] : "Pedidos recentes"}
        </h2>
        {activeFilter ? (
          <button
            type="button"
            onClick={() => setActiveFilter(null)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
          >
            <X size={12} />
            Limpar filtro
          </button>
        ) : (
          <Link href="/portal/orders" className="text-xs text-accent hover:text-accent-light transition-colors">
            Ver todos →
          </Link>
        )}
      </div>

      {displayedOrders.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-center">
          <p className="text-sm text-slate-400">
            {activeFilter
              ? `Sem pedidos com estado "${FILTER_LABEL[activeFilter]}".`
              : "Ainda não tem pedidos."}
          </p>
          {!activeFilter && (
            <div className="mt-4 flex justify-center">
              <Link
                href="/portal/orders/new"
                className="inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
              >
                Submeter primeiro pedido
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {displayedOrders.map((o) => (
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
