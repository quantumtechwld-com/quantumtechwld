"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function NewOrderForm() {
  const t = useTranslations("portal");
  const router = useRouter();

  const ORDER_TYPES = [
    { value: "new_feature",  label: t("orderTypeNewFeature") },
    { value: "bug_fix",      label: t("orderTypeBugFix") },
    { value: "new_project",  label: t("orderTypeNewProject") },
    { value: "support",      label: t("orderTypeSupport") },
    { value: "other",        label: t("orderTypeOther") },
  ];

  const URGENCY_OPTIONS = [
    { value: "low",      label: t("urgencyLow") },
    { value: "normal",   label: t("urgencyNormal") },
    { value: "high",     label: t("urgencyHigh") },
    { value: "critical", label: t("urgencyCritical") },
  ];

  const [type,        setType]        = useState("new_feature");
  const [description, setDescription] = useState("");
  const [urgency,     setUrgency]     = useState("normal");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!description.trim()) { setError(t("newOrderErrRequired")); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type, description: description.trim(), urgency }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? t("newOrderErrCreate"));
      }
      router.push("/portal/orders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("newOrderErrUnexpected"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div>
        <label htmlFor="order-type" className="block text-sm font-medium text-slate-300 mb-2">
          {t("newOrderTypeLabel")}
        </label>
        <select
          id="order-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white focus:border-accent focus:outline-none"
        >
          {ORDER_TYPES.map((o) => (
            <option key={o.value} value={o.value} className="bg-gray-900">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="order-description" className="block text-sm font-medium text-slate-300 mb-2">
          {t("newOrderDescLabel")} <span className="text-red-400">*</span>
        </label>
        <textarea
          id="order-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder={t("newOrderDescPlaceholder")}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-slate-300 mb-2">{t("newOrderUrgencyLabel")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {URGENCY_OPTIONS.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => setUrgency(u.value)}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                urgency === u.value
                  ? "border-accent bg-accent/20 text-accent-light"
                  : "border-white/15 bg-white/5 text-slate-400 hover:bg-white/8"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <a
          href="/portal/orders"
          className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-white/10"
        >
          {t("newOrderCancel")}
        </a>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light disabled:opacity-60"
        >
          {loading ? t("newOrderSubmitting") : t("newOrderSubmit")}
        </button>
      </div>
    </form>
  );
}

