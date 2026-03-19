"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProposalComments from "@/app/portal/briefing/[id]/proposta/ProposalComments";

type ProposalStatus = "DRAFT" | "SENT" | "REVISION" | "APPROVED" | "REJECTED";

type ProposalRow = {
  id: string;
  version: number;
  status: ProposalStatus;
  summary: string;
  content: string;
  hoursTotal: number;
  costMin: number;
  costMax: number;
  clientNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

type Props = Readonly<{
  briefingId: string;
  initialProposal: ProposalRow | null;
  hasScope: boolean;
}>;

const STATUS_LABEL: Record<ProposalStatus, string> = {
  DRAFT:    "Rascunho",
  SENT:     "Enviada",
  REVISION: "Revisão pedida",
  APPROVED: "Aprovada ✓",
  REJECTED: "Rejeitada",
};

const STATUS_COLOR: Record<ProposalStatus, string> = {
  DRAFT:    "bg-slate-500/20 text-slate-300",
  SENT:     "bg-blue-500/20 text-blue-300",
  REVISION: "bg-orange-500/20 text-orange-300",
  APPROVED: "bg-emerald-500/20 text-emerald-300",
  REJECTED: "bg-red-500/20 text-red-300",
};

export default function ProposalManager({ briefingId, initialProposal, hasScope }: Props) {
  const [proposal, setProposal] = useState<ProposalRow | null>(initialProposal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    summary: "",
    content: "",
    hoursTotal: 0,
    costMin: 0,
    costMax: 0,
  });
  const [rewriting, setRewriting] = useState(false);
  const router = useRouter();

  async function generate(send: boolean) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefingId, send }),
      });
      const data = (await res.json()) as { proposal?: ProposalRow; error?: string };
      if (!res.ok) { setError(data.error ?? "Erro ao gerar proposta."); return; }
      setProposal(data.proposal ?? null);
      router.refresh();
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function startEditing() {
    if (!proposal) return;
    setEditForm({
      summary: proposal.summary,
      content: proposal.content,
      hoursTotal: proposal.hoursTotal,
      costMin: proposal.costMin,
      costMax: proposal.costMax,
    });
    setEditing(true);
    setPreview(false);
  }

  async function saveEdits() {
    if (!proposal) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/proposal/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", ...editForm }),
      });
      const data = (await res.json()) as { proposal?: ProposalRow; error?: string };
      if (!res.ok) { setError(data.error ?? "Erro ao guardar alterações."); return; }
      setProposal(data.proposal ?? null);
      setEditing(false);
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  async function rewriteWithAI() {
    if (!proposal || !editForm.content.trim()) return;
    setRewriting(true);
    setError("");
    try {
      const res = await fetch(`/api/proposal/${proposal.id}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excerpt: editForm.content }),
      });
      const data = (await res.json()) as { rewritten?: string; error?: string };
      if (res.ok && data.rewritten) {
        setEditForm(f => ({ ...f, content: data.rewritten ?? "" }));
      } else {
        setError(data.error ?? "Erro ao reescrever com IA.");
      }
    } catch {
      setError("Erro de rede.");
    } finally {
      setRewriting(false);
    }
  }

  async function sendProposal() {
    if (!proposal) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/proposal/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      const data = (await res.json()) as { proposal?: ProposalRow; error?: string };
      if (!res.ok) { setError(data.error ?? "Erro ao enviar proposta."); return; }
      setProposal(data.proposal ?? null);
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  if (!hasScope) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center space-y-2">
        <p className="text-white/40 text-sm">Gere o escopo M2 antes de criar a proposta.</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center space-y-4">
        <p className="text-white/50 text-sm">Nenhuma proposta gerada ainda.</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => generate(false)}
            disabled={loading}
            className="rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 transition disabled:opacity-50"
          >
            {loading ? "A gerar…" : "Gerar rascunho"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header da proposta */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[proposal.status]}`}>
              {STATUS_LABEL[proposal.status]}
            </span>
            <span className="text-xs text-white/30">v{proposal.version}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!editing && (
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white transition"
              >
                {preview ? "Ocultar" : "Pré-visualizar"}
              </button>
            )}
            {!editing && (proposal.status === "DRAFT" || proposal.status === "REVISION") && (
              <button
                type="button"
                onClick={startEditing}
                className="rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10 transition"
              >
                ✏ Editar
              </button>
            )}
            {!editing && (
              <button
                type="button"
                onClick={() => generate(false)}
                disabled={loading}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white transition disabled:opacity-50"
              >
                {loading ? "…" : "↺ Regenerar"}
              </button>
            )}
            {!editing && (proposal.status === "DRAFT" || proposal.status === "REVISION") && (
              <button
                type="button"
                onClick={sendProposal}
                disabled={loading}
                className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 transition disabled:opacity-50"
              >
                {loading ? "…" : "Enviar ao cliente →"}
              </button>
            )}
            {editing && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveEdits}
                  disabled={loading}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  {loading ? "A guardar…" : "Guardar alterações"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider mb-0.5">Horas</p>
            <p className="text-white font-semibold">{proposal.hoursTotal}h</p>
          </div>
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider mb-0.5">Investimento</p>
            <p className="text-white font-semibold">
              €{proposal.costMin.toLocaleString("pt-PT")}–{proposal.costMax.toLocaleString("pt-PT")}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider mb-0.5">Gerada em</p>
            <p className="text-white/60 text-sm">
              {new Date(proposal.createdAt).toLocaleDateString("pt-PT")}
            </p>
          </div>
        </div>

        {/* Sumário — visualização ou edição */}
        {editing ? (
          <div className="pt-2 border-t border-white/5 space-y-4">
            <div>
              <label htmlFor="edit-summary" className="text-xs text-white/30 uppercase tracking-wider block mb-1">Sumário executivo</label>
              <textarea
                id="edit-summary"
                rows={3}
                value={editForm.summary}
                onChange={e => setEditForm(f => ({ ...f, summary: e.target.value }))}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-sky-500/50 resize-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="edit-hours" className="text-xs text-white/30 uppercase tracking-wider block mb-1">Horas</label>
                <input
                  id="edit-hours"
                  type="number"
                  value={editForm.hoursTotal}
                  onChange={e => setEditForm(f => ({ ...f, hoursTotal: Number(e.target.value) }))}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label htmlFor="edit-cost-min" className="text-xs text-white/30 uppercase tracking-wider block mb-1">Custo mín (€)</label>
                <input
                  id="edit-cost-min"
                  type="number"
                  value={editForm.costMin}
                  onChange={e => setEditForm(f => ({ ...f, costMin: Number(e.target.value) }))}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label htmlFor="edit-cost-max" className="text-xs text-white/30 uppercase tracking-wider block mb-1">Custo máx (€)</label>
                <input
                  id="edit-cost-max"
                  type="number"
                  value={editForm.costMax}
                  onChange={e => setEditForm(f => ({ ...f, costMax: Number(e.target.value) }))}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="edit-content" className="text-xs text-white/30 uppercase tracking-wider">Conteúdo completo da proposta</label>
                <button
                  type="button"
                  onClick={rewriteWithAI}
                  disabled={rewriting}
                  className="rounded-lg border border-purple-500/30 px-3 py-1 text-xs text-purple-300/80 hover:text-purple-200 hover:bg-purple-500/10 transition disabled:opacity-40"
                >
                  {rewriting ? "A reescrever…" : "✨ Reescrever com IA"}
                </button>
              </div>
              <textarea
                id="edit-content"
                rows={16}
                value={editForm.content}
                onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/80 font-mono placeholder:text-white/20 focus:outline-none focus:border-sky-500/50 resize-y"
              />
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Sumário executivo</p>
            <p className="text-sm text-white/70 leading-relaxed">{proposal.summary}</p>
          </div>
        )}

        {/* Nota do cliente se em revisão */}
        {proposal.status === "REVISION" && proposal.clientNote && (
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
            <p className="text-xs text-orange-300/70 uppercase tracking-wider mb-1">Nota do cliente</p>
            <p className="text-sm text-orange-200">{proposal.clientNote}</p>
          </div>
        )}
      </div>

      {/* Preview do conteúdo */}
      {preview && (
        <div className="rounded-xl border border-white/8 bg-white/3 p-6">
          <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans leading-relaxed">
            {proposal.content}
          </pre>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Comentários do cliente */}
      <ProposalComments proposalId={proposal.id} isAdmin={true} />
    </div>
  );
}
