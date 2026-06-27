/**
 * Templates de e-mail para sistema de propostas versionadas
 */

import { ORDER_TYPE_LABEL } from "@/lib/constants";
import { emailLogoHeader, emailFooterTeam, emailFooterSystem } from "./shared";
import { formatCurrencyByCode } from "@/lib/currency";

/**
 * Notifica cliente que recebeu nova proposta (ou revisão)
 */
export function tplProposalSentToClient(opts: {
  clientName: string;
  orderType: string;
  orderTitle?: string;
  estimatedValue: number;
  estimatedCurrency: string;
  productionInfo: string;
  version: number;
  isRevision: boolean;
  orderUrl: string;
}) {
  const versionText = opts.isRevision 
    ? `<span style="background:#7c3aed;color:#fff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase">Revisão v${opts.version}</span>`
    : `<span style="background:#0ea5e9;color:#fff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700">Nova proposta v${opts.version}</span>`;

  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 12px">${opts.isRevision ? "Proposta revista" : "Proposta recebida"}</h1>
      <div style="margin-bottom:24px">${versionText}</div>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 24px">
        ${opts.isRevision 
          ? `A equipe reviu a proposta para o seu pedido de <strong style="color:#fff">${opts.orderTitle || (ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType)}</strong>.`
          : `A equipe avaliou o seu pedido de <strong style="color:#fff">${opts.orderTitle || (ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType)}</strong> e enviou uma proposta de produção.`
        }
      </p>
      <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Valor estimado</p>
        <p style="color:#fff;font-weight:700;font-size:24px;margin:0 0 16px">${formatCurrencyByCode(opts.estimatedValue, opts.estimatedCurrency)}</p>
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Informações de produção</p>
        <p style="color:#94a3b8;font-size:14px;margin:0">${opts.productionInfo.slice(0, 400)}${opts.productionInfo.length > 400 ? "…" : ""}</p>
      </div>
      <a href="${opts.orderUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver proposta e responder
      </a>
      ${emailFooterTeam()}
    </div>
  `;
}

/**
 * Notifica admin que cliente aprovou proposta
 */
export function tplProposalApprovedByClient(opts: {
  clientEmail: string;
  clientName?: string;
  orderType: string;
  orderTitle?: string;
  version: number;
  estimatedValue: number;
  estimatedCurrency: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Proposta aprovada</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        ${opts.clientName ? `<strong style="color:#fff">${opts.clientName}</strong>` : `O cliente <strong style="color:#fff">${opts.clientEmail}</strong>`} 
        aprovou a proposta v${opts.version} para <strong style="color:#fff">${opts.orderTitle || (ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType)}</strong>.
      </p>
      <div style="background:#10b98108;border:1px solid #10b98130;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#34d399;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Valor aprovado</p>
        <p style="color:#fff;font-weight:700;font-size:20px;margin:0">${formatCurrencyByCode(opts.estimatedValue, opts.estimatedCurrency)}</p>
      </div>
      <a href="${opts.adminUrl}" style="display:inline-block;background:#10b981;color:#0f0f14;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver pedido no painel
      </a>
      ${emailFooterSystem()}
    </div>
  `;
}

/**
 * Notifica admin que cliente pediu revisão
 */
export function tplProposalRevisionRequested(opts: {
  clientEmail: string;
  clientName?: string;
  orderType: string;
  orderTitle?: string;
  version: number;
  clientNote?: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#f59e0b;margin:0 0 8px">Revisão solicitada</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        ${opts.clientName ? `<strong style="color:#fff">${opts.clientName}</strong>` : `O cliente <strong style="color:#fff">${opts.clientEmail}</strong>`} 
        solicitou revisão da proposta v${opts.version} para <strong style="color:#fff">${opts.orderTitle || (ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType)}</strong>.
      </p>
      ${opts.clientNote ? `
        <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px">Comentário do cliente</p>
          <p style="color:#94a3b8;font-size:14px;margin:0">${opts.clientNote}</p>
        </div>
      ` : ""}
      <a href="${opts.adminUrl}" style="display:inline-block;background:#f59e0b;color:#0f0f14;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Revisar proposta
      </a>
      ${emailFooterSystem()}
    </div>
  `;
}

/**
 * Notifica admin que cliente rejeitou proposta
 */
export function tplProposalRejectedByClient(opts: {
  clientEmail: string;
  clientName?: string;
  orderType: string;
  orderTitle?: string;
  version: number;
  clientNote?: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#ef4444;margin:0 0 8px">Proposta rejeitada</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        ${opts.clientName ? `<strong style="color:#fff">${opts.clientName}</strong>` : `O cliente <strong style="color:#fff">${opts.clientEmail}</strong>`} 
        rejeitou a proposta v${opts.version} para <strong style="color:#fff">${opts.orderTitle || (ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType)}</strong>.
      </p>
      ${opts.clientNote ? `
        <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px">Motivo</p>
          <p style="color:#94a3b8;font-size:14px;margin:0">${opts.clientNote}</p>
        </div>
      ` : ""}
      <a href="${opts.adminUrl}" style="display:inline-block;background:#64748b;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver detalhes →
      </a>
      ${emailFooterSystem()}
    </div>
  `;
}
