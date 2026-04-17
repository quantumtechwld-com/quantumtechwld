import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Captura 10% das transações server-side para performance
  tracesSampleRate: 0.1,

  // Não enviar em desenvolvimento local
  enabled: process.env.NODE_ENV === "production",
});
