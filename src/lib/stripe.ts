import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  // Em produção a variável deve estar no .env.production.local.
  // Logar aviso em vez de derrubar o processo no startup do PM2.
  console.warn("[stripe] STRIPE_SECRET_KEY não definida — operações Stripe falharão.");
}

export const stripe = new Stripe(stripeKey ?? "", {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});
