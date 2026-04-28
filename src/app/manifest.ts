import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QuantumTech — Agência de Software",
    short_name: "QuantumTech",
    description:
      "Cartão de visita digital · Sistemas sob medida, web e automação com IA",
    start_url: "/card",
    display: "standalone",
    background_color: "#050816",
    theme_color: "#9B59FF",
    orientation: "portrait",
    icons: [
      {
        src: "/images/logo/logo-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logo/logo-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/logo/logo-symbol.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
