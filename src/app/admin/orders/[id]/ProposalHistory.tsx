"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, User, FileText } from "lucide-react";

type ProposalStatus = "DRAFT" | "SENT" | "APPROVED" | "REVISION" | "REJECTED" | "SUPERSEDED";

type ProposalVersion = {
  id: string;
  version: number;
  status: ProposalStatus;
  productionInfo: string;
  estimatedValue: number;
  adminNote?: string | null;
  sentAt?: Date | null;
  reviewedAt?: Date | null;
  clientResponse?: "approved" | "revision" | "rejected" | null;
  clientNote?: string | null;
  createdByAdmin?: {
    name: string | null;
    email: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

type ProposalHistoryProps = {
  proposals: ProposalVersion[];
};

const STATUS_CONFIG: Record<ProposalStatus, { label: string; color: string; dot: string }> = {
  DRAFT: { label: "Rascunho", color: "text-slate-400", dot: "bg-slate-500" },
  SENT: { label: "Enviada", color: "text-blue-400", dot: "bg-blue-500" },
  APPROVED: { label: "Aprovada", color: "text-green-400", dot: "bg-green-500" },
  REVISION: { label: "Em revisão", color: "text-yellow-400", dot: "bg-yellow-500" },
  REJECTED: { label: "Rejeitada", color: "text-red-400", dot: "bg-red-500" },
  SUPERSEDED: { label: "Substituída", color: "text-slate-500", dot: "bg-slate-600" },
};

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatValue(value: number): string {
  return `€${value.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ProposalVersionCard({ proposal, isLatest }: Readonly<{ proposal: ProposalVersion; isLatest: boolean }>) {
  const [expanded, setExpanded] = useState(isLatest);
  const statusInfo = STATUS_CONFIG[proposal.status];

  return (
    <div className={`rounded-xl border ${isLatest ? "border-violet-500/50 bg-violet-500/5" : "border-white/10 bg-white/5"}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition rounded-xl"
      >
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${isLatest ? "bg-violet-500 text-white" : "bg-slate-700 text-slate-300"}`}>
            v{proposal.version}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
            <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>
          <span className="text-xs text-slate-500">{formatDate(proposal.createdAt)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">{formatValue(proposal.estimatedValue)}</span>
          {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {/* Details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/10">
          {/* Produção */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Informações de produção</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{proposal.productionInfo}</p>
          </div>

          {/* Nota admin */}
          {proposal.adminNote && (
            <div>
              <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold block mb-2">Nota do admin</span>
              <p className="text-sm text-slate-400 italic">{proposal.adminNote}</p>
            </div>
          )}

          {/* Criado por */}
          {proposal.createdByAdmin && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <User className="w-3 h-3" />
              <span>Criado por {proposal.createdByAdmin.name || proposal.createdByAdmin.email}</span>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
            {proposal.sentAt && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-500">Enviada em</span>
                </div>
                <span className="text-xs text-slate-300">{formatDate(proposal.sentAt)}</span>
              </div>
            )}
            {proposal.reviewedAt && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-500">Respondida em</span>
                </div>
                <span className="text-xs text-slate-300">{formatDate(proposal.reviewedAt)}</span>
              </div>
            )}
          </div>

          {/* Resposta do cliente */}
          {proposal.clientResponse && (
            <div className="pt-2 border-t border-white/5">
              <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold block mb-2">
                Resposta do cliente: {(() => {
                  if (proposal.clientResponse === "approved") return "✅ Aprovado";
                  if (proposal.clientResponse === "revision") return "⚠️ Revisão";
                  return "❌ Rejeitado";
                })()}
              </span>
              {proposal.clientNote && <p className="text-sm text-slate-300 italic">{proposal.clientNote}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ProposalHistory({ proposals }: Readonly<ProposalHistoryProps>) {
  if (proposals.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm text-slate-400">Nenhuma proposta registrada ainda.</p>
      </div>
    );
  }

  // Ordenar por versão decrescente (mais recente primeiro)
  const sorted = [...proposals].sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Histórico de Propostas ({proposals.length})
        </h3>
      </div>
      {sorted.map((proposal, index) => (
        <ProposalVersionCard
          key={proposal.id}
          proposal={proposal}
          isLatest={index === 0}
        />
      ))}
    </div>
  );
}
