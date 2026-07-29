import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://quantumtechwld.com";

type Locale = (typeof routing.locales)[number];

// ── Metadados por locale ──────────────────────────────────────────────────────
const localeData: Record<Locale, {
  title: string;
  description: string;
  keywords: string[];
  ogLocale: string;
  url: string;
  jsonLdLang: string;
}> = {
  pt: {
    title: "QuantumTech | Agência de Desenvolvimento de Software e Automação",
    description:
      "Agência de desenvolvimento de software: sites de alta conversão, sistemas sob medida, automação com n8n e IA. Primeiro MVP em 7 dias. Diagnóstico técnico gratuito.",
    keywords: [
      "agência de desenvolvimento de software",
      "desenvolvimento web",
      "automação n8n",
      "sistemas sob medida",
      "landing page alta conversão",
      "MVP rápido",
      "inteligência artificial",
      "CRM personalizado",
    ],
    ogLocale: "pt_BR",
    url: BASE_URL,
    jsonLdLang: "pt-BR",
  },
  en: {
    title: "QuantumTech | Software Development & Automation Agency",
    description:
      "Software development agency: high-conversion websites, custom systems, n8n and AI automation. First MVP in 7 days. Free technical diagnosis.",
    keywords: [
      "software development agency",
      "web development",
      "n8n automation",
      "custom systems",
      "high-conversion landing page",
      "fast MVP",
      "artificial intelligence",
      "custom CRM",
    ],
    ogLocale: "en_US",
    url: `${BASE_URL}/en`,
    jsonLdLang: "en",
  },
  es: {
    title: "QuantumTech | Agencia de Desarrollo de Software y Automatización",
    description:
      "Agencia de desarrollo de software: sitios de alta conversión, sistemas a medida, automatización con n8n e IA. Primer MVP en 7 días. Diagnóstico técnico gratuito.",
    keywords: [
      "agencia de desarrollo de software",
      "desarrollo web",
      "automatización n8n",
      "sistemas a medida",
      "landing page alta conversión",
      "MVP rápido",
      "inteligencia artificial",
      "CRM personalizado",
    ],
    ogLocale: "es_ES",
    url: `${BASE_URL}/es`,
    jsonLdLang: "es",
  },
};

// ── generateMetadata ──────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const d = localeData[locale as Locale] ?? localeData.pt;

  return {
    metadataBase: new URL(BASE_URL),
    title: { absolute: d.title },
    description: d.description,
    keywords: d.keywords,
    authors: [{ name: "QuantumTech", url: BASE_URL }],
    creator: "QuantumTech",
    alternates: {
      canonical: d.url,
      languages: {
        "pt":       BASE_URL,
        "en":       `${BASE_URL}/en`,
        "es":       `${BASE_URL}/es`,
        "x-default": BASE_URL,
      },
    },
    openGraph: {
      type: "website",
      locale: d.ogLocale,
      url: d.url,
      siteName: "QuantumTech",
      title: d.title,
      description: d.description,
      images: [
        {
          url: `${BASE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "QuantumTech — Agência de Desenvolvimento de Software e Automação",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: d.title,
      description: d.description,
      images: [`${BASE_URL}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      // eslint-disable-next-line no-secrets/no-secrets
      google: "KfTiwTczwh3vhcV7Qz7DN2jHOM8ssx5iw-UvyvGXEO8",
    },
  };
}

// ── generateStaticParams ──────────────────────────────────────────────────────
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const d = localeData[locale as Locale] ?? localeData.pt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "QuantumTech",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/images/logo/logo-dark-square@400x400.png`,
          width: 400,
          height: 400,
        },
        sameAs: [
          "https://www.linkedin.com/company/quantumtech-software-agency/",
          "https://www.instagram.com/quantumscale.dev/",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "QuantumTech",
        publisher: { "@id": `${BASE_URL}/#organization` },
        inLanguage: d.jsonLdLang,
      },
      {
        "@type": "WebPage",
        "@id": `${d.url}/#webpage`,
        url: d.url,
        name: d.title,
        isPartOf: { "@id": `${BASE_URL}/#website` },
        about: { "@id": `${BASE_URL}/#organization` },
        description: d.description,
        inLanguage: d.jsonLdLang,
      },
      {
        "@type": "ProfessionalService",
        "@id": `${BASE_URL}/#business`,
        name: "QuantumTech",
        url: BASE_URL,
        description:
          "Agência de desenvolvimento de software: sistemas sob medida, websites de alta conversão e automação com IA e n8n.",
        areaServed: ["Brazil", "Portugal", "Europe", "United States"],
        priceRange: "$$$",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "48",
          bestRating: "5",
          worstRating: "1",
        },
        parentOrganization: { "@id": `${BASE_URL}/#organization` },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
