"use client";

import { useState } from "react";
import type { GeneratedScope, ScopeFeature, UserStory } from "@/app/api/briefing/scope/route";

type Props = Readonly<{
  briefingId: string;
  initialScope: GeneratedScope | null;
}>;

const PRIORITY_COLOR: Record<string, string> = {
  high:   "border-red-400/30 bg-red-500/10 text-red-300",
  medium: "border-yellow-400/30 bg-yellow-500/10 text-yellow-300",
  low:    "border-slate-400/30 bg-slate-500/10 text-slate-400",
};

const AREA_COLOR: Record<string, string> = {
  frontend:  "bg-sky-500/15 text-sky-300",
  backend:   "bg-violet-500/15 text-violet-300",
  fullstack: "bg-indigo-500/15 text-indigo-300",
  infra:     "bg-orange-500/15 text-orange-300",
  design:    "bg-pink-500/15 text-pink-300",
};

export default function ScopeView({ briefingId, initialScope }: Props) {
  const [scope, setScope] = useState<GeneratedScope | null>(initialScope);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      <div className="rounded-xl border border-white/8 bg-white/3 p-10 text-center space-y-4">
        <p className="text-white/40">Nenhum escopo gerado para este briefing.</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={() => generate(false)}
          disabled={loading}
          className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
        >
          {loading ? "A gerar escopo…" : "Gerar escopo com IA"}
        </button>
      </div>
    );
  }

  const features = scope.features as ScopeFeature[];
  const userStories = scope.userStories as UserStory[];
  const totalHigh   = features.filter((f) => f.priority === "high").length;
  const totalMedium = features.filter((f) => f.priority === "medium").length;
  const totalLow    = features.filter((f) => f.priority === "low").length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Horas estimadas</p>
          <p className="text-3xl font-bold text-white">{scope.hoursEstimate}h</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Custo estimado</p>
          <p className="text-2xl font-bold text-white">
            €{scope.costMin.toLocaleString("pt-PT")}–{scope.costMax.toLocaleString("pt-PT")}
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Funcionalidades</p>
          <p className="text-3xl font-bold text-white">{features.length}</p>
          <p className="text-xs text-white/30 mt-1">
            {totalHigh} alta · {totalMedium} média · {totalLow} baixa
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Confiança</p>
          <p className="text-3xl font-bold text-white">{scope.confidence}%</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
            <div className="h-1.5 rounded-full bg-sky-500" style={{ width: `${scope.confidence}%` }} />
          </div>
        </div>
      </div>

      {/* Funcionalidades */}
      <div>
        <h3 className="text-base font-semibold text-white mb-4">Funcionalidades</h3>
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
                  <span className="text-white/40">{f.estimatedHours}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Stories */}
      <div>
        <h3 className="text-base font-semibold text-white mb-4">User Stories</h3>
        <div className="space-y-2">
          {userStories.map((s) => (
            <div
              key={`${s.role}-${s.action}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60"
            >
              <span className="text-white/30">Como </span>
              <span className="text-sky-300">{s.role}</span>
              <span className="text-white/30">, quero </span>
              <span className="text-white">{s.action}</span>
              <span className="text-white/30">, para </span>
              <span className="text-white/60">{s.goal}</span>
              <span className="text-white/30">.</span>
            </div>
          ))}
        </div>
      </div>

      {/* Telas + Integrações + Stack */}
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <h3 className="text-sm uppercase tracking-widest text-white/40 mb-3">Telas</h3>
          <ul className="space-y-1.5">
            {(scope.screens as string[]).map((s) => (
              <li key={s} className="text-sm text-white/70 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm uppercase tracking-widest text-white/40 mb-3">Integrações</h3>
          <ul className="space-y-1.5">
            {(scope.integrations as string[]).map((s) => (
              <li key={s} className="text-sm text-white/70 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm uppercase tracking-widest text-white/40 mb-3">Stack recomendada</h3>
          <div className="flex flex-wrap gap-1.5">
            {(scope.techRecommended as string[]).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/60"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Regenerate */}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-3 pt-2 justify-end">
        <button
          type="button"
          onClick={() => generate(true)}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/60 transition hover:text-white hover:bg-white/10 disabled:opacity-50"
        >
          {loading ? "A regenerar…" : "↺ Regenerar Escopo"}
        </button>
      </div>
    </div>
  );
}
