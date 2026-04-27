import { emailLogoHeader, emailFooterTeam, emailFooterSystem } from "./shared";
import { formatCurrencyRangeByCode } from "@/lib/currency";

export function tplProposalSent(opts: {
  clientName: string;
  projectType: string;
  proposalUrl: string;
  costMin: number;
  costMax: number;
  costCurrency: string;
  hoursTotal: number;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px">Sua proposta está pronta ✦</h1>
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
            <td style="color:#fff;font-weight:600;font-size:18px">${formatCurrencyRangeByCode(opts.costMin, opts.costMax, opts.costCurrency)}</td>
          </tr>
        </table>
      </div>
      <a href="${opts.proposalUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver proposta completa →
      </a>
      <p style="color:#94a3b8;font-size:13px;margin-top:32px">Se tiver dúvidas, responda a este e-mail ou entre em contacto connosco.</p>
      ${emailFooterTeam()}
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
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Proposta aprovada ✓</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        O cliente <strong style="color:#fff">${opts.clientEmail}</strong> aprovou a proposta 
        para o projeto <strong style="color:#fff">${opts.projectType}</strong>.
      </p>
      <a href="${opts.adminUrl}" style="display:inline-block;background:#10b981;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver no painel admin →
      </a>
      ${emailFooterSystem()}
    </div>
  `;
}

export function tplProposalApprovedClient(opts: {
  clientName: string;
  projectType: string;
}) {
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Proposta aprovada — bem-vindo a bordo! 🚀</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 16px">
        Sua aprovação foi registrada para o projeto <strong style="color:#fff">${opts.projectType}</strong>.
      </p>
      <p style="color:#94a3b8;margin:0 0 24px">
        Nossa equipe entrará em contato em breve para agendar o kickoff e iniciar o desenvolvimento.
      </p>
      <p style="color:#475569;font-size:12px;margin-top:32px">
        Obrigado pela confiança!<br/>— Equipe Quantum Technology
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
      ${emailLogoHeader()}
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
      ${emailFooterSystem()}
    </div>
  `;
}
