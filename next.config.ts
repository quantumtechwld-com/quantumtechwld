import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  {
    key:   "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key:   "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",   // Next.js requires unsafe-inline/unsafe-eval in dev; tighten in prod if using nonces
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data:",
      "font-src 'self'",
      "connect-src 'self' https://api.stripe.com https://o4511237754978304.ingest.us.sentry.io",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Remove source maps do bundle de produção — impede que o código original
  // seja exibido no DevTools do browser mesmo após minificação
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  async headers() {
    return [
      {
        source:  "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(
  withNextIntl(nextConfig),
  {
    org: "quantumtechwld-com",
    project: "quantum-agency",
    // Upload source maps somente quando SENTRY_AUTH_TOKEN estiver presente (CI)
    authToken: process.env.SENTRY_AUTH_TOKEN,
    // Não adicionar source maps ao bundle do browser (já bloqueado acima)
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },
    // Silencia o output do Sentry no build local
    silent: !process.env.CI,
    // Não bloqueia o build se o upload do Sentry falhar
    errorHandler(err: Error) {
      console.warn(`Sentry upload falhou (não crítico): ${err.message}`);
    },
  }
);
