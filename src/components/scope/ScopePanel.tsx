"use client";

import { useState } from "react";
import type { GeneratedScope } from "@/app/api/briefing/scope/route";

type Variant = "portal" | "admin";

type Props = Readonly<{
  briefingId: string;
  initialScope: GeneratedScope | null;
  variant: Variant;
}>;

const PRIORITY_COLOR: Record<string, string> = {
  high:   "border-red-400/30 bg-red-500/10 text-red-300",
  medium: "border-yellow-400/30 bg-yellow-500/10 text-yellow-300",
  low:    "border-slate-400/30 bg-slate-500/10 text-slate-400",
};

const AREA_COLOR: Record<string, string> = {
  frontend:  "bg-accent/15 text-accent-light",
  backend:   "bg-violet-500/15 text-violet-300",
  fullstack: "bg-indigo-500/15 text-indigo-300",
  infra:     "bg-orange-500/15 text-orange-300",
  design:    "bg-pink-500/15 text-pink-300",
};

const V = {
  portal: {
    card: "rounded-2xl border border-white/15 bg-white/5",
    label: "text-slate-500",
    text: "text-slate-300",
    muted: "text-slate-400",
    storyText: "text-slate-300",
    storyMuted: "text-slate-500",
    hoursText: "text-slate-400",
    tagText: "text-slate-300",
    costCls: "text-3xl",
    emptyText: "Nenhum escopo gerado ainda. O Cérebro de Arquitetura irá analisar o briefing e gerar funcionalidades, user stories, telas e estimativa de custo.",
    emptyCls: "rounded-2xl border border-white/15 bg-white/5 p-10 text-center",
    emptyP: "text-slate-400 mb-6",
    loadingText: "Gerando escopo…",
    regenText: "Regenerar escopo",
    regenLoading: "Regenerando…",
    regenCls: "rounded-xl border border-white/20 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-50",
    footerCls: "flex gap-3 pt-2",
  },
  admin: {
    card: "rounded-xl border border-white/8 bg-white/3",
    label: "text-white/40",
    text: "text-white/70",
    muted: "text-white/40",
    storyText: "text-white/60",
    storyMuted: "text-white/30",
    hoursText: "text-white/40",
    tagText: "text-white/60",
    costCls: "text-2xl",
    emptyText: "Nenhum escopo gerado para este briefing.",
    emptyCls: "rounded-xl border border-white/8 bg-white/3 p-10 text-center space-y-4",
    emptyP: "text-white/40",
    loadingText: "A gerar escopo…",
    regenText: "↺ Regenerar Escopo",
    regenLoading: "A regenerar…",
    regenCls: "rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/60 transition hover:text-white hover:bg-white/10 disabled:opacity-50",
    footerCls: "flex gap-3 pt-2 justify-end",
  },
} as const;

export default function ScopePanel({ briefingId, initialScope, variant }: Props) {
  const [scope, setScope] = useState<GeneratedScope | null>(initialScope);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const v = V[variant];

  async function generate(regenerate = false) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/briefing/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefingId, regenerate }),
      });
      const data = (await res.json()) as { scope?: GeneratedScope; error?: string };
      if (!res.ok) { setError(data.error ?? "Erro ao gerar escopo."); return; }
      setScope(data.scope ?? null);
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!scope) {
    return (
      <div className={v.emptyCls}>
        <p className={v.emptyP}>{v.emptyText}</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={() => generate(false)}
          disabled={loading}
          className="rounded-xl bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-light disabled:opacity-50"
        >
          {loading ? v.loadingText : "Gerar escopo com IA"}
        </button>
      </div>
    );
  }

  const features = scope.features;
  const userStories = scope.userStories;
  const totalHigh   = features.filter((f) => f.priority === "high").length;
  const totalMedium = features.filter((f) => f.priority === "medium").length;
  const totalLow    = features.filter((f) => f.priority === "low").length;
  const Heading = variant === "portal" ? "h2" : "h3";
  const headingCls = variant === "portal" ? "text-lg font-semibold text-white mb-4" : "text-base font-semibold text-white mb-4";

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={`${v.card} p-5`}>
          <p className={`text-xs uppercase tracking-widest ${v.label} mb-1`}>Horas estimadas</p>
          <p className="text-3xl font-bold text-white">{scope.hoursEstimate}h</p>
        </div>
        <div className={`${v.card} p-5`}>
          <p className={`text-xs uppercase tracking-widest ${v.label} mb-1`}>Custo estimado</p>
          <p className={`${v.costCls} font-bold text-white`}>
            €{scope.costMin.toLocaleString("pt-PT")}–{scope.costMax.toLocaleString("pt-PT")}
          </p>
        </div>
        <div className={`${v.card} p-5`}>
          <p className={`text-xs uppercase tracking-widest ${v.label} mb-1`}>Funcionalidades</p>
          <p className="text-3xl font-bold text-white">{features.length}</p>
          <p className={`text-xs ${v.label} mt-1`}>
            {totalHigh} alta · {totalMedium} média · {totalLow} baixa
          </p>
        </div>
        <div className={`${v.card} p-5`}>
          <p className={`text-xs uppercase tracking-widest ${v.label} mb-1`}>Confiança</p>
          <p className="text-3xl font-bold text-white">{scope.confidence}%</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
            <div className="h-1.5 rounded-full bg-accent" style={{ width: `${scope.confidence}%` }} />
          </div>
        </div>
      </div>

      {/* Funcionalidades */}
      <div>
        <Heading className={headingCls}>Funcionalidades</Heading>
        <div className="space-y-2">
          {features.map((f) => (
            <div
              key={f.name}
              className={`rounded-xl border p-4 ${PRIORITY_COLOR[f.priority] ?? "border-white/10 bg-white/5 text-white"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-white">{f.name}</p>
                  <p className="mt-0.5 text-sm opacity-80">{f.description}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs">
                  <span className={`rounded-full px-2.5 py-0.5 ${AREA_COLOR[f.area] ?? "bg-white/10 text-slate-300"}`}>
                    {f.area}
                  </span>
                  <span className={v.hoursText}>{f.estimatedHours}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Stories */}
      <div>
        <Heading className={headingCls}>User Stories</Heading>
        <div className="space-y-2">
          {userStories.map((s) => (
            <div
              key={`${s.role}-${s.action}`}
              className={`rounded-xl border border-white/10 bg-white/5 p-4 text-sm ${v.storyText}`}
            >
              <span className={v.storyMuted}>Como </span>
              <span className="text-accent-light">{s.role}</span>
              <span className={v.storyMuted}>, quero </span>
              <span className="text-white">{s.action}</span>
              <span className={v.storyMuted}>, para </span>
              <span className={v.storyText}>{s.goal}</span>
              <span className={v.storyMuted}>.</span>
            </div>
          ))}
        </div>
      </div>

      {/* Telas + Integrações + Stack */}
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <Heading className={`text-sm uppercase tracking-widest ${v.muted} mb-3`}>Telas</Heading>
          <ul className="space-y-1.5">
            {scope.screens.map((s) => (
              <li key={s} className={`text-sm ${v.text} flex items-center gap-2`}>
                <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Heading className={`text-sm uppercase tracking-widest ${v.muted} mb-3`}>Integrações</Heading>
          <ul className="space-y-1.5">
            {scope.integrations.map((s) => (
              <li key={s} className={`text-sm ${v.text} flex items-center gap-2`}>
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Heading className={`text-sm uppercase tracking-widest ${v.muted} mb-3`}>Stack recomendada</Heading>
          <div className="flex flex-wrap gap-1.5">
            {scope.techRecommended.map((t) => (
              <span
                key={t}
                className={`rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs ${v.tagText}`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ações */}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className={v.footerCls}>
        <button
          type="button"
          onClick={() => generate(true)}
          disabled={loading}
          className={v.regenCls}
        >
          {loading ? v.regenLoading : v.regenText}
        </button>
      </div>
    </div>
  );
}
