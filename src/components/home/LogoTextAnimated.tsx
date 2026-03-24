"use client";

import { useEffect, useRef } from "react";

const TEXT = "QuantumTech";
const TECH_START = 7;
const CHARS = TEXT.split("");
const DASH = 500;
const COLOR_QUANTUM = "#C4C4CC"; // alumínio
const COLOR_TECH = "#22d3ee";    // cyan-400 (igual ao original)

/** Aplica posições exatas de cada char com base no elemento de medição do browser. */
function applyCharPositions(svg: SVGSVGElement, measureEl: SVGTextElement) {
  CHARS.forEach((_, i) => {
    try {
      const { x } = measureEl.getStartPositionOfChar(i);
      svg.querySelectorAll<SVGTextElement>(`[data-char="${i}"]`).forEach((el) => {
        el.setAttribute("x", String(x));
      });
    } catch {
      // espaço em branco pode lançar em alguns browsers — ignora
    }
  });
}

/** Adiciona as animações de escrita letra a letra na timeline GSAP. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildWritingTimeline(tl: any) {
  CHARS.forEach((ch, i) => {
    if (ch === " ") return;
    tl.to(`[data-layer='stroke'][data-char='${i}']`, {
      strokeDashoffset: 0,
      duration: 0.44,
      ease: "power1.inOut",
    });
    tl.set(`[data-layer='fill'][data-char='${i}']`, { opacity: 1 }, ">-0.05");
  });
}

/**
 * LogoTextAnimated — "QuantumTech" com efeito de escrita letra a letra.
 *
 * Comportamento:
 *  - Cada letra é "desenhada" via strokeDashoffset (traço percorre o contorno)
 *  - Ao finalizar o traço, a letra fica preenchida em alumínio permanentemente
 *  - Quando a última letra termina, pausa breve e o ciclo recomeça do zero
 */
export default function LogoTextAnimated() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any;

    (async () => {
      const { gsap } = await import("gsap");
      const svg = svgRef.current;
      if (!svg) return;

      const measureEl = svg.querySelector<SVGTextElement>("[data-measure]");
      if (measureEl && typeof measureEl.getStartPositionOfChar === "function") {
        applyCharPositions(svg, measureEl);
      }

      ctx = gsap.context(() => {
        gsap.set("[data-layer='stroke']", { strokeDasharray: DASH, strokeDashoffset: DASH });
        gsap.set("[data-layer='fill']", { opacity: 0 });

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
        buildWritingTimeline(tl);

        // Pausa com todas as letras visíveis antes de reiniciar
        tl.to({}, { duration: 1.1 });

        // Reset instantâneo — próximo ciclo começa em branco
        tl.set("[data-layer='stroke']", { strokeDashoffset: DASH });
        tl.set("[data-layer='fill']", { opacity: 0 });
      }, svg);
    })();

    return () => ctx?.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 160 24"
      width={160}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="QuantumTech"
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        <filter id="txt-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Elemento de medição invisível — fornece posições reais de cada char */}
      <text
        data-measure
        x="0"
        y="19"
        fontSize="18"
        fontWeight="700"
        letterSpacing="-0.025em"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        fill="transparent"
        stroke="none"
        aria-hidden="true"
      >
        {TEXT}
      </text>

      {/* Camada de preenchimento: letras alumínio reveladas ao serem "escritas" */}
      {CHARS.map((ch, i) => (
        <text
          key={`fill-${ch}${i}`}
          data-layer="fill"
          data-char={i}
          x="0"
          y="19"
          fontSize="18"
          fontWeight="700"
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
          fill={i < TECH_START ? COLOR_QUANTUM : COLOR_TECH}
          opacity={0}
          aria-hidden="true"
        >
          {ch}
        </text>
      ))}

      {/* Camada de traço: anima o contorno de cada glifo individualmente */}
      {CHARS.map((ch, i) =>
        ch === " " ? null : (
          <text
            key={`stroke-${ch}${i}`}
            data-layer="stroke"
            data-char={i}
            x="0"
            y="19"
            fontSize="18"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
            fill="none"
            stroke={i < TECH_START ? COLOR_QUANTUM : COLOR_TECH}
            strokeWidth="0.6"
            filter="url(#txt-glow)"
            aria-hidden="true"
          >
            {ch}
          </text>
        )
      )}
    </svg>
  );
}
