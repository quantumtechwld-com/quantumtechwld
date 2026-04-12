"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /demo — Demonstrativo de conceitos de layout institucional
// Acesso direto: http://localhost:3000/demo (sem autenticação)
// ─────────────────────────────────────────────────────────────────────────────

const SERVICES = [
  ["01", "Sistemas Empresariais", "CRMs, ERPs e plataformas digitais alinhadas ao processo de negócio, com UX de alto nível."],
  ["02", "Arquitectura Cloud", "Infraestrutura escalável com AWS, deploys automatizados e alta resiliência."],
  ["03", "IA & Automação", "Agentes inteligentes e fluxos que eliminam trabalho manual e multiplicam resultados."],
];

const STATS = [
  ["70+", "PROJECTOS"],
  ["98%", "SATISFAÇÃO"],
  ["7d",  "PRIMEIRO MVP"],
  ["3×",  "ROI MÉDIO"],
];

function go(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── CONCEITO 1 — NOIR DORADO ────────────────────────────────────────────────
// Luxo sóbrio, tipografia editorial, gold sobre near-black
// Inspiração: McKinsey, Publicis Sapient, agências premium europeias
function ConceptNoir() {
  const C = "#C9A35A"; // gold
  const BG = "#07070F";
  const FG = "#EDE8DE";
  const BORDER = "rgba(201,163,84,0.13)";

  return (
    <section id="c1" style={{ background: BG, color: FG, minHeight: "100vh", paddingTop: 56 }}>
      {/* NAV */}
      <header style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 3rem", display: "flex", alignItems: "center", height: 72, justifyContent: "space-between" }}>
          <div style={{ fontSize: "0.72rem", letterSpacing: "0.4em", fontWeight: 800 }}>
            QUANTUM <span style={{ color: C }}>TECHNOLOGY</span>
          </div>
          <div style={{ display: "flex", gap: "2.5rem", fontSize: "0.7rem", letterSpacing: "0.18em", color: "rgba(237,232,222,0.42)" }}>
            {["SERVIÇOS","METODOLOGIA","PORTFÓLIO","CONTACTO"].map(l => <span key={l} style={{ cursor: "pointer" }}>{l}</span>)}
          </div>
          <button style={{ border: `1px solid rgba(201,163,84,0.45)`, color: C, background: "transparent", padding: "0.55rem 1.6rem", fontSize: "0.68rem", letterSpacing: "0.22em", cursor: "pointer", fontWeight: 600 }}>
            SOLICITAR PROPOSTA
          </button>
        </div>
      </header>

      {/* HERO */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "7rem 3rem 4rem" }}>
        <p style={{ fontSize: "0.62rem", letterSpacing: "0.45em", color: C, marginBottom: "2.5rem", fontWeight: 700 }}>
          AGÊNCIA DE ENGENHARIA DE SOFTWARE — PORTUGAL · EUROPA · BRASIL · EUA
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "4rem", alignItems: "end", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "clamp(3.2rem,8vw,7.5rem)", fontWeight: 900, lineHeight: 0.86, letterSpacing: "-0.04em", margin: 0 }}>
            ENGENHARIA<br />
            <em style={{ color: C, fontStyle: "normal" }}>DE SOFTWARE</em><br />
            SEM CONCESSÕES
          </h1>
          <div>
            <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(237,232,222,0.55)", marginBottom: "2.5rem" }}>
              Construímos sistemas que resistem ao tempo e escalam com o negócio.
              Cada decisão técnica é uma aposta estratégica na competitividade da sua empresa.
            </p>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <button style={{ background: C, color: BG, padding: "0.9rem 2.4rem", fontSize: "0.7rem", letterSpacing: "0.22em", fontWeight: 800, border: "none", cursor: "pointer" }}>
                INICIAR PROJECTO →
              </button>
              <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "rgba(237,232,222,0.3)", borderBottom: `1px solid rgba(201,163,84,0.25)`, paddingBottom: 2, cursor: "pointer" }}>
                VER PORTFÓLIO
              </span>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "flex", gap: "3.5rem", borderTop: `1px solid ${BORDER}`, paddingTop: "2.5rem" }}>
          {STATS.map(([v, l]) => (
            <div key={l}>
              <span style={{ fontSize: "2.2rem", fontWeight: 900, color: C, display: "block", lineHeight: 1 }}>{v}</span>
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.22em", color: "rgba(237,232,222,0.32)", marginTop: 6, display: "block" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 3rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {SERVICES.map(([num, title, desc]) => (
            <div key={num} style={{ padding: "2.5rem 0", borderRight: `1px solid ${BORDER}`, paddingRight: "2.5rem", marginRight: "2.5rem" }}>
              <span style={{ fontSize: "4rem", fontWeight: 900, color: "rgba(201,163,84,0.1)", display: "block", lineHeight: 1, marginBottom: "1.25rem", letterSpacing: "-0.06em" }}>{num}</span>
              <h3 style={{ fontSize: "0.85rem", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "0.6rem" }}>{title}</h3>
              <p style={{ fontSize: "0.82rem", color: "rgba(237,232,222,0.42)", lineHeight: 1.75 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "2rem", fontSize: "0.6rem", letterSpacing: "0.3em", color: "rgba(201,163,84,0.2)" }}>
        CONCEITO 01 — NOIR DORADO · BG #07070F · TEXT #EDE8DE · ACC #C9A35A
      </div>
    </section>
  );
}

// ─── CONCEITO 2 — BRANCO AUTORIDADE ─────────────────────────────────────────
// Institucional luminoso, grid assimétrico, tipografia bold editorial
// Inspiração: IBM, Accenture, Deloitte Digital
function ConceptBranco() {
  const C  = "#004FCC";  // corporate blue
  const BG = "#F8F7F3";
  const FG = "#0B1928";

  return (
    <section id="c2" style={{ background: BG, color: FG, minHeight: "100vh", paddingTop: 56 }}>
      {/* NAV */}
      <header style={{ borderBottom: "1px solid #E0DEDD", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 3rem", display: "flex", alignItems: "center", height: 72, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 28, height: 28, background: C, borderRadius: 4 }} />
            <span style={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.02em" }}>Quantum Technology</span>
          </div>
          <div style={{ display: "flex", gap: "2.5rem", fontSize: "0.85rem", color: "rgba(11,25,40,0.55)", fontWeight: 500 }}>
            {["Serviços","Metodologia","Portfólio","Empresa","Contacto"].map(l => (
              <span key={l} style={{ cursor: "pointer", borderBottom: "2px solid transparent" }}>{l}</span>
            ))}
          </div>
          <button style={{ background: C, color: "#fff", padding: "0.6rem 1.6rem", fontSize: "0.85rem", fontWeight: 700, border: "none", borderRadius: 6, cursor: "pointer" }}>
            Falar com um especialista
          </button>
        </div>
      </header>

      {/* HERO — assimétrico 60/40 */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 3rem 4rem", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "5rem", alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-block", background: `${C}15`, color: C, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", padding: "0.35rem 0.9rem", borderRadius: 2, marginBottom: "1.8rem" }}>
            ENGENHARIA DE SOFTWARE PREMIUM
          </div>
          <h1 style={{ fontSize: "clamp(2.8rem,6vw,5.2rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: "1.75rem" }}>
            Tecnologia que<br />
            <span style={{ color: C }}>transforma</span><br />
            o negócio.
          </h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(11,25,40,0.58)", marginBottom: "2.5rem", maxWidth: 460 }}>
            Da arquitectura ao deploy — construímos sistemas robustos para empresas que exigem
            performance, segurança e escalabilidade sem cedências.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button style={{ background: C, color: "#fff", padding: "0.85rem 2rem", fontSize: "0.9rem", fontWeight: 700, border: "none", borderRadius: 6, cursor: "pointer" }}>
              Solicitar proposta →
            </button>
            <button style={{ background: "transparent", color: FG, padding: "0.85rem 2rem", fontSize: "0.9rem", fontWeight: 600, border: "1.5px solid #D0CCCA", borderRadius: 6, cursor: "pointer" }}>
              Ver casos de sucesso
            </button>
          </div>
        </div>

        {/* RIGHT — stats card */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "2.5rem", boxShadow: "0 2px 24px rgba(0,0,0,0.07)", border: "1px solid #E8E5E2" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {STATS.map(([v, l]) => (
              <div key={l}>
                <span style={{ fontSize: "2.5rem", fontWeight: 900, color: C, display: "block", lineHeight: 1 }}>{v}</span>
                <span style={{ fontSize: "0.75rem", color: "rgba(11,25,40,0.45)", fontWeight: 600, letterSpacing: "0.05em", display: "block", marginTop: 6 }}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #EEEBE8" }}>
            <p style={{ fontSize: "0.8rem", color: "rgba(11,25,40,0.5)", lineHeight: 1.6 }}>
              Clientes em Portugal, Brasil e Estados Unidos confiam na nossa equipa para
              projectos críticos de negócio.
            </p>
          </div>
        </div>
      </div>

      {/* SERVICES — linha horizontal com separadores */}
      <div style={{ background: FG, color: BG, padding: "0 3rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {SERVICES.map(([num, title, desc], i) => (
            <div key={num} style={{ padding: "2.5rem 0", borderRight: i < 2 ? "1px solid rgba(248,247,243,0.1)" : "none", paddingRight: "2.5rem", marginRight: "2.5rem" }}>
              <span style={{ color: C, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", display: "block", marginBottom: "0.75rem" }}>{num}</span>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.6rem" }}>{title}</h3>
              <p style={{ fontSize: "0.83rem", color: "rgba(248,247,243,0.5)", lineHeight: 1.7 }}>{desc}</p>
              <span style={{ fontSize: "0.75rem", color: C, marginTop: "1rem", display: "inline-block", borderBottom: `1px solid ${C}`, paddingBottom: 1, cursor: "pointer" }}>Saber mais →</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "2rem", fontSize: "0.6rem", letterSpacing: "0.25em", color: "rgba(11,25,40,0.2)" }}>
        CONCEITO 02 — BRANCO AUTORIDADE · BG #F8F7F3 · TEXT #0B1928 · ACC #004FCC
      </div>
    </section>
  );
}

// ─── CONCEITO 3 — ÍNDIGO PROFUNDO ────────────────────────────────────────────
// Dark premium moderno com glassmorphism, espaçamento generoso, indigo sóbrio
// Inspiração: Stripe, Vercel, Linear — tech de alto nível
function ConceptIndigo() {
  const C  = "#7B72F5";  // indigo muted
  const CL = "#A49DFF";  // indigo light
  const BG = "#0C0F1A";
  const BG2 = "#111420";

  return (
    <section id="c3" style={{ background: BG, color: "#EEF0F7", minHeight: "100vh", paddingTop: 56 }}>
      {/* NAV */}
      <header style={{ borderBottom: "1px solid rgba(238,240,247,0.06)", backdropFilter: "blur(12px)", background: "rgba(12,15,26,0.8)", position: "sticky", top: 56, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 3rem", display: "flex", alignItems: "center", height: 68, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 26, height: 26, background: `linear-gradient(135deg, ${C}, ${CL})`, borderRadius: 6 }} />
            <span style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>Quantum Technology</span>
          </div>
          <div style={{ display: "flex", gap: "2rem", fontSize: "0.82rem", color: "rgba(238,240,247,0.45)", fontWeight: 500 }}>
            {["Serviços","Portfólio","Metodologia","Contacto"].map(l => (
              <span key={l} style={{ cursor: "pointer", transition: "color 0.2s" }}>{l}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", color: "rgba(238,240,247,0.4)", cursor: "pointer" }}>Área do Cliente</span>
            <button style={{ background: C, color: "#fff", padding: "0.55rem 1.4rem", fontSize: "0.82rem", fontWeight: 600, border: "none", borderRadius: 8, cursor: "pointer" }}>
              Solicitar proposta
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "7rem 3rem 5rem", position: "relative" }}>
        {/* subtle glow */}
        <div style={{ position: "absolute", top: "10%", left: "30%", width: 600, height: 400, background: `radial-gradient(ellipse, rgba(123,114,245,0.08) 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(123,114,245,0.1)", border: "1px solid rgba(123,114,245,0.25)", color: CL, fontSize: "0.72rem", fontWeight: 600, padding: "0.35rem 0.9rem", borderRadius: 20, marginBottom: "2rem", letterSpacing: "0.03em" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: CL, display: "inline-block", flexShrink: 0 }}>{""}</span>
          {"Portugal · Brasil · Estados Unidos"}
        </div>

        <h1 style={{ fontSize: "clamp(3rem,7vw,6.5rem)", fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.04em", marginBottom: "2rem", maxWidth: 820 }}>
          Software de alto<br />
          desempenho para<br />
          <span style={{ background: `linear-gradient(90deg, ${CL}, #B8B2FF)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>empresas exigentes.</span>
        </h1>

        <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "rgba(238,240,247,0.52)", maxWidth: 520, marginBottom: "3rem" }}>
          Arquitectamos e desenvolvemos sistemas que crescem com o negócio —
          do MVP ao produto enterprise, com rigor técnico e entrega previsível.
        </p>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "5rem" }}>
          <button style={{ background: `linear-gradient(135deg, ${C}, #5E56E0)`, color: "#fff", padding: "0.9rem 2.2rem", fontSize: "0.92rem", fontWeight: 700, border: "none", borderRadius: 10, cursor: "pointer", boxShadow: "0 4px 24px rgba(123,114,245,0.35)" }}>
            Falar com a equipa →
          </button>
          <button style={{ background: "rgba(238,240,247,0.05)", color: "rgba(238,240,247,0.7)", padding: "0.9rem 2.2rem", fontSize: "0.92rem", fontWeight: 600, border: "1px solid rgba(238,240,247,0.1)", borderRadius: 10, cursor: "pointer" }}>
            Ver projectos
          </button>
        </div>

        {/* STATS strip */}
        <div style={{ display: "flex", gap: "0", borderTop: "1px solid rgba(238,240,247,0.06)", paddingTop: "2.5rem" }}>
          {STATS.map(([v, l], i) => (
            <div key={l} style={{ paddingRight: "3.5rem", marginRight: "3.5rem", borderRight: i < 3 ? "1px solid rgba(238,240,247,0.06)" : "none" }}>
              <span style={{ fontSize: "2rem", fontWeight: 800, display: "block", lineHeight: 1, letterSpacing: "-0.03em" }}>{v}</span>
              <span style={{ fontSize: "0.7rem", color: "rgba(238,240,247,0.35)", fontWeight: 500, letterSpacing: "0.08em", display: "block", marginTop: 6 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES — glassmorphism cards */}
      <div style={{ background: BG2, borderTop: "1px solid rgba(238,240,247,0.05)", borderBottom: "1px solid rgba(238,240,247,0.05)", padding: "4rem 3rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "rgba(238,240,247,0.3)", marginBottom: "0.75rem", fontWeight: 600 }}>SERVIÇOS</p>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "2.5rem" }}>A nossa especialização</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
            {SERVICES.map(([num, title, desc]) => (
              <div key={num} style={{ background: "rgba(238,240,247,0.03)", border: "1px solid rgba(238,240,247,0.07)", borderRadius: 14, padding: "2rem", backdropFilter: "blur(8px)" }}>
                <div style={{ width: 40, height: 40, background: "rgba(123,114,245,0.12)", border: "1px solid rgba(123,114,245,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <span style={{ color: CL, fontSize: "0.75rem", fontWeight: 800 }}>{num}</span>
                </div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.6rem" }}>{title}</h3>
                <p style={{ fontSize: "0.83rem", color: "rgba(238,240,247,0.42)", lineHeight: 1.7 }}>{desc}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: CL, marginTop: "1.25rem", cursor: "pointer" }}>Saber mais <span>→</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "2rem", fontSize: "0.6rem", letterSpacing: "0.25em", color: "rgba(238,240,247,0.12)" }}>
        CONCEITO 03 — ÍNDIGO PROFUNDO · BG #0C0F1A · TEXT #EEF0F7 · ACC #7B72F5
      </div>
    </section>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function DemoPage() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* ── BARRA DE NAVEGAÇÃO DOS CONCEITOS ── */}
      <nav style={{
        position: "fixed", inset: "0 0 auto 0", zIndex: 100, height: 56,
        background: "rgba(4,4,12,0.94)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2.5rem",
      }}>
        <span style={{ fontSize: "0.62rem", letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", fontWeight: 600, textTransform: "uppercase" }}>
          Demonstrativo · Layout Institucional
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[
            { id: "c1", label: "01 — Noir Dorado", color: "#C9A35A" },
            { id: "c2", label: "02 — Branco Autoridade", color: "#4A8AF4" },
            { id: "c3", label: "03 — Índigo Premium", color: "#A49DFF" },
          ].map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => go(id)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color, padding: "0.4rem 1.1rem", fontSize: "0.68rem", letterSpacing: "0.08em", fontWeight: 600, cursor: "pointer", borderRadius: 6 }}
            >
              {label}
            </button>
          ))}
        </div>
        <a href="/" style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textDecoration: "none" }}>
          ← VOLTAR AO SITE
        </a>
      </nav>

      <ConceptNoir />
      <ConceptBranco />
      <ConceptIndigo />
    </div>
  );
}
