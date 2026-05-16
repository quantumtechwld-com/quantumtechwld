"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function RatingWidget({ orderId }: Readonly<{ orderId: string }>) {
  const t = useTranslations("portal");
  const router  = useRouter();
  const [hover,   setHover]   = useState(0);
  const [score,   setScore]   = useState(0);
  const [comment, setComment] = useState("");

  const LABELS = [
    t("ratingLabel1"),
    t("ratingLabel2"),
    t("ratingLabel3"),
    t("ratingLabel4"),
    t("ratingLabel5"),
  ];
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function submit() {
    if (!score) { setError(t("ratingSelectScore")); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/rating`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ score, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? t("ratingErrSave"));
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("ratingErrUnexpected"));
    } finally {
      setLoading(false);
    }
  }

  const active = hover || score;

  return (
    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5">
      <h3 className="text-sm font-semibold text-yellow-300 mb-1">{t("ratingTitle")}</h3>
      <p className="text-xs text-slate-400 mb-4">{t("ratingSubtitle")}</p>

      {/* Estrelas */}
      <div role="radiogroup" aria-label="Avaliação" tabIndex={-1} className="flex gap-1 mb-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setScore(n)}
            onMouseEnter={() => setHover(n)}
            className={`text-2xl transition-transform hover:scale-110 focus:outline-none ${
              n <= active ? "text-yellow-400" : "text-slate-600"
            }`}
            aria-label={`${n} ${n === 1 ? t("ratingStar") : t("ratingStars")}`}
          >
            ★
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="text-xs text-yellow-300/80 mb-3">{LABELS[active - 1]}</p>
      )}

      {/* Comentário opcional */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder={t("ratingCommentPlaceholder")}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500/60 focus:outline-none resize-none mb-3"
      />

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={loading || !score}
        className="rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400 disabled:opacity-50"
      >
        {loading ? t("ratingSending") : t("ratingSubmit")}
      </button>
    </div>
  );
}
