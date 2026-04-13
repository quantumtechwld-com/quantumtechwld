"use client";

import { Globe, Monitor, Smartphone, ShoppingCart, Bot, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  PROJECT_TYPE_VALUES, FEATURE_KEYS, BUDGET_KEYS, TIMELINE_KEYS,
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
  const t = useTranslations("lead");
  return (
    <div className="grid grid-cols-2 gap-3">
      {PROJECT_TYPE_VALUES.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => set("projectType", value)}
          className={`rounded-2xl border p-4 text-left transition hover:border-accent ${
            data.projectType === value
              ? "border-accent bg-accent/20"
              : "border-white/15 bg-white/5"
          }`}
        >
          <span className="text-accent">{PROJECT_TYPE_ICONS[value]}</span>
          <p className="mt-2 font-semibold text-white">
            {t(`project${value.charAt(0).toUpperCase() + value.slice(1)}`)}
          </p>
          <p className="mt-1 text-xs leading-snug text-slate-300">
            {t(`project${value.charAt(0).toUpperCase() + value.slice(1)}Desc`)}
          </p>
        </button>
      ))}
    </div>
  );
}

function StepPainPoints({ data, set }: StepProps) {
  const t = useTranslations("lead");
  return (
    <div className="grid gap-4">
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          <span>{t("painPointsLabel")}</span>
          <textarea
            rows={3}
            value={data.painPoints}
            onChange={(e) => set("painPoints", e.target.value)}
            placeholder={t("painPointsPlaceholder")}
            className={INPUT_CLS}
          />
        </label>
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          <span>{t("audienceLabel")}</span>
          <input
            value={data.targetAudience}
            onChange={(e) => set("targetAudience", e.target.value)}
            placeholder={t("audiencePlaceholder")}
            className={INPUT_CLS}
          />
        </label>
      </div>
    </div>
  );
}

function StepFeatures({ data, set }: StepProps) {
  const t = useTranslations("lead");
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-2">
        {FEATURE_KEYS.map((fKey) => (
          <label
            key={fKey}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
              data.features.includes(fKey)
                ? "border-accent bg-accent/15 text-white"
                : "border-white/15 bg-white/5 text-slate-300 hover:border-white/30"
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={data.features.includes(fKey)}
              onChange={() => set("features", toggleFeature(data.features, fKey))}
            />
            <span
              className={`h-3.5 w-3.5 shrink-0 rounded border transition ${
                data.features.includes(fKey)
                  ? "border-accent bg-accent"
                  : "border-white/30"
              }`}
            />
            {t(`feature${fKey.charAt(0).toUpperCase() + fKey.slice(1)}`)}
          </label>
        ))}
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">
          <span>{t("featuresOther")}</span>
          <input
            value={data.customFeatures}
            onChange={(e) => set("customFeatures", e.target.value)}
            placeholder={t("featuresOtherPlaceholder")}
            className={INPUT_CLS}
          />
        </label>
      </div>
    </div>
  );
}

function StepBudgetTimeline({ data, set }: StepProps) {
  const t = useTranslations("lead");
  return (
    <div className="grid gap-5">
      <div>
        <p className="mb-2 text-sm text-slate-300">{t("budgetLabel")}</p>
        <div className="grid grid-cols-2 gap-2">
          {BUDGET_KEYS.map((bKey) => {
            const BUDGET_SUFFIX: Record<string, string> = {
              "under3k": "Under3k",
              "3k-8k":   "3k8k",
              "8k-20k":  "8k20k",
              "over20k": "Over20k",
            };
            const labelKey = `budget${BUDGET_SUFFIX[bKey] ?? "Over20k"}`;
            const subKey = `${labelKey}Sub`;
            return (
              <button
                key={bKey}
                type="button"
                onClick={() => set("budget", bKey)}
                className={`rounded-xl border p-3 text-left transition hover:border-accent ${
                  data.budget === bKey
                    ? "border-accent bg-accent/20"
                    : "border-white/15 bg-white/5"
                }`}
              >
                <p className="font-semibold text-white text-sm">{t(labelKey)}</p>
                <p className="text-xs text-slate-400">{t(subKey)}</p>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm text-slate-300">{t("timelineLabel")}</p>
        <div className="grid grid-cols-2 gap-2">
          {TIMELINE_KEYS.map((tlKey) => {
            const labelKey = `timeline${tlKey.charAt(0).toUpperCase() + tlKey.slice(1)}`;
            const subKey = `${labelKey}Sub`;
            return (
              <button
                key={tlKey}
                type="button"
                onClick={() => set("timeline", tlKey)}
                className={`rounded-xl border p-3 text-left transition hover:border-accent ${
                  data.timeline === tlKey
                    ? "border-accent bg-accent/20"
                    : "border-white/15 bg-white/5"
                }`}
              >
                <p className="font-semibold text-white text-sm">{t(labelKey)}</p>
                <p className="text-xs text-slate-400">{t(subKey)}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepContact({ data, set }: StepProps) {
  const t = useTranslations("lead");
  return (
    <div className="grid gap-4">
      <input
        value={data.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder={t("namePlaceholder")}
        className={INPUT_CLS}
      />
      <input
        type="email"
        value={data.email}
        onChange={(e) => set("email", e.target.value)}
        placeholder={t("emailPlaceholder")}
        className={INPUT_CLS}
      />
      <input
        value={data.company}
        onChange={(e) => set("company", e.target.value)}
        placeholder={t("companyPlaceholder")}
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
