"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

interface PayOrderButtonProps {
  orderId: string;
  estimatedValue: number;
}

export function PayOrderButton({ orderId, estimatedValue }: Readonly<PayOrderButtonProps>) {
  const t = useTranslations("portal");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/checkout`, { method: "POST" });
      const data = await res.json() as { url?: string; error?: string };
      if (res.ok && data.url) {
        globalThis.location.href = data.url;
      } else {
        setError(data.error ?? t("payErrInit"));
        setLoading(false);
      }
    } catch {
      setError(t("payErrNetwork"));
      setLoading(false);
    }
  }

  const amount = estimatedValue.toLocaleString(locale, { style: "currency", currency: "EUR" });

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
      <h2 className="text-sm font-semibold text-emerald-300 mb-1">{t("payTitle")}</h2>
      <p className="text-xs text-slate-400 mb-4">
        {t("payBody", { amount })}
      </p>
      {error && (
        <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400">{error}</p>
      )}
      <button
        onClick={() => { void handlePay(); }}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            ></span>
            {" "}{t("payRedirecting")}
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            {t("payBtn", { amount })}
          </>
        )}
      </button>
      <p className="mt-2 text-[10px] text-slate-600">{t("paySecure")}</p>
    </div>
  );
}
