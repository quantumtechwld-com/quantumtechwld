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

// Re-export all templates so existing imports keep working
export { tplProposalSent, tplProposalApproved, tplProposalApprovedClient, tplRevisionRequested } from "./email-templates/proposal";
export { tplOrderReceived, tplOrderProposalSent, tplOrderApprovedAdmin, tplOrderRevisionAdmin, tplOrderInProduction, tplOrderCompleted, tplOrderNewMessage } from "./email-templates/orders";
export { tplOrderPaymentConfirmed, tplOrderPaymentConfirmedAdmin } from "./email-templates/payments";
