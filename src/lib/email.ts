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
  /** Versão plaintext (melhora entregabilidade e evita spam) */
  text?: string;
  replyTo?: string;
}

/** Remove tags HTML para gerar versão plaintext sem acionar lint unicorn/prefer-string-replace-all */
function stripHtml(html: string): string {
  return html.split(/(<[^>]*>)/).filter((s) => !s.startsWith("<")).join(" ").split(/\s+/).filter(Boolean).join(" ");
}

export async function sendMail({ to, subject, html, text, replyTo }: MailOptions) {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM ?? "Quantum Tech <noreply@quantumtechwld.com>",
    to,
    subject,
    html,
    // Sempre incluir versão texto simples: filtros anti-spam penalizam emails só HTML
    text:    text ?? stripHtml(html),
    ...(replyTo ? { replyTo } : {}),
    headers: {
      "X-Mailer":  "Quantum Tech Portal",
      "X-Priority": "3",
      // Categoria transacional — ajuda provedores a classificar corretamente
      "X-Entity-Ref-ID": `qt-${Date.now()}`,
    },
  });
}

// Re-export all templates so existing imports keep working
export { tplProposalSent, tplProposalApproved, tplProposalApprovedClient, tplRevisionRequested } from "./email-templates/proposal";
export { tplOrderReceived, tplOrderProposalSent, tplOrderApprovedAdmin, tplOrderRevisionAdmin, tplOrderInProduction, tplOrderCompleted, tplOrderInReview, tplOrderReviewApprovedAdmin, tplOrderNewMessage } from "./email-templates/orders";
export { tplOrderPaymentConfirmed, tplOrderPaymentConfirmedAdmin, tplPixNotifyAdmin } from "./email-templates/payments";
export { tplLeadConfirmation, tplLeadFollowUp3Days, tplLeadFollowUp7Days } from "./email-templates/lead";
export { tplProposalSentToClient, tplProposalApprovedByClient, tplProposalRevisionRequested, tplProposalRejectedByClient } from "./email-templates/proposals";
