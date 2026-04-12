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
  const palette = ["#9B59FF", "#C084FC", "#22D4C2", "#A78BFA", "#7C3AED"];
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
      { attr: { r: 1.8 }, opacity: 0.9 },
      { attr: { r: 3.5 }, opacity: 0.15, duration: 1.1 + i * 0.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.28 }
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

      {/* ─ Glow blobs de fundo — Superposição ─ */}
      <circle data-glow="cyan"   cx="14" cy="20" r="9"  fill="#9B59FF" opacity="0.08" filter="url(#ald-glow-lg)" />
      <circle data-glow="violet" cx="26" cy="20" r="9"  fill="#C084FC" opacity="0.09" filter="url(#ald-glow-lg)" />
      <circle data-glow="green"  cx="20" cy="20" r="5"  fill="#22D4C2" opacity="0.00" filter="url(#ald-glow-lg)" />

      {/* ─ Loop esquerdo — estado |0⟩ ─ */}
      <path data-draw="1"
        d="M20,20 C20,20 5,8 5,20 C5,32 20,20 20,20"
        stroke="#9B59FF" strokeWidth="1.8" strokeLinecap="round" fill="none"
        filter="url(#ald-glow-sm)" />

      {/* ─ Loop direito — estado |1⟩ ─ */}
      <path data-draw="2"
        d="M20,20 C20,20 35,8 35,20 C35,32 20,20 20,20"
        stroke="#C084FC" strokeWidth="1.8" strokeLinecap="round" fill="none"
        filter="url(#ald-glow-sm)" />

      {/* ─ Linha de superposição (eixo quântico) ─ */}
      <path data-draw="3" d="M5,20 L35,20"
        stroke="#22D4C2" strokeWidth="0.6" strokeLinecap="round" opacity="0.35" />

      {/* ─ Ring rotativo no ponto de intersecção ─ */}
      <circle
        data-ring
        cx="20" cy="20" r="5.5"
        stroke="#9B59FF"
        strokeWidth="0.5"
        strokeDasharray="2 5"
        opacity="0.35"
      />

      {/* ─ Nós extremos ─ */}
      <circle data-node="corner" cx="5"  cy="20" r="1.8" fill="#9B59FF" filter="url(#ald-glow-sm)" />
      <circle data-node="corner" cx="35" cy="20" r="1.8" fill="#C084FC" filter="url(#ald-glow-sm)" />

      {/* ─ Nó central — ponto de intersecção ─ */}
      <circle data-node="center" cx="20" cy="20" r="2.5" fill="#ffffff" opacity="0.92" filter="url(#ald-glow-lg)" />
    </svg>
  );
}
