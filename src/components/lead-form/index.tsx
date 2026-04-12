"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  STEP_COUNT,
  initialWizardState, canAdvance,
  type WizardState,
} from "./wizard-data";
import AIBriefingInput from "./AIBriefingInput";
import WizardSteps from "./WizardSteps";

export default function LeadForm() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("lead");
  const [showWizard, setShowWizard] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardState>(initialWizardState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepTitles = [
    t("step1Title"), t("step2Title"), t("step3Title"), t("step4Title"), t("step5Title"),
  ];
  const stepSubs = [
    t("step1Sub"), t("step2Sub"), t("step3Sub"), t("step4Sub"), t("step5Sub"),
  ];

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
      if (!res.ok) throw new Error(json.error ?? t("btnAnalyze"));
      setData((prev) => ({ ...prev, ...json }));
      setShowWizard(true);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : t("btnAnalyze"));
    } finally {
      setAiLoading(false);
    }
  };

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        service: data.projectType,
        message: data.painPoints,
      };
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? t("btnSubmit"));
      }
      router.push(locale === "pt" ? "/obrigado" : `/${locale}/obrigado`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("btnSubmit"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!showWizard) {
    return (
      <AIBriefingInput
        aiText={aiText}
        onAiTextChange={setAiText}
        aiLoading={aiLoading}
        aiError={aiError}
        onAnalyze={analyzeWithAI}
        onSkip={() => setShowWizard(true)}
      />
    );
  }

  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
      {/* Header + progress */}
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-widest text-accent-light">
            {t("stepLabel", { current: step + 1, total: STEP_COUNT })}
          </span>
          <span className="text-xs text-slate-400">{stepTitles[step]}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-lg font-semibold text-white">{stepSubs[step]}</p>
      </div>

      <WizardSteps step={step} data={data} set={set} />

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="flex-1 rounded-xl border border-white/20 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            {t("btnPrev")}
          </button>
        )}
        {step < STEP_COUNT - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance(step, data)}
            className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("btnNext")}
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={isLoading || !canAdvance(step, data)}
            className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? t("btnSubmitting") : t("btnSubmit")}
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {t("consent")}
      </p>
    </div>
  );
}

