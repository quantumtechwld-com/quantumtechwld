"use client";

import { useEffect, useRef } from "react";

// ── Helpers de animação extraídos para não ultrapassar 4 níveis de aninhamento ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function animateTravelingLight(gsap: any, svg: SVGSVGElement) {
  svg.querySelectorAll<SVGPathElement>("[data-draw]").forEach((path, i) => {
    const len = path.getTotalLength();
    const traceLen = len * 0.42;
    const gap = len * 2;
    const speed = 2.2 + i * 0.28;
    gsap.set(path, { strokeDasharray: `${traceLen} ${gap}`, strokeDashoffset: len + traceLen });
    gsap.to(path, { strokeDashoffset: -(len + traceLen), duration: speed, repeat: -1, ease: "none", delay: i * 0.32 });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function animateColorShift(gsap: any, svg: SVGSVGElement) {
  const palette = ["#22d3ee", "#a78bfa", "#34d399", "#60a5fa", "#f472b6"];
  svg.querySelectorAll<SVGPathElement>("[data-draw]").forEach((path, i) => {
    gsap.to(path, {
      stroke: palette[(i + 2) % palette.length],
      duration: 3.5 + i * 0.4,
      repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.55,
    });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function animateCornerNodes(gsap: any, svg: SVGSVGElement) {
  svg.querySelectorAll<SVGCircleElement>("[data-node='corner']").forEach((node, i) => {
    gsap.fromTo(
      node,
      { attr: { r: 1.5 }, opacity: 0.7 },
      { attr: { r: 2.8 }, opacity: 0.2, duration: 1.1 + i * 0.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.28 }
    );
  });
}

/**
 * LogoAnimated — marca SVG animada com GSAP.
 *
 * Efeitos:
 *  1. "Luz viajante" em cada path (snake de luz que percorre a linha em loop)
 *  2. Glow pulsante com variação de cor (cyan ↔ violeta ↔ verde)
 *  3. Nós brilhantes nos cruzamentos das linhas com pulso independente
 */
export default function LogoAnimated({ size = 36 }: Readonly<{ size?: number }>) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any;

    (async () => {
      const { gsap } = await import("gsap");
      const svg = svgRef.current;
      if (!svg) return;

      ctx = gsap.context(() => {

        // ── 1. LUZ VIAJANTE (técnica: dasharray snake) ───────────────────
        animateTravelingLight(gsap, svg);

        // ── 2. GLOW BLOBS pulsando ────────────────────────────────────────
        gsap.fromTo("[data-glow='cyan']",
          { attr: { r: 11 }, opacity: 0.07 },
          { attr: { r: 15 }, opacity: 0.18, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" }
        );
        gsap.fromTo("[data-glow='violet']",
          { attr: { r: 8 }, opacity: 0.09 },
          { attr: { r: 12 }, opacity: 0.22, duration: 1.7, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.9 }
        );
        gsap.fromTo("[data-glow='green']",
          { attr: { r: 5 }, opacity: 0 },
          { attr: { r: 9 }, opacity: 0.14, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.7 }
        );

        // ── 3. VARIAÇÃO DE COR nos paths ─────────────────────────────────
        animateColorShift(gsap, svg);

        // ── 4. NÓS dos cantos ────────────────────────────────────────────
        animateCornerNodes(gsap, svg);

        // ── 5. NÓ CENTRAL ────────────────────────────────────────────────
        gsap.fromTo("[data-node='center']",
          { attr: { r: 2.5 }, opacity: 0.9 },
          { attr: { r: 4.5 }, opacity: 0.25, duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut" }
        );

        // ── 6. RING rotativo ─────────────────────────────────────────────
        gsap.to("[data-ring]", { rotation: 360, duration: 8, repeat: -1, ease: "none", transformOrigin: "20px 20px" });

      }, svg);
    })();

    return () => ctx?.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="QuantumTech logo mark"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Glow suave para paths */}
        <filter id="ald-glow-sm" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Glow intenso para blobs e nó central */}
        <filter id="ald-glow-lg" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ─ Glow blobs de fundo ─ */}
      <circle data-glow="cyan"   cx="20" cy="20" r="11" fill="#22d3ee" opacity="0.07" filter="url(#ald-glow-lg)" />
      <circle data-glow="violet" cx="20" cy="20" r="8"  fill="#818cf8" opacity="0.09" filter="url(#ald-glow-lg)" />
      <circle data-glow="green"  cx="20" cy="20" r="5"  fill="#34d399" opacity="0.00" filter="url(#ald-glow-lg)" />

      {/* ─ Colchetes de canto (circuit brackets) ─ */}
      <path data-draw="1" d="M3,14 L3,3 L14,3"   stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#ald-glow-sm)" />
      <path data-draw="2" d="M26,3 L37,3 L37,14"  stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#ald-glow-sm)" />
      <path data-draw="3" d="M37,26 L37,37 L26,37" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#ald-glow-sm)" />
      <path data-draw="4" d="M14,37 L3,37 L3,26"  stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#ald-glow-sm)" />

      {/* ─ Diagonais internas (X central) ─ */}
      <path data-draw="5" d="M7,7 L20,20 L33,7"  stroke="#a78bfa" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" filter="url(#ald-glow-sm)" />
      <path data-draw="6" d="M7,33 L20,20 L33,33" stroke="#a78bfa" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" filter="url(#ald-glow-sm)" />

      {/* ─ Cruz central ─ */}
      <path data-draw="7" d="M20,5 L20,35" stroke="#34d399" strokeWidth="0.7" strokeLinecap="round" opacity="0.55" />
      <path data-draw="8" d="M5,20 L35,20" stroke="#34d399" strokeWidth="0.7" strokeLinecap="round" opacity="0.55" />

      {/* ─ Ring rotativo ao redor do centro ─ */}
      <circle
        data-ring
        cx="20" cy="20" r="4.5"
        stroke="#22d3ee"
        strokeWidth="0.6"
        strokeDasharray="4 3"
        opacity="0.45"
      />

      {/* ─ Nós dos cantos ─ */}
      <circle data-node="corner" cx="3"  cy="3"  r="1.5" fill="#22d3ee" filter="url(#ald-glow-sm)" />
      <circle data-node="corner" cx="37" cy="3"  r="1.5" fill="#22d3ee" filter="url(#ald-glow-sm)" />
      <circle data-node="corner" cx="37" cy="37" r="1.5" fill="#22d3ee" filter="url(#ald-glow-sm)" />
      <circle data-node="corner" cx="3"  cy="37" r="1.5" fill="#22d3ee" filter="url(#ald-glow-sm)" />

      {/* ─ Nó central ─ */}
      <circle data-node="center" cx="20" cy="20" r="2.5" fill="#a78bfa" opacity="0.9" filter="url(#ald-glow-lg)" />
    </svg>
  );
}
