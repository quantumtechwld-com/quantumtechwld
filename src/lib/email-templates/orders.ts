import { ORDER_TYPE_LABEL, URGENCY_LABEL } from "@/lib/constants";
import { emailLogoHeader, emailFooterTeam, emailFooterSystem } from "./shared";

export function tplOrderReceived(opts: {
  clientEmail: string;
  clientName: string;
  organizationName?: string | null;
  orderType: string;
  orderTitle: string;
  urgency: string;
  description: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px">Novo pedido recebido</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        ${opts.organizationName ? `A empresa <strong style="color:#fff">🏢 ${opts.organizationName}</strong>` : `O cliente <strong style="color:#fff">${opts.clientName}</strong>`} submeteu um novo pedido.
      </p>
      <p style="color:#64748b;font-size:13px;margin:0 0 24px">Contacto: ${opts.clientEmail}</p>
      <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:12px;padding:20px;margin-bottom:24px">
        ${opts.orderTitle ? `<p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Título</p><p style="color:#fff;font-weight:700;font-size:16px;margin:0 0 16px">${opts.orderTitle}</p>` : ""}
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Tipo</p>
        <p style="color:#fff;font-weight:600;margin:0 0 16px">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</p>
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Urgência</p>
        <p style="color:#fff;font-weight:600;margin:0 0 16px">${URGENCY_LABEL[opts.urgency] ?? opts.urgency}</p>
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Descrição</p>
        <p style="color:#94a3b8;margin:0;font-size:14px">${opts.description.slice(0, 300)}${opts.description.length > 300 ? "…" : ""}</p>
      </div>
      <a href="${opts.adminUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver pedido no painel →
      </a>
      ${emailFooterSystem()}
    </div>
  `;
}

export function tplOrderProposalSent(opts: {
  clientName: string;
  orderType: string;
  orderTitle?: string;
  estimatedValue: number;
  productionInfo: string;
  orderUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px">Proposta recebida ✦</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 24px">
        A equipe avaliou o seu pedido de <strong style="color:#fff">${opts.orderTitle || (ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType)}</strong>
        e enviou uma proposta de produção.
      </p>
      <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Valor estimado</p>
        <p style="color:#fff;font-weight:700;font-size:24px;margin:0 0 16px">€${opts.estimatedValue.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}</p>
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px">Informações de produção</p>
        <p style="color:#94a3b8;font-size:14px;margin:0">${opts.productionInfo.slice(0, 400)}${opts.productionInfo.length > 400 ? "…" : ""}</p>
      </div>
      <a href="${opts.orderUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver proposta e responder →
      </a>
      ${emailFooterTeam()}
    </div>
  `;
}

export function tplOrderApprovedAdmin(opts: {
  clientEmail: string;
  orderType: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Pedido aprovado ✓</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        O cliente <strong style="color:#fff">${opts.clientEmail}</strong> aprovou a proposta
        para o pedido de <strong style="color:#fff">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</strong>.
      </p>
      <a href="${opts.adminUrl}" style="display:inline-block;background:#10b981;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver no painel admin →
      </a>
      ${emailFooterSystem()}
    </div>
  `;
}

export function tplOrderRevisionAdmin(opts: {
  clientEmail: string;
  orderType: string;
  adminNote: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#f59e0b;margin:0 0 8px">Revisão solicitada</h1>
      <p style="color:#94a3b8;margin:0 0 16px">
        O cliente <strong style="color:#fff">${opts.clientEmail}</strong> pediu revisão ao pedido de
        <strong style="color:#fff">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</strong>.
      </p>
      <div style="background:#f59e0b15;border:1px solid #f59e0b30;border-radius:10px;padding:16px;margin-bottom:24px">
        <p style="color:#fbbf24;font-size:13px;margin:0">${opts.adminNote || "Sem nota adicional."}</p>
      </div>
      <a href="${opts.adminUrl}" style="display:inline-block;background:#f59e0b;color:#000;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver pedido →
      </a>
      ${emailFooterSystem()}
    </div>
  `;
}

export function tplOrderInProduction(opts: {
  clientName: string;
  orderType: string;
  orderTitle?: string;
  orderUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#8b5cf6;margin:0 0 8px">O seu pedido está em produção 🚀</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 24px">
        O seu pedido <strong style="color:#fff">${opts.orderTitle || (ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType)}</strong>
        entrou em produção. Você pode acompanhar o estado no seu portal.
      </p>
      <a href="${opts.orderUrl}" style="display:inline-block;background:#8b5cf6;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Acompanhar pedido →
      </a>
      ${emailFooterTeam()}
    </div>
  `;
}

export function tplOrderCompleted(opts: {
  clientName: string;
  orderType: string;
  orderTitle?: string;
  orderUrl: string;
  finalDeliveryUrl?: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Pedido concluído ✓</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 24px">
        O seu pedido <strong style="color:#fff">${opts.orderTitle || (ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType)}</strong>
        foi concluído com sucesso. Obrigado pela confiança!
      </p>
      ${opts.finalDeliveryUrl ? `<p style="color:#94a3b8;margin:0 0 16px">Aceda ao resultado final:</p><a href="${opts.finalDeliveryUrl}" style="display:inline-block;background:#10b981;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;margin-bottom:16px">Ver resultado final →</a><br/>` : ""}
      <a href="${opts.orderUrl}" style="display:inline-block;background:#10b981;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver detalhes →
      </a>
      ${emailFooterTeam()}
    </div>
  `;
}

export function tplOrderInReview(opts: {
  clientName: string;
  orderType: string;
  orderTitle?: string;
  orderUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#0ea5e9;margin:0 0 8px">Entrega pronta para revisão 🔍</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 24px">
        O seu pedido <strong style="color:#fff">${opts.orderTitle || (ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType)}</strong>
        foi entregue e está aguardando a sua avaliação. Aceda ao portal para revisar o trabalho realizado e aprovar ou pedir correções.
      </p>
      <a href="${opts.orderUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Avaliar entrega →
      </a>
      ${emailFooterTeam()}
    </div>
  `;
}

export function tplOrderReviewApprovedAdmin(opts: {
  clientEmail: string;
  orderType: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#14b8a6;margin:0 0 8px">Cliente aprovou a entrega ✅</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        O cliente <strong style="color:#fff">${opts.clientEmail}</strong> aprovou a entrega do pedido
        (${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}).
      </p>
      <p style="color:#94a3b8;margin:0 0 24px">Pode agora marcar o pedido como <strong style="color:#fff">Concluído</strong> e adicionar o link do resultado final.</p>
      <a href="${opts.adminUrl}" style="display:inline-block;background:#14b8a6;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Finalizar pedido →
      </a>
      ${emailFooterSystem()}
    </div>
  `;
}

export function tplOrderNewMessage(opts: {
  recipientName: string;
  senderRole: "admin" | "client";
  senderEmail?: string;
  orderType: string;
  orderTitle?: string;
  body: string;
  orderUrl: string;
}) {
  const clientLabel = opts.senderEmail ? `o cliente (${opts.senderEmail})` : "o cliente";
  const senderLabel = opts.senderRole === "admin" ? "a equipa Quantum Technology" : clientLabel;
  const orderLabel = opts.orderTitle || (ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType);
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px">Nova mensagem no pedido 💬</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.recipientName ? ` ${opts.recipientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 16px">
        Você recebeu uma nova mensagem de ${senderLabel} no pedido
        <strong style="color:#fff">${orderLabel}</strong>.
      </p>
      <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#e2e8f0;font-size:14px;margin:0;white-space:pre-wrap">${opts.body.slice(0, 500)}${opts.body.length > 500 ? "…" : ""}</p>
      </div>
      <a href="${opts.orderUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Responder →
      </a>
      ${emailFooterSystem()}
    </div>
  `;
}
