"use client";

import { useState } from "react";

const PROJECT_TYPES = ["website", "webapp", "mobile", "ecommerce", "automation", "system"];

const BUDGET_RANGES = [
  "Até €3.000",
  "€3.000 – €8.000",
  "€8.000 – €20.000",
  "Acima de €20.000",
];

const COMMON_FEATURES = [
  "Autenticação de usuários",
  "Painel administrativo",
  "Pagamentos online",
  "E-mails automáticos",
  "Dashboard com gráficos",
  "API para integrações",
  "Chat / Suporte",
  "Blog / CMS",
  "Multi-idioma",
  "Notificações push",
  "Relatórios exportáveis",
  "Integração com ERP/CRM",
];

const COMMON_TECH = [
  "Next.js", "React", "Vue", "Angular", "Laravel", "WordPress",
  "Node.js", "PostgreSQL", "MySQL", "MongoDB", "Redis", "AWS",
  "Tailwind CSS", "TypeScript", "Python", "Stripe",
];

type Status = "idle" | "loading" | "success" | "error";

export default function AddToLibraryForm({ deliveredBriefings }: Readonly<{
  deliveredBriefings: { id: string; projectType: string; createdAt: Date }[];
}>) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [features, setFeatures] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [complexityScore, setComplexityScore] = useState(5);
  const [hoursActual, setHoursActual] = useState(80);
  const [budgetRange, setBudgetRange] = useState(BUDGET_RANGES[0]);
  const [briefingId, setBriefingId] = useState("");

  // Tags custom (tech stack)
  const [customTech, setCustomTech] = useState("");

  function toggleFeature(f: string) {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  function toggleTech(t: string) {
    setTechStack((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function removeTechItem(t: string) {
    setTechStack((prev) => prev.filter((x) => x !== t));
  }

  function handleFeatureClick(e: React.MouseEvent<HTMLButtonElement>) {
    const f = e.currentTarget.dataset.feature;
    if (f) toggleFeature(f);
  }

  function handleTechToggle(e: React.MouseEvent<HTMLButtonElement>) {
    const t = e.currentTarget.dataset.tech;
    if (t) toggleTech(t);
  }

  function handleTechRemove(e: React.MouseEvent<HTMLButtonElement>) {
    const t = e.currentTarget.dataset.tech;
    if (t) removeTechItem(t);
  }

  function handleTechKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTech();
    }
  }

  function addCustomTech() {
    const t = customTech.trim();
    if (t && !techStack.includes(t)) {
      setTechStack((prev) => [...prev, t]);
    }
    setCustomTech("");
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title || !description || techStack.length === 0) {
      setErrorMsg("Preencha título, descrição e pelo menos uma tecnologia.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/library/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          projectType,
          features,
          techStack,
          complexityScore,
          hoursActual,
          budgetRange,
          briefingId: briefingId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? `Erro ${res.status}`);
      }

      setStatus("success");
      // Reset
      setTitle("");
      setDescription("");
      setFeatures([]);
      setTechStack([]);
      setComplexityScore(5);
      setHoursActual(80);
      setBudgetRange(BUDGET_RANGES[0]);
      setBriefingId("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Título */}
      <div>
        <label htmlFor="lib-title" className="block text-xs uppercase tracking-widest text-slate-400 mb-1.5">
          Título do projeto *
        </label>
        <input
          id="lib-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Plataforma de gestão de frotas"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="lib-desc" className="block text-xs uppercase tracking-widest text-slate-400 mb-1.5">
          Descrição (o que foi construído) *
        </label>
        <textarea
          id="lib-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Descreva o projeto, o problema resolvido e as principais funcionalidades entregues..."
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
        />
      </div>

      {/* Tipo + Orçamento real */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="lib-type" className="block text-xs uppercase tracking-widest text-slate-400 mb-1.5">
            Tipo de projeto
          </label>
          <select
            id="lib-type"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-slate-800 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="lib-budget" className="block text-xs uppercase tracking-widest text-slate-400 mb-1.5">
            Faixa de orçamento
          </label>
          <select
            id="lib-budget"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-slate-800 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Complexidade + Horas reais */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="lib-complexity" className="block text-xs uppercase tracking-widest text-slate-400 mb-1.5">
            Complexidade real (1–10): <span className="text-white font-semibold">{complexityScore}</span>
          </label>
          <input
            id="lib-complexity"
            type="range"
            min={1}
            max={10}
            value={complexityScore}
            onChange={(e) => setComplexityScore(Number(e.target.value))}
            className="w-full accent-sky-500"
          />
        </div>

        <div>
          <label htmlFor="lib-hours" className="block text-xs uppercase tracking-widest text-slate-400 mb-1.5">
            Horas reais gastas
          </label>
          <input
            id="lib-hours"
            type="number"
            min={1}
            value={hoursActual}
            onChange={(e) => setHoursActual(Number(e.target.value))}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Funcionalidades */}
      <div>
        <p className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
          Funcionalidades entregues
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_FEATURES.map((f) => (
            <button
              key={f}
              type="button"
              data-feature={f}
              onClick={handleFeatureClick}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                features.includes(f)
                  ? "border-sky-400 bg-sky-500/20 text-sky-300"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stack tecnológica */}
      <div>
        <p className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
          Stack tecnológica *
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {COMMON_TECH.map((t) => (
            <button
              key={t}
              type="button"
              data-tech={t}
              onClick={handleTechToggle}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                techStack.includes(t)
                  ? "border-violet-400 bg-violet-500/20 text-violet-300"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTech}
            onChange={(e) => setCustomTech(e.target.value)}
            onKeyDown={handleTechKeyDown}
            placeholder="Outra tecnologia..."
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            type="button"
            onClick={addCustomTech}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition"
          >
            Adicionar
          </button>
        </div>
        {techStack.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {techStack.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 px-3 py-0.5 text-xs"
              >
                {t}
                <button
                  type="button"
                  data-tech={t}
                  onClick={handleTechRemove}
                  className="opacity-60 hover:opacity-100 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Briefing de origem (opcional) */}
      {deliveredBriefings.length > 0 && (
        <div>
          <label htmlFor="lib-briefing" className="block text-xs uppercase tracking-widest text-slate-400 mb-1.5">
            Briefing de origem (opcional)
          </label>
          <select
            id="lib-briefing"
            value={briefingId}
            onChange={(e) => setBriefingId(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-slate-800 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">— Nenhum —</option>
            {deliveredBriefings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.projectType} · {new Date(b.createdAt).toLocaleDateString("pt-PT")} (ID: {b.id.slice(-8)})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Feedback */}
      {status === "error" && (
        <p className="rounded-xl bg-red-500/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">
          {errorMsg}
        </p>
      )}
      {status === "success" && (
        <p className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 px-4 py-3 text-sm text-emerald-400">
          Projeto adicionado à biblioteca com sucesso! O embedding foi gerado.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
      >
        {status === "loading" ? "Gerando embedding e salvando…" : "Adicionar à Biblioteca"}
      </button>
    </form>
  );
}
