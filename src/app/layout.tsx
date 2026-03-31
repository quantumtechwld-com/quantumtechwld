import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NoContextMenu from "@/components/NoContextMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://quantumtechwld.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "QuantumTech | Agência de Desenvolvimento de Software e Automação",
    template: "%s | QuantumTech",
  },
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
    "ERP sob medida",
    "agência tecnologia",
  ],
  authors: [{ name: "QuantumTech", url: BASE_URL }],
  creator: "QuantumTech",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "QuantumTech",
    title: "QuantumTech | Agência de Desenvolvimento de Software e Automação",
    description:
      "Sites de alta conversão, sistemas sob medida, automação com n8n e IA. Primeiro MVP em 7 dias. Diagnóstico gratuito.",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuantumTech | Agência de Desenvolvimento de Software e Automação",
    description:
      "Sites de alta conversão, sistemas sob medida, automação com n8n e IA. Primeiro MVP em 7 dias.",
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
    google: "KfTiwTczwh3vhcV7Qz7DN2jHOM8ssx5iw-UvyvGXEO8",
  },
};

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
        url: `${BASE_URL}/favicon.ico`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["Portuguese"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "QuantumTech",
      publisher: { "@id": `${BASE_URL}/#organization` },
      inLanguage: "pt-BR",
    },
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/#webpage`,
      url: BASE_URL,
      name: "QuantumTech | Agência de Desenvolvimento de Software e Automação",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      about: { "@id": `${BASE_URL}/#organization` },
      description:
        "Agência de desenvolvimento de software: sites de alta conversão, sistemas sob medida, automação com n8n e IA.",
      inLanguage: "pt-BR",
    },
    {
      "@type": "ProfessionalService",
      "@id": `${BASE_URL}/#service`,
      name: "QuantumTech — Desenvolvimento de Software",
      provider: { "@id": `${BASE_URL}/#organization` },
      serviceType: [
        "Desenvolvimento Web",
        "Sistemas sob Medida",
        "Automação com n8n",
        "Inteligência Artificial",
      ],
      url: BASE_URL,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NoContextMenu />
        {children}
      </body>
    </html>
  );
}
