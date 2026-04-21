"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  EUR_TO_BRL,
  EUR_TO_USD,
  FX_REFERENCE_DATE,
  PAYMENT_METHOD_OPTIONS,
  DOWN_PAYMENT_OPTIONS,
} from "@/lib/constants";

type Order = {
  id:     string;
  status: string;
  type:   string;
};

async function patchOrder(
  orderId: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`/api/orders/${orderId}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  }).catch(() => null);
  if (!res) return { ok: false, error: "Erro de ligação." };
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({}));
  return { ok: false, error: (data as { error?: string }).error ?? "Erro inesperado." };
}

function parseEstimatedValue(raw: string, isFree: boolean): number {
  if (raw.trim()) return Number.parseFloat(raw);
  return isFree ? 0 : Number.NaN;
}

function isInvalidPrice(value: number): boolean {
  return Number.isNaN(value) || value < 0;
}

function calcFxConversion(raw: string) {
  const eur = Number.parseFloat(raw);
  if (!raw || Number.isNaN(eur) || eur <= 0) return null;
  return {
    brl: (eur * EUR_TO_BRL).toFixed(2),
    usd: (eur * EUR_TO_USD).toFixed(2),
  };
}

function rejectValidationError(action: string, reason: string): string | null {
  if (action !== "admin_reject") return null;
  return reason.trim() ? null : "O motivo da recusa é obrigatório.";
}

function hasNoActions(flags: boolean[]): boolean {
  return flags.every((f) => !f);
}

export function OrderAdminActions({ order, paymentPaid }: Readonly<{ order: Order; paymentPaid?: boolean }>) {
  const router = useRouter();
  const [loading, setLoading]         = useState<string | null>(null);
  const [error,   setError]           = useState("");

  // Proposta
  const [productionInfo,  setProductionInfo]  = useState("");
  const [estimatedValue,  setEstimatedValue]  = useState("");
  const [adminNote,       setAdminNote]       = useState("");
  const [downPaymentPct,  setDownPaymentPct]  = useState(0);
  const [paymentMethod,   setPaymentMethod]   = useState("STRIPE");

  // Conversão de moeda — informativa, client-side
  const fxConversion = useMemo(() => calcFxConversion(estimatedValue), [estimatedValue]);

  // Entrega para revisão
  const [deliveryNote,  setDeliveryNote]  = useState("");
  const [deliveryLinks, setDeliveryLinks] = useState(""); // uma por linha

  // Conclusão final
  const [finalDeliveryNote, setFinalDeliveryNote] = useState("");
  const [finalDeliveryUrl,  setFinalDeliveryUrl]  = useState("");

  // Rejeição
  const [rejectionReason, setRejectionReason] = useState("");

  const [confirmAction, setConfirmAction] = useState<"start_production" | "admin_reject" | "reopen" | null>(null);

  const isFreeOrderType = order.type === "correction" || order.type === "alteration";

  // ── enviar proposta ──────────────────────────────────────────────────────
  async function sendProposal() {
    setError("");
    if (!productionInfo.trim()) { setError("Informações de produção são obrigatórias."); return; }
    const parsedValue = parseEstimatedValue(estimatedValue, isFreeOrderType);
    if (isInvalidPrice(parsedValue)) { setError("Valor estimado inválido."); return; }
    setLoading("propose");
    const result = await patchOrder(order.id, { action: "propose", productionInfo: productionInfo.trim(), estimatedValue: parsedValue, adminNote: adminNote.trim() || undefined, downPaymentPct, paymentMethod });
    if (result.ok) router.refresh(); else setError(result.error ?? "Erro inesperado.");
    setLoading(null);
  }

  // ── entregar para revisão (IN_PRODUCTION → IN_REVIEW) ───────────────────
  async function submitReview() {
    setError("");
    if (!deliveryNote.trim()) { setError("A descrição do trabalho realizado é obrigatória."); return; }
    setLoading("submit_review");
    const links = deliveryLinks.split("\n").map((l) => l.trim()).filter(Boolean);
    const result = await patchOrder(order.id, { action: "submit_review", deliveryNote: deliveryNote.trim(), deliveryLinks: links });
    if (result.ok) router.refresh(); else setError(result.error ?? "Erro inesperado.");
    setLoading(null);
  }

  // ── finalizar (REVIEW_APPROVED → COMPLETED) ──────────────────────────────
  async function finalizeComplete() {
    setError("");
    setLoading("complete");
    const result = await patchOrder(order.id, { action: "complete", finalDeliveryNote: finalDeliveryNote.trim() || undefined, finalDeliveryUrl: finalDeliveryUrl.trim() || undefined });
    if (result.ok) router.refresh(); else setError(result.error ?? "Erro inesperado.");
    setLoading(null);
  }

  // ── acções simples (start_production, admin_reject, reopen) ─────────────
  async function runAction(action: "start_production" | "admin_reject" | "reopen") {
    setError("");
    const validationErr = rejectValidationError(action, rejectionReason);
    if (validationErr) { setError(validationErr); return; }
    setLoading(action);
    const body: Record<string, unknown> = { action, adminNote: rejectionReason.trim() || undefined };
    const result = await patchOrder(order.id, body);
    if (result.ok) router.refresh(); else setError(result.error ?? "Erro inesperado.");
    setLoading(null);
    setConfirmAction(null);
  }

  const canPropose      = ["PENDING", "EVALUATING", "REVISION"].includes(order.status);
  const canStartProd    = order.status === "APPROVED";
  const canSubmitReview = order.status === "IN_PRODUCTION";
  const canFinalize     = order.status === "REVIEW_APPROVED";
  const canReject       = ["PENDING", "EVALUATING", "PROPOSAL_SENT", "APPROVED"].includes(order.status);
  const canReopen       = order.status === "REJECTED";

  if (hasNoActions([canPropose, canStartProd, canSubmitReview, canFinalize, canReject, canReopen])) return null;

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
                Valor estimado (€){" "}
                {isFreeOrderType
                  ? <span className="text-slate-500">(opcional — custo zero se vazio)</span>
                  : <span className="text-red-400">*</span>}
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
              {fxConversion && (
                <p className="mt-1 text-xs text-slate-500">
                  ≈ R$ {fxConversion.brl} BRL · $ {fxConversion.usd} USD{" "}
                  <span className="text-slate-600">(referência BCE {FX_REFERENCE_DATE})</span>
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="admin-down-pct" className="block text-xs text-slate-400 mb-1">Condições de pagamento</label>
                <select
                  id="admin-down-pct"
                  value={downPaymentPct}
                  onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/15 bg-[#0f0f1a] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                >
                  {DOWN_PAYMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="admin-payment-method" className="block text-xs text-slate-400 mb-1">Método de pagamento</label>
                <select
                  id="admin-payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0f0f1a] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                >
                  {PAYMENT_METHOD_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
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
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
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
                <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
              )}
              {confirmAction === "start_production" ? (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => runAction("start_production")} disabled={!!loading} className="rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:opacity-60">
                    {loading === "start_production" ? "A actualizar…" : "Confirmar"}
                  </button>
                  <button onClick={() => setConfirmAction(null)} className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10">
                    Cancelar
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmAction("start_production")} disabled={!!loading} className="rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:opacity-60">
                  Marcar em produção
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Entregar para revisão (IN_PRODUCTION → IN_REVIEW) */}
      {canSubmitReview && (
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
          <h3 className="text-sm font-semibold text-sky-300 mb-4">Entregar para revisão pelo cliente</h3>
          <div className="grid gap-4">
            <div>
              <label htmlFor="admin-delivery-note" className="block text-xs text-slate-400 mb-1">
                O que foi feito <span className="text-red-400">*</span>
              </label>
              <textarea
                id="admin-delivery-note"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                rows={5}
                maxLength={4000}
                placeholder="Descreva o trabalho realizado, alterações efetuadas, decisões técnicas tomadas…"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label htmlFor="admin-delivery-links" className="block text-xs text-slate-400 mb-1">
                Links (opcional — um por linha)
              </label>
              <textarea
                id="admin-delivery-links"
                value={deliveryLinks}
                onChange={(e) => setDeliveryLinks(e.target.value)}
                rows={3}
                maxLength={4096}
                placeholder={"https://staging.exemplo.com\nhttps://drive.google.com/…"}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none resize-none font-mono"
              />
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
            )}
            <div className="flex justify-end">
              <button onClick={submitReview} disabled={!!loading} className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-60">
                {loading === "submit_review" ? "A enviar…" : "Enviar para revisão"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finalizar pedido (REVIEW_APPROVED → COMPLETED) */}
      {canFinalize && (
        <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-5">
          <h3 className="text-sm font-semibold text-teal-300 mb-1">Marcar como concluído</h3>
          <p className="text-xs text-slate-400 mb-4">O cliente aprovou a entrega. Adicione o link do resultado final e finalize o ciclo.</p>
          <div className="grid gap-4">
            <div>
              <label htmlFor="final-delivery-url" className="block text-xs text-slate-400 mb-1">URL do resultado final (opcional)</label>
              <input
                id="final-delivery-url"
                type="url"
                value={finalDeliveryUrl}
                onChange={(e) => setFinalDeliveryUrl(e.target.value)}
                maxLength={2048}
                placeholder="https://resultado.exemplo.com"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="final-delivery-note" className="block text-xs text-slate-400 mb-1">Nota final para o cliente (opcional)</label>
              <textarea
                id="final-delivery-note"
                value={finalDeliveryNote}
                onChange={(e) => setFinalDeliveryNote(e.target.value)}
                rows={3}
                maxLength={4000}
                placeholder="Instruções de acesso, próximos passos, agradecimento…"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none resize-none"
              />
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
            )}
            <div className="flex justify-end">
              <button onClick={finalizeComplete} disabled={!!loading} className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-400 disabled:opacity-60">
                {loading === "complete" ? "A finalizar…" : "Confirmar conclusão"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejeitar pedido */}
      {canReject && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <p className="text-sm text-slate-300 mb-3">
            Rejeite o pedido caso não seja possível dar seguimento.
            O cliente será notificado e o estado será alterado para <strong>Recusado</strong>.
          </p>
          {confirmAction === "admin_reject" && (
            <>
              {error && (
                <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
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
                <button onClick={() => runAction("admin_reject")} disabled={!!loading} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60">
                  {loading === "admin_reject" ? "A recusar…" : "Confirmar recusa"}
                </button>
                <button onClick={() => { setConfirmAction(null); setRejectionReason(""); setError(""); }} className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10">
                  Cancelar
                </button>
              </div>
            </>
          )}
          {confirmAction !== "admin_reject" && (
            <button onClick={() => setConfirmAction("admin_reject")} disabled={!!loading} className="rounded-xl border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60">
              Rejeitar pedido
            </button>
          )}
        </div>
      )}

      {/* Reabrir pedido REJECTED → REVISION */}
      {canReopen && (
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5">
          <p className="text-sm text-slate-300 mb-3">
            Reabra o pedido após esclarecimentos. O estado voltará para <strong>Revisão</strong>.
          </p>
          {error && (
            <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
          )}
          {confirmAction === "reopen" ? (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => runAction("reopen")} disabled={!!loading} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60">
                {loading === "reopen" ? "A reabrir…" : "Confirmar reabertura"}
              </button>
              <button onClick={() => { setConfirmAction(null); setError(""); }} className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10">
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmAction("reopen")} disabled={!!loading} className="rounded-xl border border-orange-500/40 px-5 py-2.5 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/10 disabled:opacity-60">
              Reabrir pedido
            </button>
          )}
        </div>
      )}

    </div>
  );
}
