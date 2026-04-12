"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// /demo/logo — Explorador de símbolos de logo
// 5 conceitos SVG animados com GSAP (luz viajante + glow pulsante)
// ─────────────────────────────────────────────────────────────────────────────

const ACC = "#9B59FF";   // Plasma Violeta
const ACCC = "#C084FC";  // violeta claro
const CYAN = "#22D4C2";
const BG   = "#07050F";

/* ── helpers GSAP reutilizáveis (módulo level) ───────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function travelingLight(gsap: any, svg: SVGSVGElement) {
  svg.querySelectorAll<SVGPathElement>("[data-draw]").forEach((path, i) => {
    const len = path.getTotalLength();
    const trace = len * 0.38;
    const gap = len * 2;
    gsap.set(path, { strokeDasharray: `${trace} ${gap}`, strokeDashoffset: len + trace });
    gsap.to(path, { strokeDashoffset: -(len + trace), duration: 2.4 + i * 0.3, repeat: -1, ease: "none", delay: i * 0.35 });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pulseGlows(gsap: any, svg: SVGSVGElement) {
  svg.querySelectorAll<SVGCircleElement>("[data-glow]").forEach((el, i) => {
    const r0 = Number(el.getAttribute("r") ?? 8);
    gsap.fromTo(el,
      { attr: { r: r0 }, opacity: 0.08 },
      { attr: { r: r0 * 1.45 }, opacity: 0.22, duration: 1.8 + i * 0.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.6 }
    );
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pulseNodes(gsap: any, svg: SVGSVGElement) {
  svg.querySelectorAll<SVGCircleElement>("[data-node]").forEach((el, i) => {
    const r0 = Number(el.getAttribute("r") ?? 2);
    gsap.fromTo(el,
      { attr: { r: r0 }, opacity: 0.9 },
      { attr: { r: r0 * 2 }, opacity: 0.15, duration: 1.2 + i * 0.25, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.3 }
    );
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function spinRing(gsap: any, svg: SVGSVGElement) {
  svg.querySelectorAll("[data-ring]").forEach((el, i) => {
    const dir = i % 2 === 0 ? 360 : -360;
    gsap.to(el, { rotation: dir, duration: 7 + i * 2, repeat: -1, ease: "none", transformOrigin: "20px 20px" });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function runAll(gsap: any, svg: SVGSVGElement) {
  travelingLight(gsap, svg);
  pulseGlows(gsap, svg);
  pulseNodes(gsap, svg);
  spinRing(gsap, svg);
}

/* ── Wrapper de animação ─────────────────────────────────────────────────── */
function AnimatedLogo({ children, id }: Readonly<{ children: React.ReactNode; id: string }>) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any;
    (async () => {
      const { gsap } = await import("gsap");
      const svg = ref.current;
      if (!svg) return;
      ctx = gsap.context(() => { runAll(gsap, svg); }, svg);
    })();
    return () => ctx?.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <svg ref={ref} viewBox="0 0 40 40" width="100%" height="100%"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }} aria-hidden="true">
      <defs>
        <filter id={`glow-sm-${id}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`glow-lg-${id}`} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {children}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SÍMBOLO A — Qubit (orbital curvado + núcleo)
   Conceito: representação estilizada de um qubit — elipses orbitais
   como electrões à volta de um núcleo atómico. Referência directa à
   física quântica. Paths curvados dão elegância.
   ══════════════════════════════════════════════════════════════════════════ */
function SymbolQubit({ id }: Readonly<{ id: string }>) {
  const f = `url(#glow-sm-${id})`;
  const fl = `url(#glow-lg-${id})`;
  return (
    <AnimatedLogo id={id}>
      {/* glows */}
      <circle data-glow cx="20" cy="20" r="9"  fill={ACC}  opacity="0.08" filter={fl} />
      <circle data-glow cx="20" cy="20" r="5"  fill={CYAN} opacity="0.10" filter={fl} />
      {/* órbita 1 — elipse inclinada 45° */}
      <ellipse data-draw="1" cx="20" cy="20" rx="13" ry="5"
        stroke={ACC} strokeWidth="1.5" strokeLinecap="round"
        filter={f} transform="rotate(45 20 20)" />
      {/* órbita 2 — elipse inclinada -45° */}
      <ellipse data-draw="2" cx="20" cy="20" rx="13" ry="5"
        stroke={ACCC} strokeWidth="1.5" strokeLinecap="round"
        filter={f} transform="rotate(-45 20 20)" />
      {/* órbita 3 — horizontal */}
      <ellipse data-draw="3" cx="20" cy="20" rx="13" ry="5"
        stroke={CYAN} strokeWidth="0.8" strokeLinecap="round" opacity="0.5"
        filter={f} />
      {/* núcleo */}
      <circle data-node cx="20" cy="20" r="2.5" fill={ACCC} opacity="0.95" filter={fl} />
    </AnimatedLogo>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SÍMBOLO B — Psi (ψ) geométrico
   Conceito: a letra Psi (ψ) é o símbolo universal da função de onda
   quântica. Aqui reinterpretada como forma geométrica com linhas de circuito.
   ══════════════════════════════════════════════════════════════════════════ */
function SymbolPsi({ id }: Readonly<{ id: string }>) {
  const f = `url(#glow-sm-${id})`;
  const fl = `url(#glow-lg-${id})`;
  return (
    <AnimatedLogo id={id}>
      <circle data-glow cx="20" cy="20" r="10" fill={ACC}  opacity="0.09" filter={fl} />
      <circle data-glow cx="20" cy="20" r="5"  fill={CYAN} opacity="0.10" filter={fl} />
      {/* coluna central */}
      <path data-draw="1" d="M20,6 L20,38" stroke={ACCC} strokeWidth="2" strokeLinecap="round" filter={f} />
      {/* arco esquerdo */}
      <path data-draw="2" d="M8,10 C8,10 8,24 20,24" stroke={ACC} strokeWidth="1.8" strokeLinecap="round" fill="none" filter={f} />
      {/* arco direito */}
      <path data-draw="3" d="M32,10 C32,10 32,24 20,24" stroke={ACC} strokeWidth="1.8" strokeLinecap="round" fill="none" filter={f} />
      {/* degrau base */}
      <path data-draw="4" d="M13,38 L27,38" stroke={CYAN} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" filter={f} />
      {/* nós */}
      <circle data-node cx="8"  cy="10" r="1.8" fill={ACC}  filter={fl} />
      <circle data-node cx="32" cy="10" r="1.8" fill={ACC}  filter={fl} />
      <circle data-node cx="20" cy="24" r="2.2" fill={ACCC} filter={fl} />
    </AnimatedLogo>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SÍMBOLO C — Porta Lógica Quântica
   Conceito: representação de uma porta quântica (quantum gate) — 
   quadrado com circuito interno e linhas de qubits a entrar/sair.
   Associação directa a computação quântica + engenharia de software.
   ══════════════════════════════════════════════════════════════════════════ */
function SymbolGate({ id }: Readonly<{ id: string }>) {
  const f = `url(#glow-sm-${id})`;
  const fl = `url(#glow-lg-${id})`;
  return (
    <AnimatedLogo id={id}>
      <circle data-glow cx="20" cy="20" r="9"  fill={ACC}  opacity="0.09" filter={fl} />
      <circle data-glow cx="20" cy="20" r="5"  fill={CYAN} opacity="0.10" filter={fl} />
      {/* quadrado da gate */}
      <path data-draw="1" d="M10,10 L30,10 L30,30 L10,30 Z"
        stroke={ACC} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" filter={f} />
      {/* linhas de qubit — entrada esquerda */}
      <path data-draw="2" d="M2,16 L10,16" stroke={CYAN} strokeWidth="1.2" strokeLinecap="round" filter={f} />
      <path data-draw="3" d="M2,24 L10,24" stroke={CYAN} strokeWidth="1.2" strokeLinecap="round" filter={f} />
      {/* linhas de qubit — saída direita */}
      <path data-draw="4" d="M30,16 L38,16" stroke={ACCC} strokeWidth="1.2" strokeLinecap="round" filter={f} />
      <path data-draw="5" d="M30,24 L38,24" stroke={ACCC} strokeWidth="1.2" strokeLinecap="round" filter={f} />
      {/* interior: X (operação unitária) */}
      <path data-draw="6" d="M15,15 L25,25" stroke={ACCC} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <path data-draw="7" d="M25,15 L15,25" stroke={ACCC} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      {/* nós */}
      <circle data-node cx="10" cy="16" r="1.6" fill={CYAN}  filter={fl} />
      <circle data-node cx="10" cy="24" r="1.6" fill={CYAN}  filter={fl} />
      <circle data-node cx="30" cy="16" r="1.6" fill={ACCC}  filter={fl} />
      <circle data-node cx="30" cy="24" r="1.6" fill={ACCC}  filter={fl} />
    </AnimatedLogo>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SÍMBOLO D — Hexágono Quântico
   Conceito: hexágono (estrutura cristalina do grafeno, base de muitos
   chips quânticos) com rede interna de conexões — fusão de matéria
   quântica e circuito integrado.
   ══════════════════════════════════════════════════════════════════════════ */
function SymbolHex({ id }: Readonly<{ id: string }>) {
  const f = `url(#glow-sm-${id})`;
  const fl = `url(#glow-lg-${id})`;
  // pontos do hexágono regular (raio 14, centro 20,20)
  const hex = [
    [20, 6],    // topo
    [32.1, 13], // direita-cima
    [32.1, 27], // direita-baixo
    [20, 34],   // baixo
    [7.9, 27],  // esquerda-baixo
    [7.9, 13],  // esquerda-cima
  ];
  const hexPath = hex.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
  return (
    <AnimatedLogo id={id}>
      <circle data-glow cx="20" cy="20" r="10" fill={ACC}  opacity="0.09" filter={fl} />
      <circle data-glow cx="20" cy="20" r="5"  fill={CYAN} opacity="0.10" filter={fl} />
      {/* hexágono exterior */}
      <path data-draw="1" d={hexPath} stroke={ACC} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" filter={f} />
      {/* linhas do centro a cada vértice */}
      {hex.map((p, i) => (
        <path key={`line-${p[0]}-${p[1]}`} data-draw={String(i + 2)}
          d={`M20,20 L${p[0]},${p[1]}`}
          stroke={i % 2 === 0 ? ACCC : CYAN} strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
      ))}
      {/* nós nos vértices */}
      {hex.map((p, i) => (
        <circle key={`node-${p[0]}-${p[1]}`} data-node cx={p[0]} cy={p[1]} r="1.5" fill={i % 2 === 0 ? ACC : CYAN} filter={fl} />
      ))}
      {/* núcleo */}
      <circle data-node cx="20" cy="20" r="2.2" fill={ACCC} opacity="0.95" filter={fl} />
      {/* ring rotativo */}
      <circle data-ring cx="20" cy="20" r="6"
        stroke={ACCC} strokeWidth="0.6" strokeDasharray="3 4" opacity="0.4" />
    </AnimatedLogo>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SÍMBOLO E — Superposição Dupla (∞ quântico)
   Conceito: duas órbitas sobrepostas que formam um "8" / infinito
   inclinado — evoca superposição quântica (estado |0⟩ + |1⟩ ao mesmo tempo).
   Extremamente ligado ao conceito quântico e visualmente único.
   ══════════════════════════════════════════════════════════════════════════ */
function SymbolSuperpos({ id }: Readonly<{ id: string }>) {
  const f = `url(#glow-sm-${id})`;
  const fl = `url(#glow-lg-${id})`;
  return (
    <AnimatedLogo id={id}>
      <circle data-glow cx="20" cy="20" r="10" fill={ACC}  opacity="0.09" filter={fl} />
      <circle data-glow cx="14" cy="20" r="5"  fill={CYAN} opacity="0.10" filter={fl} />
      <circle data-glow cx="26" cy="20" r="5"  fill={ACCC} opacity="0.10" filter={fl} />
      {/* loop esquerdo */}
      <path data-draw="1"
        d="M20,20 C20,20 5,8 5,20 C5,32 20,20 20,20"
        stroke={ACC} strokeWidth="1.8" strokeLinecap="round" fill="none" filter={f} />
      {/* loop direito */}
      <path data-draw="2"
        d="M20,20 C20,20 35,8 35,20 C35,32 20,20 20,20"
        stroke={ACCC} strokeWidth="1.8" strokeLinecap="round" fill="none" filter={f} />
      {/* linha de superposição */}
      <path data-draw="3" d="M5,20 L35,20" stroke={CYAN} strokeWidth="0.6" strokeLinecap="round" opacity="0.35" />
      {/* nós extremos */}
      <circle data-node cx="5"  cy="20" r="1.8" fill={ACC}  filter={fl} />
      <circle data-node cx="35" cy="20" r="1.8" fill={ACCC} filter={fl} />
      {/* nó central — ponto de intersecção */}
      <circle data-node cx="20" cy="20" r="2.5" fill="#fff" opacity="0.9" filter={fl} />
      {/* ring subtil */}
      <circle data-ring cx="20" cy="20" r="5.5"
        stroke={ACC} strokeWidth="0.5" strokeDasharray="2 5" opacity="0.35" />
    </AnimatedLogo>
  );
}

/* ── Card de símbolo ──────────────────────────────────────────────────────── */
const SYMBOLS = [
  {
    id: "qubit",
    name: "Qubit — Orbital",
    desc: "Elipses orbitais à volta de um núcleo, representação directa de um qubit e da mecânica quântica. Elegante e científico.",
    quantum: "Modelo de Bohr / qubit",
    tech: "Circuito em órbita",
  },
  {
    id: "psi",
    name: "Psi — Função de onda",
    desc: "A letra ψ (Psi) é o símbolo universal da função de onda na mecânica quântica. Reinterpretada com linhas de circuito.",
    quantum: "Função de onda ψ",
    tech: "Traço geométrico",
  },
  {
    id: "gate",
    name: "Gate — Porta Quântica",
    desc: "Uma quantum gate estilizada — o bloco fundamental da computação quântica, com qubits a entrar e sair.",
    quantum: "Computação quântica",
    tech: "Circuito digital",
  },
  {
    id: "hex",
    name: "Hex — Cristal Quântico",
    desc: "Hexágono de grafeno (base dos processadores quânticos) com rede de conexões internas. Matéria + circuito.",
    quantum: "Cristalografia quântica",
    tech: "Chip / rede de nós",
  },
  {
    id: "superpos",
    name: "∞ — Superposição",
    desc: "Dois loops sobrepostos que formam um infinito — a fusão do estado |0⟩ e |1⟩ co-existindo. Único e memorável.",
    quantum: "Superposição quântica",
    tech: "Duplo estado / infinito",
  },
] as const;

type SymId = typeof SYMBOLS[number]["id"];

function renderSymbol(id: SymId) {
  if (id === "qubit")    return <SymbolQubit    id={id} />;
  if (id === "psi")      return <SymbolPsi      id={id} />;
  if (id === "gate")     return <SymbolGate     id={id} />;
  if (id === "hex")      return <SymbolHex      id={id} />;
  if (id === "superpos") return <SymbolSuperpos id={id} />;
  return null;
}

/* ── PAGE ─────────────────────────────────────────────────────────────────── */
export default function LogoDemoPage() {
  const [active, setActive] = useState<SymId>("qubit");
  const sym = SYMBOLS.find(s => s.id === active) ?? SYMBOLS[0];

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,'Segoe UI',sans-serif", background: BG, color: "#EEF0F7", minHeight: "100vh" }}>

      {/* TOP BAR */}
      <div style={{ borderBottom: "1px solid rgba(155,89,255,0.15)", padding: "0 2.5rem", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(7,5,15,0.92)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="/demo/paletas" style={{ fontSize: "0.62rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>← PALETAS</a>
          <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.15)" }}>|</span>
          <span style={{ fontSize: "0.62rem", letterSpacing: "0.28em", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>EXPLORADOR DE SÍMBOLO — LOGO</span>
        </div>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: "rgba(155,89,255,0.35)" }}>
          Plasma Violeta · GSAP Premium
        </span>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 2rem 4rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.4em", color: "rgba(255,255,255,0.2)", marginBottom: "0.5rem", fontWeight: 600 }}>PASSO 3 — SÍMBOLO</p>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>Conceito do símbolo</h1>
          <p style={{ fontSize: "0.85rem", color: "rgba(238,240,247,0.4)", maxWidth: 520 }}>
            Cada símbolo mantém a mesma dinâmica GSAP (luz viajante + glow pulsante + nós). A forma é o que muda — fusão do conceito quântico com tecnologia de circuito.
          </p>
        </div>

        {/* SELETOR DE SÍMBOLOS */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          {SYMBOLS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} type="button"
              style={{ padding: "0.55rem 1.2rem", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em", cursor: "pointer", borderRadius: 8, border: `1px solid ${active === s.id ? ACC : "rgba(255,255,255,0.08)"}`, background: active === s.id ? "rgba(155,89,255,0.12)" : "rgba(255,255,255,0.02)", color: active === s.id ? ACCC : "rgba(238,240,247,0.45)", transition: "all 0.18s" }}>
              {s.name}
            </button>
          ))}
        </div>

        {/* GRID PRINCIPAL */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>

          {/* ÁREA DE PREVIEW */}
          <div style={{ background: "rgba(155,89,255,0.04)", border: `1px solid rgba(155,89,255,0.15)`, borderRadius: 16, padding: "3rem", display: "flex", flexDirection: "column", gap: "3rem" }}>

            {/* tamanhos variados */}
            <div>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", marginBottom: "1.5rem", fontWeight: 600 }}>ESCALA — EM CONTEXTO</p>
              <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
                {[16, 28, 40, 60, 96].map(sz => (
                  <div key={sz} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: sz, height: sz }}>{renderSymbol(active)}</div>
                    <span style={{ fontSize: "0.56rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>{sz}px</span>
                  </div>
                ))}
              </div>
            </div>

            {/* em contexto de nav */}
            <div>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", marginBottom: "1rem", fontWeight: 600 }}>EM CONTEXTO DE NAV</p>
              <div style={{ background: "#07050F", border: "1px solid rgba(155,89,255,0.1)", borderRadius: 10, padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: 30, height: 30 }}>{renderSymbol(active)}</div>
                  <span style={{ fontSize: "0.68rem", letterSpacing: "0.42em", fontWeight: 800 }}>
                    QUANTUM <span style={{ color: ACC }}>TECHNOLOGY</span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.62rem", letterSpacing: "0.15em", color: "rgba(238,240,247,0.35)" }}>
                  {["SERVIÇOS", "PORTFÓLIO", "CONTACTO"].map(l => <span key={l}>{l}</span>)}
                </div>
                <button type="button" style={{ border: `1px solid rgba(155,89,255,0.4)`, color: ACC, background: "transparent", padding: "0.4rem 1rem", fontSize: "0.62rem", letterSpacing: "0.2em", cursor: "pointer", fontWeight: 700 }}>
                  PROPOSTA
                </button>
              </div>
            </div>

            {/* versão grande isolada */}
            <div>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", marginBottom: "1.5rem", fontWeight: 600 }}>ISOLADO — 120px</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "rgba(0,0,0,0.3)", borderRadius: 12 }}>
                <div style={{ width: 120, height: 120 }}>{renderSymbol(active)}</div>
              </div>
            </div>
          </div>

          {/* FICHA DO SÍMBOLO */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "rgba(155,89,255,0.05)", border: `1px solid rgba(155,89,255,0.18)`, borderRadius: 12, padding: "1.5rem" }}>
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.28em", color: "rgba(255,255,255,0.2)", marginBottom: "0.6rem", fontWeight: 600 }}>CONCEITO</p>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: ACCC, marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>{sym.name}</h2>
              <p style={{ fontSize: "0.82rem", color: "rgba(238,240,247,0.52)", lineHeight: 1.72 }}>{sym.desc}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1.25rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <p style={{ fontSize: "0.56rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", marginBottom: "0.4rem", fontWeight: 600 }}>REFERÊNCIA QUÂNTICA</p>
                <p style={{ fontSize: "0.78rem", color: ACC, fontWeight: 600 }}>{sym.quantum}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.56rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", marginBottom: "0.4rem", fontWeight: 600 }}>REFERÊNCIA TECH</p>
                <p style={{ fontSize: "0.78rem", color: CYAN, fontWeight: 600 }}>{sym.tech}</p>
              </div>
            </div>
            <div style={{ background: "rgba(155,89,255,0.06)", border: `1px solid rgba(155,89,255,0.15)`, borderRadius: 12, padding: "1.25rem 1.5rem" }}>
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.22em", color: ACC, marginBottom: "0.6rem", fontWeight: 700 }}>✦ GSAP ACTIVO</p>
              <p style={{ fontSize: "0.78rem", color: "rgba(238,240,247,0.45)", lineHeight: 1.65 }}>
                Luz viajante nos paths · Glow pulsante · Nós com pulse independente · Ring rotativo (se presente)
              </p>
            </div>

            {/* miniaturas de todos */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "1.25rem 1.5rem" }}>
              <p style={{ fontSize: "0.56rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", marginBottom: "1rem", fontWeight: 600 }}>TODOS OS SÍMBOLOS</p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {SYMBOLS.map(s => (
                  <button key={s.id} type="button" onClick={() => setActive(s.id)}
                    style={{ width: 44, height: 44, background: active === s.id ? "rgba(155,89,255,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${active === s.id ? ACC : "rgba(255,255,255,0.06)"}`, borderRadius: 10, cursor: "pointer", padding: 6, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                    {renderSymbol(s.id)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
