import type { Metadata } from "next";
import CardClient from "@/components/card/CardClient";

export const metadata: Metadata = {
  title: "Cartão Digital | QuantumTech",
  description:
    "Cartão de visita digital da QuantumTech — Agência de Desenvolvimento de Software e Automação.",
  openGraph: {
    title: "QuantumTech — Cartão Digital",
    description: "Construímos produtos digitais que crescem.",
    url: "https://quantumtechwld.com/card",
    siteName: "QuantumTech",
    locale: "pt_BR",
    type: "website",
  },
};

export default function CardPage() {
  return <CardClient />;
}
