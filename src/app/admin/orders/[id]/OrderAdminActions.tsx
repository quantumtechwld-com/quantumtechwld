"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id:     string;
  status: string;
  type:   string;
};

export function OrderAdminActions({ order, paymentPaid }: Readonly<{ order: Order; paymentPaid?: boolean }>) {
  const router = useRouter();
  const [loading, setLoading]         = useState<string | null>(null);
  const [error,   setError]           = useState("");
  const [productionInfo, setProductionInfo] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [adminNote,       setAdminNote]     = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmAction,  setConfirmAction]  = useState<"start_production" | "complete" | "reject" | null>(null);

  async function sendProposal() {
    setError("");
    if (!productionInfo.trim()) { setError("Informações de produção são obrigatórias."); return; }
    if (!estimatedValue || Number.isNaN(Number.parseFloat(estimatedValue)) || Number.parseFloat(estimatedValue) < 0) {
      setError("Valor estimado inválido."); return;
    }
    setLoading("propose");
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          action:         "propose",
          productionInfo: productionInfo.trim(),
          estimatedValue: Number.parseFloat(estimatedValue),
          adminNote:      adminNote.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao enviar proposta.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(null);
    }
  }

  async function runAction(action: "start_production" | "complete" | "admin_reject") {
    setError("");
    if (action === "admin_reject") {
      if (!rejectionReason.trim()) { setError("O motivo da recusa é obrigatório."); return; }
    }
    setLoading(action);
    try {
      const body: Record<string, unknown> = { action };
      if (action === "admin_reject") body.adminNote = rejectionReason.trim();
      const res = await fetch(`/api/orders/${order.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao actualizar.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(null);
      setConfirmAction(null);
    }
  }

  const canPropose       = ["PENDING", "EVALUATING", "REVISION"].includes(order.status);
  const canStartProd     = order.status === "APPROVED";
  const canComplete      = order.status === "IN_PRODUCTION";
  const canReject        = ["PENDING", "EVALUATING", "PROPOSAL_SENT", "APPROVED"].includes(order.status);

  if (!canPropose && !canStartProd && !canComplete && !canReject) return null;

  return (
    <div className="mt-6 space-y-4">
      {/* Enviar proposta */}
      {canPropose && (
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5">
          <h3 className="text-sm font-semibold text-violet-300 mb-4">Enviar proposta ao cliente</h3>
          <div className="grid gap-4">
            <div>
              <label htmlFor="admin-production-info" className="block text-xs text-slate-400 mb-1">
                Informações de produção <span className="text-red-400">*</span>
              </label>
              <textarea
                id="admin-production-info"
                value={productionInfo}
                onChange={(e) => setProductionInfo(e.target.value)}
                rows={4}
                placeholder="Detalhe o que será feito, prazo estimado, tecnologias envolvidas…"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label htmlFor="admin-estimated-value" className="block text-xs text-slate-400 mb-1">
                Valor estimado (€) <span className="text-red-400">*</span>
              </label>
              <input
                id="admin-estimated-value"
                type="number"
                min="0"
                step="0.01"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="admin-note" className="block text-xs text-slate-400 mb-1">Nota adicional (opcional)</label>
              <textarea
                id="admin-note"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                placeholder="Observações, condicionantes, perguntas ao cliente…"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none resize-none"
              />
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}
            <div className="flex justify-end">
              <button
                onClick={sendProposal}
                disabled={!!loading}
                className="rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-60"
              >
                {loading === "propose" ? "A enviar…" : "Enviar proposta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marcar em produção */}
      {canStartProd && (
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">
          {paymentPaid ? (
            <p className="text-sm text-emerald-300">
              ✅ Pagamento confirmado pelo Stripe. O pedido foi automaticamente marcado como <strong>Em produção</strong>.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-300 mb-3">
                O cliente aprovou a proposta. Marque o pedido como <strong>Em produção</strong> quando iniciar os trabalhos.
              </p>
              {error && (
                <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </p>
              )}
              {confirmAction === "start_production" ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runAction("start_production")}
                    disabled={!!loading}
                    className="rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:opacity-60"
                  >
                    {loading === "start_production" ? "A actualizar…" : "Confirmar"}
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmAction("start_production")}
                  disabled={!!loading}
                  className="rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:opacity-60"
                >
                  Marcar em produção
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Marcar concluído */}
      {canComplete && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
          <p className="text-sm text-slate-300 mb-3">
            Clique em <strong>Marcar concluído</strong> quando a entrega estiver feita.
          </p>
          {error && (
            <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
          {confirmAction === "complete" ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => runAction("complete")}
                disabled={!!loading}
                className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-400 disabled:opacity-60"
              >
                {loading === "complete" ? "A finalizar…" : "Confirmar conclusão"}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmAction("complete")}
              disabled={!!loading}
              className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-400 disabled:opacity-60"
            >
              Marcar concluído
            </button>
          )}
        </div>
      )}
      {/* Rejeitar pedido */}
      {canReject && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <p className="text-sm text-slate-300 mb-3">
            Rejeite o pedido caso não seja possível dar seguimento.
            O cliente será notificado e o estado será alterado para <strong>Recusado</strong>.
          </p>
          {confirmAction === "reject" && (
            <>
              {error && (
                <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </p>
              )}
              <div className="mb-3">
                <label htmlFor="rejection-reason" className="block text-xs text-slate-400 mb-1">
                  Motivo da recusa <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Explique ao cliente o motivo pelo qual o pedido não pode ser aceite…"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => runAction("admin_reject")}
                  disabled={!!loading}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                >
                  {loading === "admin_reject" ? "A recusar…" : "Confirmar recusa"}
                </button>
                <button
                  onClick={() => { setConfirmAction(null); setRejectionReason(""); setError(""); }}
                  className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
          {confirmAction !== "reject" && (
            <button
              onClick={() => setConfirmAction("reject")}
              disabled={!!loading}
              className="rounded-xl border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
            >
              Rejeitar pedido
            </button>
          )}
        </div>
      )}
    </div>
  );
}
