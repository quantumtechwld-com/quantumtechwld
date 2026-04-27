"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Order = {
  id:             string;
  status:         string;
  estimatedValue: number | null;
  productionInfo: string | null;
  adminNote?:     string | null;
  deliveryNote?:  string | null;
  deliveryLinks?: string[];
};

export function OrderClientActions({ order }: Readonly<{ order: Order }>) {
  const t = useTranslations("portal");
  const router = useRouter();
  const [revisionNote,    setRevisionNote]    = useState("");
  const [correctionNote,  setCorrectionNote]  = useState("");
  const [loading,  setLoading]  = useState<string | null>(null);
  const [error,    setError]    = useState("");
  const [confirm,  setConfirm]  = useState<"approve" | "reject" | null>(null);

  if (![
    "PROPOSAL_SENT",
    "IN_REVIEW",
  ].includes(order.status)) return null;

  async function act(action: "approve" | "revision" | "reject") {
    if (action !== "revision" && !confirm) { setConfirm(action); return; }
    if (action === "revision" && !revisionNote.trim()) {
      setError(t("orderActionsRevisionRequired")); return;
    }
    setError("");
    setLoading(action);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, adminNote: revisionNote.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? t("orderActionsErrUpdate"));
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("orderActionsErrUnexpected"));
    } finally {
      setLoading(null);
      setConfirm(null);
    }
  }

  return (
    <>
      {/* PROPOSAL_SENT block */}
      {order.status === "PROPOSAL_SENT" && (
      <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/5 p-5">
      <p className="text-sm font-semibold text-accent-light mb-4">{t("orderActionsTitle")}</p>

      {/* Revision note */}
      <div className="mb-4">
        <label htmlFor="revision-note" className="block text-xs text-slate-400 mb-1">
          {t("orderActionsRevisionLabel")}
        </label>
        <textarea
          id="revision-note"
          value={revisionNote}
          onChange={(e) => setRevisionNote(e.target.value)}
          rows={3}
          placeholder={t("orderActionsRevisionPlaceholder")}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {/* Confirm dialogs */}
      {confirm === "approve" && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {t("orderActionsConfirmText1")} <strong>{t("orderActionsApproveStrong")}</strong> {t("orderActionsConfirmText2")}{" "}
          <button onClick={() => act("approve")} disabled={!!loading} className="underline font-semibold">
            {loading === "approve" ? t("orderActionsConfirming") : t("orderActionsYesApprove")}
          </button>{" "}
          ·{" "}
          <button onClick={() => setConfirm(null)} className="underline text-slate-400">
            {t("orderActionsCancel")}
          </button>
        </div>
      )}
      {confirm === "reject" && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {t("orderActionsConfirmText1")} <strong>{t("orderActionsRejectStrong")}</strong> {t("orderActionsConfirmText2")}{" "}
          <button onClick={() => act("reject")} disabled={!!loading} className="underline font-semibold">
            {loading === "reject" ? t("orderActionsConfirming") : t("orderActionsYesReject")}
          </button>{" "}
          ·{" "}
          <button onClick={() => setConfirm(null)} className="underline text-slate-400">
            {t("orderActionsCancel")}
          </button>
        </div>
      )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setConfirm(null); act("revision"); }}
            disabled={!!loading}
            className="rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-300 transition hover:bg-orange-500/20 disabled:opacity-60"
          >
            {loading === "revision" ? t("orderActionsSending") : t("orderActionsRevisionBtn")}
          </button>
          <button
            onClick={() => { setConfirm(null); act("reject"); }}
            disabled={!!loading}
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
          >
            {t("orderActionsRejectBtn")}
          </button>
          <button
            onClick={() => act("approve")}
            disabled={!!loading}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading === "approve" ? t("orderActionsConfirming") : t("orderActionsApproveBtn")}
          </button>
        </div>
      </div>
      )}

      {/* IN_REVIEW block — cliente avalia entrega */}
      {order.status === "IN_REVIEW" && (
        <div className="mt-6 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
          <p className="text-sm font-semibold text-sky-300 mb-4">{t("orderActionsReviewTitle")}</p>

          <div className="mb-4">
            <label htmlFor="correction-note" className="block text-xs text-slate-400 mb-1">
              {t("orderActionsReviewCorrectionLabel")}
            </label>
            <textarea
              id="correction-note"
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              rows={3}
              placeholder={t("orderActionsReviewCorrectionPlaceholder")}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none resize-none"
            />
          </div>

          {error && (
            <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={async () => {
                if (!correctionNote.trim()) { setError(t("orderActionsReviewCorrectionRequired")); return; }
                setError("");
                setLoading("request_correction");
                try {
                  const res = await fetch(`/api/orders/${order.id}`, {
                    method:  "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ action: "request_correction", adminNote: correctionNote.trim() }),
                  });
                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error((data as { error?: string }).error ?? t("orderActionsErrUnexpected"));
                  }
                  router.refresh();
                } catch (err) {
                  setError(err instanceof Error ? err.message : t("orderActionsErrUnexpected"));
                } finally {
                  setLoading(null);
                }
              }}
              disabled={!!loading}
              className="rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-300 transition hover:bg-orange-500/20 disabled:opacity-60"
            >
              {loading === "request_correction" ? t("orderActionsSending") : t("orderActionsReviewCorrectBtn")}
            </button>
            <button
              onClick={async () => {
                setError("");
                setLoading("approve_review");
                try {
                  const res = await fetch(`/api/orders/${order.id}`, {
                    method:  "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ action: "approve_review" }),
                  });
                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error((data as { error?: string }).error ?? t("orderActionsErrUnexpected"));
                  }
                  router.refresh();
                } catch (err) {
                  setError(err instanceof Error ? err.message : t("orderActionsErrUnexpected"));
                } finally {
                  setLoading(null);
                }
              }}
              disabled={!!loading}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading === "approve_review" ? t("orderActionsReviewApproving") : t("orderActionsReviewApproveBtn")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
