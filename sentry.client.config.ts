import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Captura 10% das sessões para Session Replay (só em produção)
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  // Captura 100% das sessões que tiveram erro
  replaysOnErrorSampleRate: 1.0,

  // Captura 10% das transações para performance
  tracesSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      // Mascara dados sensíveis no replay
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Não enviar em desenvolvimento local
  enabled: process.env.NODE_ENV === "production",

  // Ignora erros comuns de extensões de browser / bots
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error exception captured",
    /^Loading chunk \d+ failed/,
    /^Loading CSS chunk \d+ failed/,
  ],
});
