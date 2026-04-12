"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// /demo/paletas — Explorador de paletas para o Conceito 1 (Noir Editorial)
// GSAP: animação de entrada ao trocar paleta + orbs flutuantes
// ─────────────────────────────────────────────────────────────────────────────

/* ── Definição das paletas ─────────────────────────────────────────────── */
const PALETAS = [
  {
    id: "aureo",
    name: "Áureo",
    tag: "EXCLUSIVIDADE · ATEMPORAL",
    feel: "Luxo sóbrio. Associado a prestígio, solidez e valor. Usado por consultoras premium e marcas de alta qualidade. Transmite \"escolha definitiva\".",
    gsapNote: "Gold-glow pulsante nos orbs. Counter digits em dourado com stagger de entrada.",
    ACC:    "#C9A35A",
    ACCd:   "rgba(201,163,84,0.08)",
    ACCb:   "rgba(201,163,84,0.18)",
    BG:     "#07070F",
    BG2:    "#0A0A14",
    FG:     "#EDE8DE",
    FGd:    "rgba(237,232,222,0.42)",
    FGdd:   "rgba(237,232,222,0.22)",
    BORDER: "rgba(201,163,84,0.13)",
  },
  {
    id: "ciano",
    name: "Ciano Quântico",
    tag: "ENERGIA · TECNOLOGIA DE PONTA",
    feel: "Elétrico e preciso. Evoca física quântica, circuitos, velocidade e inovação radical. Posicionamento: agência que domina a tech do futuro.",
    gsapNote: "Scan-line animada no hero. Orbs com particle trail azul-ciano ao flutuar.",
    ACC:    "#00D4C2",
    ACCd:   "rgba(0,212,194,0.08)",
    ACCb:   "rgba(0,212,194,0.18)",
    BG:     "#04090F",
    BG2:    "#050C12",
    FG:     "#DFF5F3",
    FGd:    "rgba(223,245,243,0.42)",
    FGdd:   "rgba(223,245,243,0.22)",
    BORDER: "rgba(0,212,194,0.12)",
  },
  {
    id: "plasma",
    name: "Plasma Violeta",
    tag: "IA · INOVAÇÃO · FUTURO",
    feel: "Profundo e disruptivo. Associado a inteligência artificial, computação quântica e avanço tecnológico. Posicionamento: empresa que lidera a próxima era.",
    gsapNote: "Halo violeta rotativo no logo. Counter de stats com morphing de número.",
    ACC:    "#9B59FF",
    ACCd:   "rgba(155,89,255,0.08)",
    ACCb:   "rgba(155,89,255,0.18)",
    BG:     "#07050F",
    BG2:    "#09070F",
    FG:     "#EAE5F5",
    FGd:    "rgba(234,229,245,0.42)",
    FGdd:   "rgba(234,229,245,0.22)",
    BORDER: "rgba(155,89,255,0.13)",
  },
  {
    id: "verde",
    name: "Verde Código",
    tag: "ENGENHARIA · CRESCIMENTO · PRECISÃO",
    feel: "Orgânico e técnico. Evoca terminal, código puro e crescimento. Posicionamento: equipa de engenheiros pragmáticos que entregam resultados mensuráveis.",
    gsapNote: "Typing cursor piscante no headline. Matrix-rain subtil no fundo do hero.",
    ACC:    "#00EA8A",
    ACCd:   "rgba(0,234,138,0.07)",
    ACCb:   "rgba(0,234,138,0.15)",
    BG:     "#040F08",
    BG2:    "#061208",
    FG:     "#D8F5E8",
    FGd:    "rgba(216,245,232,0.42)",
    FGdd:   "rgba(216,245,232,0.22)",
    BORDER: "rgba(0,234,138,0.12)",
  },
  {
    id: "prata",
    name: "Prata-Aço",
    tag: "FIABILIDADE · RIGOR · INDUSTRIAL",
    feel: "Sério e absolutamente confiável. Evoca precisão de engenharia, aço temperado, seriedade corporativa. Posicionamento: \"A escolha segura para sistemas críticos\".",
    gsapNote: "Linha horizontal que faz reveal do conteúdo (clip-path). Números com counter digital.",
    ACC:    "#8BAFC9",
    ACCd:   "rgba(139,175,201,0.08)",
    ACCb:   "rgba(139,175,201,0.18)",
    BG:     "#07090E",
    BG2:    "#090C12",
    FG:     "#DCE6F0",
    FGd:    "rgba(220,230,240,0.42)",
    FGdd:   "rgba(220,230,240,0.22)",
    BORDER: "rgba(139,175,201,0.13)",
  },
  {
    id: "escarlate",
    name: "Escarlate",
    tag: "PODER · DISRUPÇÃO · OUSADIA",
    feel: "Ousado e memorável. Alta energia, forte contraste, presença dominante. Posicionamento: agência que não tem medo de desafiar o status quo. Diferencia.",
    gsapNote: "Flicker animado no headline ao hover. CTA com pulse vermelho expansivo.",
    ACC:    "#FF3355",
    ACCd:   "rgba(255,51,85,0.08)",
    ACCb:   "rgba(255,51,85,0.18)",
    BG:     "#0A0507",
    BG2:    "#0F060A",
    FG:     "#F5DDE3",
    FGd:    "rgba(245,221,227,0.42)",
    FGdd:   "rgba(245,221,227,0.22)",
    BORDER: "rgba(255,51,85,0.13)",
  },
] as const;

type Paleta = typeof PALETAS[number];

const SERVICES = [
  ["01", "Sistemas Empresariais", "CRMs, ERPs e plataformas digitais integradas ao fluxo de negócio, com UX de alto nível."],
  ["02", "Arquitectura Cloud", "Infraestrutura escalável em AWS, com deploys automatizados e alta resiliência."],
  ["03", "IA & Automação", "Agentes inteligentes e fluxos que eliminam trabalho manual e multiplicam resultados."],
];
const STATS: [string, string, string][] = [
  ["70", "70+", "PROJECTOS"],
  ["98", "98%", "SATISFAÇÃO"],
  ["7",  "7d",  "PRIMEIRO MVP"],
  ["3",  "3×",  "ROI MÉDIO"],
];

/* ── helpers de módulo (evita nesting > 4) ───────────────────────────────── */
function getSuffix(d: string): string {
  if (d.includes("%")) return "%";
  if (d.includes("×")) return "×";
  if (d.includes("d"))  return "d";
  if (d.includes("+")) return "+";
  return "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function animateCounter(gsap: any, node: HTMLElement): void {
  const target = Number.parseInt(node.dataset["countTo"] ?? "0", 10);
  const display = node.dataset["countDisplay"] ?? String(target);
  const suffix = getSuffix(display);
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target, duration: 1.8, ease: "power2.out", delay: 0.5,
    onUpdate() { node.textContent = `${Math.round(obj.val)}${suffix}`; },
  });
}

/* ── Preview do conceito com paleta dinâmica ──────────────────────────────── */
function Preview({ p }: Readonly<{ p: Paleta }>) {
  const previewRef = useRef<HTMLDivElement>(null);

  // GSAP: entrance animation quando a paleta muda
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    let killed = false;
    (async () => {
      const { gsap } = await import("gsap");
      if (killed) return;
      const tl = gsap.timeline();
      // reveal do bloco inteiro
      tl.fromTo(el,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }
      );
      // stagger nos filhos com data-gsap-item
      tl.fromTo(
        el.querySelectorAll("[data-gsap-item]"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.06 },
        "-=0.3"
      );
      // counters — delegado para função de módulo
      el.querySelectorAll<HTMLElement>("[data-count-to]").forEach((node) => {
        animateCounter(gsap, node);
      });
      // orbs flutuantes
      gsap.to(el.querySelectorAll("[data-orb]"), {
        y: (i: number) => [-20, 14, -12][i % 3],
        x: (i: number) => [10, -8, 18][i % 3],
        duration: (i: number) => [6, 8, 7][i % 3],
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: (i: number) => i * 1.5,
      });
    })();
    return () => { killed = true; };
  }, [p.id]);

  return (
    <div
      ref={previewRef}
      style={{ background: p.BG, color: p.FG, borderRadius: 16, overflow: "hidden", border: `1px solid ${p.BORDER}`, position: "relative" }}
    >
      {/* orbs de fundo */}
      <div data-orb="1" style={{ position: "absolute", top: "4%", right: "8%", width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(ellipse, ${p.ACCd} 0%, transparent 72%)`, pointerEvents: "none" }} />
      <div data-orb="2" style={{ position: "absolute", bottom: "10%", left: "12%", width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(ellipse, ${p.ACCd} 0%, transparent 72%)`, pointerEvents: "none" }} />

      {/* NAV */}
      <header data-gsap-item style={{ borderBottom: `1px solid ${p.BORDER}`, position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: "100%", padding: "0 2.5rem", display: "flex", alignItems: "center", height: 64, justifyContent: "space-between" }}>
          <div style={{ fontSize: "0.68rem", letterSpacing: "0.42em", fontWeight: 800 }}>
            QUANTUM <span style={{ color: p.ACC }}>TECHNOLOGY</span>
          </div>
          <div style={{ display: "flex", gap: "2rem", fontSize: "0.65rem", letterSpacing: "0.18em", color: p.FGd }}>
            {["SERVIÇOS", "PORTFÓLIO", "CONTACTO"].map(l => <span key={l}>{l}</span>)}
          </div>
          <button style={{ border: `1px solid ${p.ACCb}`, color: p.ACC, background: "transparent", padding: "0.5rem 1.4rem", fontSize: "0.64rem", letterSpacing: "0.22em", cursor: "pointer", fontWeight: 700 }}>
            SOLICITAR PROPOSTA
          </button>
        </div>
      </header>

      {/* HERO */}
      <div style={{ padding: "4.5rem 2.5rem 3rem", position: "relative", zIndex: 2 }}>
        <p data-gsap-item style={{ fontSize: "0.58rem", letterSpacing: "0.48em", color: p.ACC, marginBottom: "2rem", fontWeight: 700 }}>
          AGÊNCIA DE ENGENHARIA DE SOFTWARE — PORTUGAL · BRASIL · EUA
        </p>

        <div data-gsap-item style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "3rem", alignItems: "end", marginBottom: "3.5rem" }}>
          <h1 style={{ fontSize: "clamp(2.4rem,6vw,5.5rem)", fontWeight: 900, lineHeight: 0.87, letterSpacing: "-0.04em", margin: 0 }}>
            ENGENHARIA<br />
            <em style={{ color: p.ACC, fontStyle: "normal" }}>DE SOFTWARE</em><br />
            SEM CONCESSÕES
          </h1>
          <div>
            <p style={{ fontSize: "0.92rem", lineHeight: 1.78, color: p.FGd, marginBottom: "2rem" }}>
              Construímos sistemas que resistem ao tempo e escalam com o negócio.
              Cada decisão técnica é uma aposta estratégica na competitividade da sua empresa.
            </p>
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              <button style={{ background: p.ACC, color: p.BG, padding: "0.8rem 2rem", fontSize: "0.65rem", letterSpacing: "0.22em", fontWeight: 800, border: "none", cursor: "pointer" }}>
                INICIAR PROJECTO →
              </button>
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.14em", color: p.FGdd, borderBottom: `1px solid ${p.BORDER}`, paddingBottom: 2, cursor: "pointer" }}>
                VER PORTFÓLIO
              </span>
            </div>
          </div>
        </div>

        {/* STATS com counter GSAP */}
        <div data-gsap-item style={{ display: "flex", gap: "3rem", borderTop: `1px solid ${p.BORDER}`, paddingTop: "2rem" }}>
          {STATS.map(([raw, display, label]) => (
            <div key={label}>
              <span
                data-count-to={raw}
                data-count-display={display}
                style={{ fontSize: "2rem", fontWeight: 900, color: p.ACC, display: "block", lineHeight: 1 }}
              >
                0
              </span>
              <span style={{ fontSize: "0.58rem", letterSpacing: "0.22em", color: p.FGdd, marginTop: 5, display: "block" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <div data-gsap-item style={{ borderTop: `1px solid ${p.BORDER}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {SERVICES.map(([num, title, desc], i) => (
            <div key={num} style={{
              padding: "2rem 2.5rem",
              borderRight: i < 2 ? `1px solid ${p.BORDER}` : "none",
            }}>
              <span style={{ fontSize: "3.5rem", fontWeight: 900, color: p.ACCd, display: "block", lineHeight: 1, marginBottom: "1rem", letterSpacing: "-0.06em", filter: "brightness(4)" }}>{num}</span>
              <h3 style={{ fontSize: "0.78rem", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "0.5rem" }}>{title}</h3>
              <p style={{ fontSize: "0.76rem", color: p.FGd, lineHeight: 1.75 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Chip de paleta ───────────────────────────────────────────────────────── */
function PaletaChip({ p, active, onClick }: Readonly<{ p: Paleta; active: boolean; onClick: () => void }>) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", gap: "0.5rem",
        padding: "1rem 1.25rem", border: `1px solid ${active ? p.ACC : "rgba(255,255,255,0.07)"}`,
        background: active ? `${p.ACCd}` : "rgba(255,255,255,0.02)",
        borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
        alignItems: "flex-start", minWidth: 148,
      }}
    >
      {/* swatch */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ width: 28, height: 28, borderRadius: 6, background: p.BG, border: `3px solid ${p.ACC}`, display: "inline-block", flexShrink: 0 }} />
        <span style={{ width: 14, height: 14, borderRadius: 3, background: p.ACC, display: "inline-block" }} />
      </div>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: active ? p.ACC : "rgba(255,255,255,0.55)", letterSpacing: "0.04em", lineHeight: 1.2 }}>
        {p.name}
      </span>
      <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em" }}>
        {p.ACC}
      </span>
    </button>
  );
}

/* ── PAGE ─────────────────────────────────────────────────────────────────── */
export default function PaletasPage() {
  const [active, setActive] = useState<Paleta["id"]>("aureo");
  const paleta = PALETAS.find(p => p.id === active) ?? PALETAS[0];

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,'Segoe UI',sans-serif", background: "#060810", color: "#E8ECF5", minHeight: "100vh" }}>

      {/* ── TOP BAR ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 2.5rem", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(6,8,16,0.92)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="/demo" style={{ fontSize: "0.62rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>
            ← DEMO
          </a>
          <span style={{ fontSize: "0.62rem", letterSpacing: "0.28em", color: "rgba(255,255,255,0.2)" }}>|</span>
          <span style={{ fontSize: "0.62rem", letterSpacing: "0.28em", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
            EXPLORADOR DE PALETAS — CONCEITO 01
          </span>
        </div>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.18)" }}>
          GSAP · ANIMAÇÕES PREMIUM · NOIR EDITORIAL
        </span>
      </div>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "2.5rem 2rem 4rem" }}>

        {/* ── TÍTULO ── */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.4em", color: "rgba(255,255,255,0.25)", marginBottom: "0.5rem", fontWeight: 600 }}>
            PASSO 2 — PALETA DE CORES
          </p>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>
            Escolha o acento cromático
          </h1>
          <p style={{ fontSize: "0.85rem", color: "rgba(232,236,245,0.45)", maxWidth: 560 }}>
            O fundo permanece near-black — característica do Conceito 1. O acento define o posicionamento emocional e a identidade da marca.
          </p>
        </div>

        {/* ── CHIPS ── */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {PALETAS.map(p => (
            <PaletaChip key={p.id} p={p} active={active === p.id} onClick={() => setActive(p.id)} />
          ))}
        </div>

        {/* ── GRID: preview + ficha ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>

          {/* PREVIEW */}
          <Preview p={paleta} />

          {/* FICHA TÉCNICA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* identidade */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1.5rem" }}>
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.28em", color: "rgba(232,236,245,0.3)", marginBottom: "0.75rem", fontWeight: 600 }}>IDENTIDADE</p>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: paleta.ACC, marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>{paleta.name}</h2>
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.2em", color: "rgba(232,236,245,0.3)", fontWeight: 600 }}>{paleta.tag}</p>
              <p style={{ fontSize: "0.82rem", color: "rgba(232,236,245,0.52)", lineHeight: 1.7, marginTop: "1rem" }}>{paleta.feel}</p>
            </div>

            {/* cores */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1.5rem" }}>
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.28em", color: "rgba(232,236,245,0.3)", marginBottom: "1rem", fontWeight: 600 }}>TOKENS</p>
              {[
                ["Acento",      paleta.ACC,  paleta.id],
                ["Background",  paleta.BG,   "near-black"],
                ["Foreground",  paleta.FG,   "texto principal"],
                ["Borda",       paleta.BORDER.slice(0, 7), "border sutil"],
              ].map(([label, hex, note]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <span style={{ width: 28, height: 28, borderRadius: 6, background: hex, border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0, display: "inline-block" }} />
                  <div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, display: "block", color: "rgba(232,236,245,0.7)" }}>{label}</span>
                    <span style={{ fontSize: "0.62rem", color: "rgba(232,236,245,0.3)", fontFamily: "monospace" }}>{hex} · {note}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* gsap */}
            <div style={{ background: `${paleta.ACCd}`, border: `1px solid ${paleta.BORDER}`, borderRadius: 12, padding: "1.5rem" }}>
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.28em", color: paleta.ACC, marginBottom: "0.75rem", fontWeight: 700 }}>✦ GSAP PREMIUM</p>
              <p style={{ fontSize: "0.8rem", color: paleta.FGd, lineHeight: 1.7 }}>{paleta.gsapNote}</p>
            </div>

            {/* decisão */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "1.25rem 1.5rem" }}>
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.15em", color: "rgba(232,236,245,0.25)", lineHeight: 1.6 }}>
                A paleta activa não compromete a arquitectura do layout — pode ser alterada em qualquer fase sem refactoring estrutural.
              </p>
            </div>
          </div>
        </div>

        {/* ── COMPARATIVO RÁPIDO de todos os swatches ── */}
        <div style={{ marginTop: "2rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "1.5rem 2rem" }}>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "rgba(232,236,245,0.25)", marginBottom: "1rem", fontWeight: 600 }}>COMPARATIVO — TODAS AS PALETAS</p>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {PALETAS.map(p => (
              <button type="button" key={p.id} onClick={() => setActive(p.id)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem", opacity: active === p.id ? 1 : 0.45, transition: "opacity 0.2s", background: "none", border: "none", padding: 0 }}>
                <span style={{ width: 36, height: 20, borderRadius: 4, background: p.BG, border: `2.5px solid ${p.ACC}`, display: "inline-block" }} />
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: p.ACC }}>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
