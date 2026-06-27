import { ORDER_TYPE_LABEL } from "@/lib/constants";
import { emailLogoHeader, emailFooterSystem } from "./shared";
import { formatCurrencyByCode } from "@/lib/currency";

export function tplOrderPaymentConfirmed(opts: {
  clientName: string;
  orderType: string;
  orderUrl: string;
  amountCents: number;
  currency: string;
}) {
  const amount = formatCurrencyByCode(opts.amountCents / 100, opts.currency);
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Pagamento confirmado</h1>
      <p style="color:#94a3b8;margin:0 0 24px">Olá${opts.clientName ? ` ${opts.clientName}` : ""},</p>
      <p style="color:#94a3b8;margin:0 0 16px">
        O seu pagamento de <strong style="color:#fff">${amount}</strong> para o pedido de
        <strong style="color:#fff">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</strong>
        foi confirmado. O pedido entrou imediatamente em produção.
      </p>
      <div style="background:#10b98115;border:1px solid #10b98130;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#34d399;font-size:14px;margin:0;font-weight:600">O seu pedido está em produção</p>
      </div>
      <a href="${opts.orderUrl}" style="display:inline-block;background:#10b981;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Acompanhar pedido
      </a>
      <p style="color:#475569;font-size:12px;margin-top:32px">Obrigado pela confiança!<br/>— Equipa Quantum Technology</p>
    </div>
  `;
}

export function tplOrderPaymentConfirmedAdmin(opts: {
  clientEmail: string;
  orderType: string;
  adminUrl: string;
  amountCents: number;
  currency: string;
}) {
  const amount = formatCurrencyByCode(opts.amountCents / 100, opts.currency);
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:22px;font-weight:700;color:#10b981;margin:0 0 8px">Pagamento recebido — pedido em produção</h1>
      <p style="color:#94a3b8;margin:0 0 24px">
        O cliente <strong style="color:#fff">${opts.clientEmail}</strong> efetuou o pagamento de
        <strong style="color:#fff">${amount}</strong> para o pedido de
        <strong style="color:#fff">${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}</strong>.
        O pedido foi automaticamente marcado como <strong style="color:#fff">Em produção</strong>.
      </p>
      <a href="${opts.adminUrl}" style="display:inline-block;background:#10b981;color:#fff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Ver no painel admin
      </a>
      ${emailFooterSystem()}
    </div>
  `;
}

/**
 * Enviado ao admin quando o cliente declara que efetuou o pagamento via PIX.
 * O admin deve confirmar manualmente no painel /admin/financeiro/[orderId].
 */
export function tplPixNotifyAdmin(opts: {
  clientName: string;
  clientEmail: string;
  orderRef: string;
  orderType: string;
  adminFinanceiroUrl: string;
  amountCents: number;
}) {
  const amount = (opts.amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return /* html */ `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e2e8f0;padding:32px;border-radius:16px">
      ${emailLogoHeader()}
      <h1 style="font-size:20px;font-weight:700;color:#f59e0b;margin:0 0 8px">PIX declarado pelo cliente</h1>
      <p style="color:#94a3b8;margin:0 0 20px">
        O cliente <strong style="color:#fff">${opts.clientName || opts.clientEmail}</strong>
        declarou que efetuou o pagamento via PIX de
        <strong style="color:#fff">${amount}</strong>
        para o pedido <strong style="color:#fff">${opts.orderRef}</strong>
        (${ORDER_TYPE_LABEL[opts.orderType] ?? opts.orderType}).
      </p>
      <div style="background:#f59e0b15;border:1px solid #f59e0b30;border-radius:12px;padding:16px;margin-bottom:24px">
        <p style="color:#fcd34d;font-size:13px;margin:0;font-weight:600">
          Ação necessária: verifique o extrato PIX e confirme o pagamento manualmente no painel.
        </p>
      </div>
      <a href="${opts.adminFinanceiroUrl}"
         style="display:inline-block;background:#f59e0b;color:#000;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
        Confirmar no painel financeiro
      </a>
      ${emailFooterSystem()}
    </div>
  `;
}

