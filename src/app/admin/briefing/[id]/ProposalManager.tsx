"use client";

import ProposalComments from "@/app/portal/(app)/briefing/[id]/proposta/ProposalComments";
import {
  PROPOSAL_STATUS_LABEL as STATUS_LABEL,
  PROPOSAL_STATUS_COLOR as STATUS_COLOR,
} from "@/lib/constants";
import { formatCurrencyRangeByCode } from "@/lib/currency";
import type { ProposalRow } from "./proposal-types";
import { useProposalActions } from "./useProposalActions";
import ProposalEditForm from "./ProposalEditForm";

type Props = Readonly<{
  briefingId: string;
  initialProposal: ProposalRow | null;
  hasScope: boolean;
}>;

export default function ProposalManager({ briefingId, initialProposal, hasScope }: Props) {
  const {
    proposal, loading, error, preview, setPreview,
    editing, setEditing, editForm, setEditForm, rewriting,
    generate, startEditing, saveEdits, rewriteWithAI, sendProposal,
  } = useProposalActions(briefingId, initialProposal);

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
            className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-light transition disabled:opacity-50"
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
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-light transition disabled:opacity-50"
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
              {formatCurrencyRangeByCode(proposal.costMin, proposal.costMax, proposal.costCurrency)}
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
          <ProposalEditForm
            editForm={editForm}
            onChange={setEditForm}
            onRewrite={rewriteWithAI}
            rewriting={rewriting}
          />
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
