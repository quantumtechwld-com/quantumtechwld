"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAYMENT_METHOD_LABEL } from "@/lib/constants";
import { formatCurrencyByCode } from "@/lib/currency";

interface Installment {
  id:          string;
  sequence:    number;
  amountCents: number;
  currency?:   string | null;
  method:      string;
  status:      string;
  paidAt?:     string | null;
  dueDate?:    string | null;
  notes?:      string | null;
}

interface Props {
  orderId:      string;
  installments: Installment[];
  onUpdated?:   () => void;
}

export function InstallmentActions({ orderId, installments, onUpdated }: Readonly<Props>) {
  const router = useRouter();
  const [loading,   setLoading]   = useState<string | null>(null);
  const [savingDue, setSavingDue] = useState<string | null>(null);
  const [notes,     setNotes]     = useState<Record<string, string>>({});
  const [dueDates,  setDueDates]  = useState<Record<string, string>>({});
  const [error,     setError]     = useState("");

  async function saveDueDate(installmentId: string) {
    setError("");
    setSavingDue(installmentId);
    const dueDate = dueDates[installmentId] ?? null;
    const res = await fetch(
      `/api/admin/financial/${orderId}/installments/${installmentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_due_date", dueDate }),
      },
    ).catch(() => null);
    setSavingDue(null);
    if (!res?.ok) {
      const data = await res?.json().catch(() => ({})) as { error?: string };
      setError(data.error ?? "Erro ao guardar prazo.");
      return;
    }
    onUpdated?.();
    router.refresh();
  }

  async function confirmManual(installmentId: string) {
    setError("");
    setLoading(installmentId);
    const res = await fetch(
      `/api/admin/financial/${orderId}/installments/${installmentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_manual", notes: notes[installmentId] ?? "" }),
      },
    ).catch(() => null);
    setLoading(null);
    if (!res?.ok) {
      const data = await res?.json().catch(() => ({})) as { error?: string };
      setError(data.error ?? "Erro ao confirmar pagamento.");
      return;
    }
    onUpdated?.();
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
      )}
      {installments.map((inst) => (
        <div
          key={inst.id}
          className={`rounded-xl border p-4 ${
            inst.status === "PAID"
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-white/10 bg-white/3"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-white">
                Parcela {inst.sequence} — {formatCurrencyByCode(inst.amountCents / 100, inst.currency ?? "EUR")}
              </p>
              <p className="text-xs text-slate-400">{PAYMENT_METHOD_LABEL[inst.method] ?? inst.method}</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                inst.status === "PAID"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-yellow-500/20 text-yellow-300"
              }`}
            >
              {inst.status === "PAID" ? "Pago" : "Pendente"}
            </span>
          </div>

          {inst.status === "PAID" && inst.paidAt && (
            <p className="text-xs text-slate-500 mt-1">
              Pago em {new Date(inst.paidAt).toLocaleDateString("pt-PT")}
              {inst.notes ? ` · ${inst.notes}` : ""}
            </p>
          )}

          {inst.status !== "PAID" && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="date"
                value={dueDates[inst.id] ?? (inst.dueDate ? inst.dueDate.slice(0, 10) : "")}
                onChange={(e) => setDueDates((prev) => ({ ...prev, [inst.id]: e.target.value }))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
              <button
                onClick={() => saveDueDate(inst.id)}
                disabled={savingDue === inst.id}
                className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-60"
              >
                {savingDue === inst.id ? "A guardar…" : "Definir prazo"}
              </button>
            </div>
          )}

          {inst.status !== "PAID" && inst.method !== "STRIPE" && (
            <div className="mt-3 space-y-2">
              <textarea
                placeholder="Referência/comprovativo (opcional)…"
                value={notes[inst.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [inst.id]: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-600 resize-none focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => confirmManual(inst.id)}
                disabled={loading === inst.id}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
              >
                {loading === inst.id ? "A confirmar…" : "Confirmar pagamento manual"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
