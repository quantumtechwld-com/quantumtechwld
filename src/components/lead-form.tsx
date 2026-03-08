"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { computeComplexity } from "@/lib/complexity";

// ─── Dados do wizard ──────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  { value: "website", label: "Website", icon: "🌐", description: "Landing page, institucional ou portfólio" },
  { value: "webapp", label: "Aplicação Web", icon: "💻", description: "Sistema ou plataforma web completa" },
  { value: "mobile", label: "App Mobile", icon: "📱", description: "iOS, Android ou híbrido" },
  { value: "ecommerce", label: "E-commerce", icon: "🛒", description: "Loja virtual com pagamentos" },
  { value: "automation", label: "Automação / IA", icon: "🤖", description: "Integrações, n8n, bots e IA" },
  { value: "system", label: "Sistema Interno", icon: "⚙️", description: "ERP, CRM, painel ou backoffice" },
];

const FEATURES = [
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

const BUDGETS = [
  { value: "Até €3.000", sub: "Projetos simples" },
  { value: "€3.000 – €8.000", sub: "Médio porte" },
  { value: "€8.000 – €20.000", sub: "Alto porte" },
  { value: "Acima de €20.000", sub: "Enterprise" },
];

const TIMELINES = [
  { value: "Urgente (< 30 dias)", sub: "Preciso logo" },
  { value: "Normal (1–3 meses)", sub: "Prazo padrão" },
  { value: "Planejado (3–6 meses)", sub: "Sem pressa" },
  { value: "Flexível", sub: "Sem prazo definido" },
];

const STEPS = [
  { title: "Tipo de projeto", sub: "O que você precisa construir?" },
  { title: "Desafio & Público", sub: "Qual problema isso resolve?" },
  { title: "Funcionalidades", sub: "O que o sistema precisa fazer?" },
  { title: "Orçamento & Prazo", sub: "Qual o escopo esperado?" },
  { title: "Seus dados", sub: "Como podemos entrar em contato?" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardState = {
  projectType: string;
  painPoints: string;
  targetAudience: string;
  features: string[];
  customFeatures: string;
  budget: string;
  timeline: string;
  name: string;
  email: string;
  company: string;
};

const initial: WizardState = {
  projectType: "",
  painPoints: "",
  targetAudience: "",
  features: [],
  customFeatures: "",
  budget: "",
  timeline: "",
  name: "",
  email: "",
  company: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toggleFeature(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((f) => f !== item) : [...list, item];
}

function canAdvance(step: number, state: WizardState): boolean {
  if (step === 0) return Boolean(state.projectType);
  if (step === 1) return Boolean(state.painPoints.trim() && state.targetAudience.trim());
  if (step === 2) return state.features.length > 0 || Boolean(state.customFeatures.trim());
  if (step === 3) return Boolean(state.budget && state.timeline);
  if (step === 4) return Boolean(state.name.trim() && state.email.trim());
  return false;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LeadForm() {
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardState>(initial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeWithAI = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/briefing/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });
      const json = (await res.json()) as Partial<WizardState> & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erro ao analisar.");
      setData((prev) => ({ ...prev, ...json }));
      setShowWizard(true);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Erro ao analisar. Tente novamente.");
    } finally {
      setAiLoading(false);
    }
  };

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        service: PROJECT_TYPES.find((p) => p.value === data.projectType)?.label ?? data.projectType,
        message: data.painPoints,
      };
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? "Falha ao enviar lead.");
      }
      router.push("/obrigado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    "rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-sky-400 w-full";

  // ─── Tela inicial: Briefing Intelligence ─────────────────────────────────
  if (!showWizard) {
    return (
      <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-widest text-sky-300">
            ✨ Briefing Inteligente
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">
            Descreva seu projeto em texto livre
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            A IA analisa e preenche o formulário automaticamente. Ou pule e preencha manualmente.
          </p>
        </div>

        <textarea
          rows={6}
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          placeholder={`Ex: Preciso de um app mobile para delivery de comida. O cliente faz o pedido, o restaurante confirma e o entregador rastreia em tempo real. Precisa de pagamento online, notificações push e painel administrativo. Orçamento até €15.000, prazo de 4 meses.`}
          className={inputCls}
        />

        {aiError && <p className="mt-2 text-sm text-red-300">{aiError}</p>}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="rounded-xl border border-white/20 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Preencher manualmente
          </button>
          <button
            type="button"
            disabled={!aiText.trim() || aiLoading}
            onClick={analyzeWithAI}
            className="flex-1 rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {aiLoading ? "Analisando..." : "✨ Analisar com IA →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
      {/* Cabeçalho + progresso */}
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-widest text-sky-300">
            Etapa {step + 1} de {STEPS.length}
          </span>
          <span className="text-xs text-slate-400">{STEPS[step].title}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-lg font-semibold text-white">{STEPS[step].sub}</p>
      </div>

      {/* ─── Step 1: Tipo de projeto ─── */}
      {step === 0 && (
        <div className="grid grid-cols-2 gap-3">
          {PROJECT_TYPES.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => set("projectType", pt.value)}
              className={`rounded-2xl border p-4 text-left transition hover:border-sky-400 ${
                data.projectType === pt.value
                  ? "border-sky-400 bg-sky-500/20"
                  : "border-white/15 bg-white/5"
              }`}
            >
              <span className="text-2xl">{pt.icon}</span>
              <p className="mt-2 font-semibold text-white">{pt.label}</p>
              <p className="mt-1 text-xs leading-snug text-slate-300">{pt.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* ─── Step 2: Dores & Público ─── */}
      {step === 1 && (
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Qual é o principal problema que o projeto resolve?
            </label>
            <textarea
              rows={3}
              value={data.painPoints}
              onChange={(e) => set("painPoints", e.target.value)}
              placeholder="Ex: Perco clientes pois não tenho presença online..."
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Quem vai usar o produto?
            </label>
            <input
              value={data.targetAudience}
              onChange={(e) => set("targetAudience", e.target.value)}
              placeholder="Ex: Pequenos comerciantes, equipe interna, consumidores finais..."
              className={inputCls}
            />
          </div>
        </div>
      )}

      {/* ─── Step 3: Funcionalidades ─── */}
      {step === 2 && (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map((f) => (
              <label
                key={f}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                  data.features.includes(f)
                    ? "border-sky-400 bg-sky-500/15 text-white"
                    : "border-white/15 bg-white/5 text-slate-300 hover:border-white/30"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={data.features.includes(f)}
                  onChange={() => set("features", toggleFeature(data.features, f))}
                />
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded border transition ${
                    data.features.includes(f)
                      ? "border-sky-400 bg-sky-500"
                      : "border-white/30"
                  }`}
                />
                {f}
              </label>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Outras funcionalidades (opcional)
            </label>
            <input
              value={data.customFeatures}
              onChange={(e) => set("customFeatures", e.target.value)}
              placeholder="Descreva livremente..."
              className={inputCls}
            />
          </div>
        </div>
      )}

      {/* ─── Step 4: Orçamento & Prazo ─── */}
      {step === 3 && (
        <div className="grid gap-5">
          {/* Complexity Score Preview */}
          {(() => {
            const cx = computeComplexity(data.projectType, data.features, data.customFeatures);
            const barColor =
              cx.color === "green"  ? "bg-emerald-400" :
              cx.color === "yellow" ? "bg-yellow-400" :
              cx.color === "orange" ? "bg-orange-400" : "bg-red-400";
            const textColor =
              cx.color === "green"  ? "text-emerald-400" :
              cx.color === "yellow" ? "text-yellow-400" :
              cx.color === "orange" ? "text-orange-400" : "text-red-400";
            return (
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">
                  Estimativa preliminar
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-3xl font-bold ${textColor}`}>{cx.score}</span>
                    <span className="ml-1 text-sm text-slate-400">/10</span>
                    <p className={`mt-0.5 text-sm font-semibold ${textColor}`}>{cx.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">
                      {cx.hoursMin}–{cx.hoursMax}h
                    </p>
                    <p className="text-xs text-slate-400">estimativa de esforço</p>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${(cx.score / 10) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Estimativa heurística com base no tipo de projeto e funcionalidades selecionadas.
                </p>
              </div>
            );
          })()}
          <div>
            <p className="mb-2 text-sm text-slate-300">Orçamento disponível</p>
            <div className="grid grid-cols-2 gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => set("budget", b.value)}
                  className={`rounded-xl border p-3 text-left transition hover:border-sky-400 ${
                    data.budget === b.value
                      ? "border-sky-400 bg-sky-500/20"
                      : "border-white/15 bg-white/5"
                  }`}
                >
                  <p className="font-semibold text-white text-sm">{b.value}</p>
                  <p className="text-xs text-slate-400">{b.sub}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-slate-300">Prazo desejado</p>
            <div className="grid grid-cols-2 gap-2">
              {TIMELINES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set("timeline", t.value)}
                  className={`rounded-xl border p-3 text-left transition hover:border-sky-400 ${
                    data.timeline === t.value
                      ? "border-sky-400 bg-sky-500/20"
                      : "border-white/15 bg-white/5"
                  }`}
                >
                  <p className="font-semibold text-white text-sm">{t.value}</p>
                  <p className="text-xs text-slate-400">{t.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 5: Dados de contato ─── */}
      {step === 4 && (
        <div className="grid gap-4">
          <input
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Seu nome *"
            className={inputCls}
          />
          <input
            type="email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="Seu melhor e-mail *"
            className={inputCls}
          />
          <input
            value={data.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Empresa (opcional)"
            className={inputCls}
          />
        </div>
      )}

      {/* Erro */}
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      {/* Navegação */}
      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="flex-1 rounded-xl border border-white/20 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            ← Anterior
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance(step, data)}
            className="flex-1 rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próximo →
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={isLoading || !canAdvance(step, data)}
            className="flex-1 rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Enviando..." : "Enviar briefing →"}
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Ao enviar, você autoriza contato comercial relacionado ao seu projeto.
      </p>
    </div>
  );
}
