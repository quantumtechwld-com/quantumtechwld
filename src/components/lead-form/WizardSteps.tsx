"use client";

import { Globe, Monitor, Smartphone, ShoppingCart, Bot, Settings } from "lucide-react";
import {
  PROJECT_TYPES, FEATURES, BUDGETS, TIMELINES,
  INPUT_CLS, toggleFeature,
  type WizardState,
} from "./wizard-data";

const PROJECT_TYPE_ICONS: Record<string, React.ReactNode> = {
  website:    <Globe size={22} strokeWidth={1.5} />,
  webapp:     <Monitor size={22} strokeWidth={1.5} />,
  mobile:     <Smartphone size={22} strokeWidth={1.5} />,
  ecommerce:  <ShoppingCart size={22} strokeWidth={1.5} />,
  automation: <Bot size={22} strokeWidth={1.5} />,
  system:     <Settings size={22} strokeWidth={1.5} />,
};

type StepProps = Readonly<{
  data: WizardState;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
}>;


function StepProjectType({ data, set }: StepProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PROJECT_TYPES.map((pt) => (
        <button
          key={pt.value}
          type="button"
          onClick={() => set("projectType", pt.value)}
          className={`rounded-2xl border p-4 text-left transition hover:border-accent ${
            data.projectType === pt.value
              ? "border-accent bg-accent/20"
              : "border-white/15 bg-white/5"
          }`}
        >
          <span className="text-accent">{PROJECT_TYPE_ICONS[pt.value]}</span>
          <p className="mt-2 font-semibold text-white">{pt.label}</p>
          <p className="mt-1 text-xs leading-snug text-slate-300">{pt.description}</p>
        </button>
      ))}
    </div>
  );
}

function StepPainPoints({ data, set }: StepProps) {
  return (
    <div className="grid gap-4">
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          <span>Qual é o principal problema que o projeto resolve?</span>
          <textarea
            rows={3}
            value={data.painPoints}
            onChange={(e) => set("painPoints", e.target.value)}
            placeholder="Ex: Perco clientes pois não tenho presença online..."
            className={INPUT_CLS}
          />
        </label>
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          <span>Quem vai usar o produto?</span>
          <input
            value={data.targetAudience}
            onChange={(e) => set("targetAudience", e.target.value)}
            placeholder="Ex: Pequenos comerciantes, equipe interna, consumidores finais..."
            className={INPUT_CLS}
          />
        </label>
      </div>
    </div>
  );
}

function StepFeatures({ data, set }: StepProps) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-2">
        {FEATURES.map((f) => (
          <label
            key={f}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
              data.features.includes(f)
                ? "border-accent bg-accent/15 text-white"
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
                  ? "border-accent bg-accent"
                  : "border-white/30"
              }`}
            />
            {f}
          </label>
        ))}
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          <span>Outras funcionalidades (opcional)</span>
          <input
            value={data.customFeatures}
            onChange={(e) => set("customFeatures", e.target.value)}
            placeholder="Descreva livremente..."
            className={INPUT_CLS}
          />
        </label>
      </div>
    </div>
  );
}

function StepBudgetTimeline({ data, set }: StepProps) {
  return (
    <div className="grid gap-5">
      <div>
        <p className="mb-2 text-sm text-slate-300">Orçamento disponível</p>
        <div className="grid grid-cols-2 gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => set("budget", b.value)}
              className={`rounded-xl border p-3 text-left transition hover:border-accent ${
                data.budget === b.value
                  ? "border-accent bg-accent/20"
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
              className={`rounded-xl border p-3 text-left transition hover:border-accent ${
                data.timeline === t.value
                  ? "border-accent bg-accent/20"
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
  );
}

function StepContact({ data, set }: StepProps) {
  return (
    <div className="grid gap-4">
      <input
        value={data.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Seu nome *"
        className={INPUT_CLS}
      />
      <input
        type="email"
        value={data.email}
        onChange={(e) => set("email", e.target.value)}
        placeholder="Seu melhor e-mail *"
        className={INPUT_CLS}
      />
      <input
        value={data.company}
        onChange={(e) => set("company", e.target.value)}
        placeholder="Empresa (opcional)"
        className={INPUT_CLS}
      />
    </div>
  );
}

const STEP_COMPONENTS = [
  StepProjectType, StepPainPoints, StepFeatures, StepBudgetTimeline, StepContact,
];

type Props = Readonly<{
  step: number;
  data: WizardState;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
}>;

export default function WizardSteps({ step, data, set }: Props) {
  const Step = STEP_COMPONENTS[step];
  return <Step data={data} set={set} />;
}
