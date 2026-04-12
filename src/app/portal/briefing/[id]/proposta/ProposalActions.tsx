"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = Readonly<{
  proposalId: string;
  briefingId: string;
}>;

export default function ProposalActions({ proposalId }: Props) {
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations("briefing");

  async function act(action: "approve" | "request_revision") {
    if (action === "request_revision" && !note.trim()) {
      setError(t("revisionRequired"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/proposal/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) { setError(data.error ?? t("serverError")); return; }
      router.refresh();
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">{t("decisionTitle")}</h2>
        <p className="text-sm text-slate-400">
          {t("decisionDesc")}
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {showNote ? (
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("revisionPlaceholder")}
            rows={4}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => act("request_revision")}
              disabled={loading}
              className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400 transition disabled:opacity-50"
            >
              {loading ? t("sending") : t("sendRevision")}
            </button>
            <button
              type="button"
              onClick={() => { setShowNote(false); setNote(""); setError(""); }}
              disabled={loading}
              className="rounded-xl border border-white/15 px-4 py-3 text-sm text-slate-400 hover:text-white transition"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => act("approve")}
            disabled={loading}
            className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-400 transition disabled:opacity-50"
          >
            {loading ? "…" : `✓ ${t("approve")}`}
          </button>
          <button
            type="button"
            onClick={() => setShowNote(true)}
            disabled={loading}
            className="flex-1 rounded-xl border border-white/15 py-3 text-sm text-slate-300 hover:bg-white/10 transition disabled:opacity-50"
          >
            {t("requestRevision")}
          </button>
        </div>
      )}
    </div>
  );
}
