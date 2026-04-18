"use client";

import Script from "next/script";
import { useRef, useState } from "react";

const CHART = `flowchart TD
    A[Código no Repositório] --> B[Camada 1: Qualidade & Segurança<br>ESLint + SonarQube + SAST]
    A --> C[Camada 2: Next.js & Deploy<br>Security Headers + CSP + CSRF]
    A --> D[Camada 3: Banco de Dados & ORM<br>Prisma + Validação + Rate Limiting]

    B --> E[Análise Estática +<br>Vulnerabilidades]
    C --> F[Headers + Auth +<br>Middleware]
    D --> G[Validação de Input +<br>Query Safety]

    E --> H[Pipeline CI/CD Integrado<br>GitHub Actions com Gates de Segurança]
    F --> H
    G --> H

    H --> I{Deploy na Produção<br>Aprovado?}
    I -- Sim --> J[Produção<br>+ Monitoramento Sentry]
    I -- Não --> K[Relatório com<br>Falhas de Segurança]`;

export function MermaidViewer() {
  const [rendered, setRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function handleLoad() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mermaid = (globalThis as any).mermaid;
    if (!mermaid) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        primaryColor: "#1e293b",
        primaryTextColor: "#e2e8f0",
        primaryBorderColor: "#6366f1",
        lineColor: "#818cf8",
        secondaryColor: "#0f172a",
        tertiaryColor: "#1e293b",
        background: "#0f172a",
        nodeBorder: "#6366f1",
        clusterBkg: "#1e293b",
        titleColor: "#e2e8f0",
        edgeLabelBackground: "#1e293b",
      },
      flowchart: { curve: "basis", htmlLabels: true },
    });

    if (containerRef.current) {
      const { svg } = await mermaid.render("mermaid-diagram", CHART);
      containerRef.current.innerHTML = svg;
    }
    setRendered(true);
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
        strategy="afterInteractive"
        onLoad={handleLoad}
      />

      <div
        ref={containerRef}
        className={`transition-opacity duration-500 ${rendered ? "opacity-100" : "opacity-0"}`}
      />

      {!rendered && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm animate-pulse">
          Carregando diagrama…
        </div>
      )}
    </>
  );
}
