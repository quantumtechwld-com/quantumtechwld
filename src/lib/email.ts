import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT ?? 465),
  secure: Number(process.env.EMAIL_SERVER_PORT ?? 465) === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailOptions) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "Quantum Technology <noreply@quantumtechnology.pt>",
    to,
    subject,
    html,
  });
}

// ─── Templates ───────────────────────────────────────────────────────────────

export function tplProposalSent(opts: {
  clientName: string;
  projectType: string;
  proposalUrl: string;
  costMin: number;
  costMax: number;
  hoursTotal: number;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <div style="margin-bottom:24px">
        <img src="${process.env.NEXTAUTH_URL}/logo.png" alt="Quantum Technology" height="32" style="filter:brightness(2)" onerror="this.style.display='none'" />
      </div>
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px">A sua proposta está pronta ✦</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 24px">
        A proposta comercial para o projeto <strong style="color:#fff">${opts.projectType}</strong> 
        já está disponível no seu portal.
      </p>
      <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:12px;padding:20px;margin-bottom:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;padding-bottom:4px">Estimativa de horas</td>
            <td style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;padding-bottom:4px">Investimento</td>
          </tr>
          <tr>
            <td style="color:#fff;font-weight:600;font-size:18px">${opts.hoursTotal}h</td>
            <td style="color:#fff;font-weight:600;font-size:18px">€${opts.costMin.toLocaleString("pt-PT")}–${opts.costMax.toLocaleString("pt-PT")}</td>
          </tr>
        </table>
      </div>
      <a href="${opts.proposalUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver proposta completa →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:32px">
        Se tiver dúvidas, responda a este e-mail ou contacte-nos diretamente.<br/>
        — Equipa Quantum Technology
      </p>
    </div>
  `;
}

export function tplProposalApproved(opts: {
  adminEmail: string;
  clientEmail: string;
  projectType: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Proposta aprovada ✓</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        O cliente <strong style="color:#fff">${opts.clientEmail}</strong> aprovou a proposta 
        para o projeto <strong style="color:#fff">${opts.projectType}</strong>.
      </p>
      <a href="${opts.adminUrl}" style="display:inline-block;background:#10b981;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver no painel admin →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:32px">— Sistema Quantum Technology</p>
    </div>
  `;
}

export function tplProposalApprovedClient(opts: {
  clientName: string;
  projectType: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Proposta aprovada — bem-vindo a bordo! 🚀</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 16px">
        A sua aprovação foi registada para o projeto <strong style="color:#fff">${opts.projectType}</strong>.
      </p>
      <p style="color:#94a3b8;margin:0 0 24px">
        A nossa equipa irá entrar em contacto em breve para agendar o kickoff e iniciar o desenvolvimento.
      </p>
      <p style="color:#475569;font-size:12px;margin-top:32px">
        Obrigado pela confiança!<br/>— Equipa Quantum Technology
      </p>
    </div>
  `;
}

export function tplRevisionRequested(opts: {
  adminEmail: string;
  projectType: string;
  clientNote: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <h1 style="font-size:22px;font-weight:700;color:#f59e0b;margin:0 0 8px">Revisão solicitada</h1>
      <p style="color:#94a3b8;margin:0 0 16px">
        O cliente solicitou alterações à proposta do projeto 
        <strong style="color:#fff">${opts.projectType}</strong>.
      </p>
      <div style="background:#f59e0b15;border:1px solid #f59e0b30;border-radius:10px;padding:16px;margin-bottom:24px">
        <p style="color:#fbbf24;font-size:13px;margin:0">${opts.clientNote || "Sem nota adicional."}</p>
      </div>
      <a href="${opts.adminUrl}" style="display:inline-block;background:#f59e0b;color:#000;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver e editar proposta →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:32px">— Sistema Quantum Technology</p>
    </div>
  `;
}

// ─── Templates M4: Orders ─────────────────────────────────────────────────────

const ORDER_TYPE_LABEL: Record<string, string> = {
  new_feature: "Nova funcionalidade",
  bug_fix:     "Correção de bug",
  new_project: "Novo projeto",
  support:     "Suporte",
  other:       "Outro",
};

const URGENCY_LABEL: Record<string, string> = {
  low:      "Baixa",
  normal:   "Normal",
  high:     "Alta",
  critical: "Crítica",
};

/** Admin: novo pedido recebido */
export function tplOrderReceived(opts: {
  clientEmail: string;
  orderType: string;
  urgency: string;
  description: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px">Novo pedido recebido</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        O cliente <strong style="color:#fff">${opts.clientEmail}</strong> submeteu um novo pedido.
      </p>
      <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:12px;padding:20px;margin-bottom:24px">
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
      <p style="color:#475569;font-size:12px;margin-top:32px">— Sistema Quantum Technology</p>
    </div>
  `;
}

/** Cliente: proposta do admin recebida */
export function tplOrderProposalSent(opts: {
  clientName: string;
  orderType: string;
  estimatedValue: number;
  productionInfo: string;
  orderUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px">Proposta recebida ✦</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 24px">
        A equipa avaliou o seu pedido de <strong style="color:#fff">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</strong>
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
      <p style="color:#475569;font-size:12px;margin-top:32px">— Equipa Quantum Technology</p>
    </div>
  `;
}

/** Admin: cliente aprovou o pedido */
export function tplOrderApprovedAdmin(opts: {
  clientEmail: string;
  orderType: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Pedido aprovado ✓</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        O cliente <strong style="color:#fff">${opts.clientEmail}</strong> aprovou a proposta
        para o pedido de <strong style="color:#fff">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</strong>.
      </p>
      <a href="${opts.adminUrl}" style="display:inline-block;background:#10b981;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver no painel admin →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:32px">— Sistema Quantum Technology</p>
    </div>
  `;
}

/** Admin: cliente pediu revisão */
export function tplOrderRevisionAdmin(opts: {
  clientEmail: string;
  orderType: string;
  adminNote: string;
  adminUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
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
      <p style="color:#475569;font-size:12px;margin-top:32px">— Sistema Quantum Technology</p>
    </div>
  `;
}

/** Cliente: pedido em produção */
export function tplOrderInProduction(opts: {
  clientName: string;
  orderType: string;
  orderUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <h1 style="font-size:22px;font-weight:700;color:#8b5cf6;margin:0 0 8px">O seu pedido está em produção 🚀</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 24px">
        O seu pedido de <strong style="color:#fff">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</strong>
        entrou em produção. Pode acompanhar o estado no seu portal.
      </p>
      <a href="${opts.orderUrl}" style="display:inline-block;background:#8b5cf6;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Acompanhar pedido →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:32px">— Equipa Quantum Technology</p>
    </div>
  `;
}

/** Cliente: pedido concluído */
export function tplOrderCompleted(opts: {
  clientName: string;
  orderType: string;
  orderUrl: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Pedido concluído ✓</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 24px">
        O seu pedido de <strong style="color:#fff">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</strong>
        foi concluído com sucesso. Obrigado pela confiança!
      </p>
      <a href="${opts.orderUrl}" style="display:inline-block;background:#10b981;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver detalhes →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:32px">— Equipa Quantum Technology</p>
    </div>
  `;
}

/** Notificação: nova mensagem na thread do pedido */
export function tplOrderNewMessage(opts: {
  recipientName: string;
  senderRole: "admin" | "client";
  senderEmail?: string;
  orderType: string;
  body: string;
  orderUrl: string;
}) {
  const clientLabel = opts.senderEmail ? `o cliente (${opts.senderEmail})` : "o cliente";
  const senderLabel = opts.senderRole === "admin" ? "a equipa Quantum Technology" : clientLabel;
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px">Nova mensagem no pedido 💬</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.recipientName ? ` ${opts.recipientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 16px">
        Recebeu uma nova mensagem de ${senderLabel} no pedido de
        <strong style="color:#fff">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</strong>.
      </p>
      <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#e2e8f0;font-size:14px;margin:0;white-space:pre-wrap">${opts.body.slice(0, 500)}${opts.body.length > 500 ? "…" : ""}</p>
      </div>
      <a href="${opts.orderUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Responder →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:32px">— Sistema Quantum Technology</p>
    </div>
  `;
}

// ─── Templates M7: Pagamentos ─────────────────────────────────────────────────

/** Cliente: pagamento confirmado → pedido em produção */
export function tplOrderPaymentConfirmed(opts: {
  clientName: string;
  orderType: string;
  orderUrl: string;
  amountCents: number;
}) {
  const amount = (opts.amountCents / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Pagamento confirmado ✓</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 16px">
        O seu pagamento de <strong style="color:#fff">${amount}</strong> para o pedido de
        <strong style="color:#fff">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</strong>
        foi confirmado. O pedido entrou imediatamente em produção.
      </p>
      <div style="background:#10b98115;border:1px solid #10b98130;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#34d399;font-size:14px;margin:0;font-weight:600">🚀 O seu pedido está em produção</p>
      </div>
      <a href="${opts.orderUrl}" style="display:inline-block;background:#10b981;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Acompanhar pedido →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:32px">Obrigado pela confiança!<br/>— Equipa Quantum Technology</p>
    </div>
  `;
}

/** Admin: cliente pagou → pedido em produção */
export function tplOrderPaymentConfirmedAdmin(opts: {
  clientEmail: string;
  orderType: string;
  adminUrl: string;
  amountCents: number;
}) {
  const amount = (opts.amountCents / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Pagamento recebido — pedido em produção ✓</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        O cliente <strong style="color:#fff">${opts.clientEmail}</strong> efetuou o pagamento de
        <strong style="color:#fff">${amount}</strong> para o pedido de
        <strong style="color:#fff">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</strong>.
        O pedido foi automaticamente marcado como <strong style="color:#fff">Em produção</strong>.
      </p>
      <a href="${opts.adminUrl}" style="display:inline-block;background:#10b981;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver no painel admin →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:32px">— Sistema Quantum Technology</p>
    </div>
  `;
}
