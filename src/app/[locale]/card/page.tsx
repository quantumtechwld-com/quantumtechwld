import type { Metadata } from "next";
import CardClient from "@/components/card/CardClient";

const BASE_URL = "https://quantumtechwld.com";

const copy = {
  pt: {
    title: "Cartão Digital | QuantumTech",
    description: "Cartão de visita digital da QuantumTech — Agência de Desenvolvimento de Software e Automação.",
    ogTitle: "QuantumTech — Cartão Digital",
    ogDescription: "Construímos produtos digitais que crescem.",
    ogLocale: "pt_BR",
    url: `${BASE_URL}/card`,
  },
  en: {
    title: "Digital Business Card | QuantumTech",
    description: "QuantumTech digital business card — Software Development & Automation Agency.",
    ogTitle: "QuantumTech — Digital Business Card",
    ogDescription: "We build digital products that grow.",
    ogLocale: "en_US",
    url: `${BASE_URL}/en/card`,
  },
  es: {
    title: "Tarjeta Digital | QuantumTech",
    description: "Tarjeta de visita digital de QuantumTech — Agencia de Desarrollo de Software y Automatización.",
    ogTitle: "QuantumTech — Tarjeta Digital",
    ogDescription: "Construimos productos digitales que crecen.",
    ogLocale: "es_ES",
    url: `${BASE_URL}/es/card`,
  },
} as const;

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const d = copy[locale as keyof typeof copy] ?? copy.pt;

  return {
    title: { absolute: d.title },
    description: d.description,
    alternates: {
      canonical: d.url,
      languages: {
        "pt-BR": `${BASE_URL}/card`,
        "en-US": `${BASE_URL}/en/card`,
        "es-ES": `${BASE_URL}/es/card`,
      },
    },
    openGraph: {
      title: d.ogTitle,
      description: d.ogDescription,
      url: d.url,
      siteName: "QuantumTech",
      locale: d.ogLocale,
      type: "website",
    },
  };
}

export default function CardPage() {
  return <CardClient />;
}
