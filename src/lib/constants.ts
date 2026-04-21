import type { BriefingStatus } from "@prisma/client";

// ── Order Status ─────────────────────────────────────────────

export const ORDER_STATUS_LABEL: Record<string, string> = {
  DRAFT:           "Rascunho",
  PENDING:         "Pendente",
  EVALUATING:      "Em análise",
  PROPOSAL_SENT:   "Proposta enviada",
  APPROVED:        "Aprovado",
  REVISION:        "Revisão solicitada",
  REJECTED:        "Recusado",
  IN_PRODUCTION:   "Em produção",
  IN_REVIEW:       "Em revisão pelo cliente",
  REVIEW_APPROVED: "Revisão aprovada",
  COMPLETED:       "Concluído",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  DRAFT:           "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  PENDING:         "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  EVALUATING:      "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  PROPOSAL_SENT:   "bg-accent/20 text-accent-light border border-accent/30",
  APPROVED:        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  REVISION:        "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  REJECTED:        "bg-red-500/20 text-red-300 border border-red-500/30",
  IN_PRODUCTION:   "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  IN_REVIEW:       "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  REVIEW_APPROVED: "bg-teal-500/20 text-teal-300 border border-teal-500/30",
  COMPLETED:       "bg-green-500/20 text-green-300 border border-green-500/30",
};

export const ALL_ORDER_STATUSES: readonly string[] = [
  "PENDING", "EVALUATING", "PROPOSAL_SENT", "APPROVED",
  "REVISION", "REJECTED", "IN_PRODUCTION", "IN_REVIEW", "REVIEW_APPROVED", "COMPLETED",
];

// ── Briefing Status ──────────────────────────────────────────

export const BRIEFING_STATUS_LABEL: Record<BriefingStatus, string> = {
  RECEIVED:       "Recebido",
  IN_ANALYSIS:    "Em Análise",
  PROPOSAL_SENT:  "Proposta Enviada",
  IN_NEGOTIATION: "Em Negociação",
  APPROVED:       "Aprovado",
  IN_PROGRESS:    "Em Desenvolvimento",
  DELIVERED:      "Entregue",
};

export const BRIEFING_STATUS_COLOR: Record<BriefingStatus, string> = {
  RECEIVED:       "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  IN_ANALYSIS:    "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  PROPOSAL_SENT:  "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  IN_NEGOTIATION: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  APPROVED:       "bg-green-500/20 text-green-300 border border-green-500/30",
  IN_PROGRESS:    "bg-accent/20 text-accent-light border border-accent/30",
  DELIVERED:      "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
};

// ── Proposal Status ──────────────────────────────────────────

export type ProposalStatus = "DRAFT" | "SENT" | "REVISION" | "APPROVED" | "REJECTED";

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  DRAFT:    "Rascunho",
  SENT:     "Enviada",
  REVISION: "Revisão pedida",
  APPROVED: "Aprovada ✓",
  REJECTED: "Rejeitada",
};

export const PROPOSAL_STATUS_COLOR: Record<ProposalStatus, string> = {
  DRAFT:    "bg-slate-500/20 text-slate-300",
  SENT:     "bg-blue-500/20 text-blue-300",
  REVISION: "bg-orange-500/20 text-orange-300",
  APPROVED: "bg-emerald-500/20 text-emerald-300",
  REJECTED: "bg-red-500/20 text-red-300",
};

// ── Shared Maps ──────────────────────────────────────────────

export const ORDER_TYPE_LABEL: Record<string, string> = {
  new_feature:  "Nova funcionalidade",
  bug_fix:      "Correção de bug",
  new_project:  "Novo projeto",
  support:      "Suporte",
  correction:   "Correção",
  alteration:   "Alteração",
  other:        "Outro",
};

export const PROJECT_TYPE_LABEL: Record<string, string> = {
  landing_page:    "Landing Page",
  ecommerce:       "E-commerce",
  saas:            "SaaS",
  mobile_app:      "App Mobile",
  corporate_site:  "Site Corporativo",
  custom:          "Personalizado",
};

export const URGENCY_LABEL: Record<string, string> = {
  low:      "Baixa",
  normal:   "Normal",
  high:     "Alta",
  critical: "Crítica",
};

export const URGENCY_COLOR: Record<string, string> = {
  low:      "text-slate-300",
  normal:   "text-blue-300",
  high:     "text-orange-300",
  critical: "text-red-300 font-semibold",
};
