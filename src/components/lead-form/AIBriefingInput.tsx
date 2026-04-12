"use client";

import { useTranslations } from "next-intl";
import { INPUT_CLS } from "./wizard-data";

type Props = Readonly<{
  aiText: string;
  onAiTextChange: (text: string) => void;
  aiLoading: boolean;
  aiError: string | null;
  onAnalyze: () => void;
  onSkip: () => void;
}>;

export default function AIBriefingInput({
  aiText, onAiTextChange, aiLoading, aiError, onAnalyze, onSkip,
}: Props) {
  const t = useTranslations("lead");
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-widest text-violet-300">
          {t("aiTitle")}
        </p>
        <h2 className="mt-1 text-xl font-bold text-white">
          {t("aiHeading")}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {t("aiSubheading")}
        </p>
      </div>

      <textarea
        rows={6}
        value={aiText}
        onChange={(e) => onAiTextChange(e.target.value)}
        placeholder={t("aiPlaceholder")}
        className={INPUT_CLS}
      />

      {aiError && <p className="mt-2 text-sm text-red-300">{aiError}</p>}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border border-white/20 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
        >
          {t("btnManual")}
        </button>
        <button
          type="button"
          disabled={!aiText.trim() || aiLoading}
          onClick={onAnalyze}
          className="flex-1 rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {aiLoading ? t("btnAnalyzing") : t("btnAnalyze")}
        </button>
      </div>
    </div>
  );
}
