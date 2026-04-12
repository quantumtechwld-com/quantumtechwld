"use client";

/**
 * /demo/icons — Explorador de bibliotecas de ícones
 *
 * Mostra Lucide React (funcional) + padrão de integração Lordicon
 * em todos os contextos reais do projecto:
 *   nav · cards de serviços · steps · badges · formulário · admin · status
 */

import {
  Zap, BrainCircuit, Bot, Globe, Code2, Workflow,
  ArrowRight, ExternalLink, Check, X, AlertTriangle, Info,
  User, Mail, Phone, Building2, MessageSquare, Send,
  LayoutDashboard, FileText, CreditCard, Settings, LogOut,
  Clock, TrendingUp, ShieldCheck, Star, Sparkles,
  Menu, Bell, Search, Plus, Pencil,
  BarChart3, Package, Users, CircleDollarSign,
  Loader2, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

const ACC  = "#9B59FF";
const ACCC = "#C084FC";
const CYAN = "#22D4C2";
const BG   = "#07050F";
const CARD = "rgba(255,255,255,0.025)";
const BORDER = "rgba(255,255,255,0.07)";

// ── Helpers de UI ─────────────────────────────────────────────────────────────
function Label({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p style={{ fontSize: "0.58rem", letterSpacing: "0.28em", color: "rgba(255,255,255,0.2)", marginBottom: "1rem", fontWeight: 700, textTransform: "uppercase" }}>
      {children}
    </p>
  );
}

function Card({ children, style }: Readonly<{ children: React.ReactNode; style?: React.CSSProperties }>) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.25rem", ...style }}>
      {children}
    </div>
  );
}

function Pill({ children, color = ACC }: Readonly<{ children: React.ReactNode; color?: string }>) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 999, padding: "0.25rem 0.75rem", fontSize: "0.7rem", color, fontWeight: 600 }}>
      {children}
    </span>
  );
}

// ── SECÇÃO: Índice ─────────────────────────────────────────────────────────────
const SECTIONS = [
  "Serviços", "Nav", "Formulário", "Status / Badges",
  "Admin Dashboard", "Comparação", "Lordicon — Integração",
];

export default function IconsDemoPage() {
  return (
    <div style={{ fontFamily: "system-ui,-apple-system,'Segoe UI',sans-serif", background: BG, color: "#EEF0F7", minHeight: "100vh" }}>

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid rgba(155,89,255,0.12)", padding: "0 2.5rem", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(7,5,15,0.94)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="/demo/logo" style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>← LOGO</a>
          <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.1)" }}>|</span>
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.28em", color: "rgba(255,255,255,0.28)", fontWeight: 600 }}>ÍCONES — CONTEXTOS DE USO</span>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          {SECTIONS.map((s, i) => (
            <a key={s} href={`#s${i}`} style={{ fontSize: "0.58rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.22)", textDecoration: "none" }}>{s}</a>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 2rem 5rem", display: "flex", flexDirection: "column", gap: "3.5rem" }}>

        {/* INTRO */}
        <div>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.4em", color: "rgba(255,255,255,0.18)", marginBottom: "0.5rem", fontWeight: 700 }}>PASSO 4 — ÍCONES</p>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>Ícones em contexto real</h1>
          <p style={{ fontSize: "0.85rem", color: "rgba(238,240,247,0.38)", maxWidth: 560 }}>
            Lucide React (instalado ✓) em todos os contextos do projecto. Padrão de integração Lordicon no final.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <Pill color={CYAN}>lucide-react v1.8 ✓ instalado</Pill>
            <Pill color={ACC}>@lordicon/element v2.1 ✓ instalado</Pill>
          </div>
        </div>

        {/* ══ S0 — CARDS DE SERVIÇOS ══════════════════════════════════════ */}
        <div id="s0">
          <Label>Serviços — substituição dos emojis actuais</Label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {[
              { icon: <Zap size={28} strokeWidth={1.5} />, title: "Websites & Landing Pages", desc: "Páginas com alta performance, SEO técnico e foco em conversão. Do design ao deploy em dias.", color: CYAN, from: "#22D4C2", to: "#0EA5E9", was: "⚡" },
              { icon: <BrainCircuit size={28} strokeWidth={1.5} />, title: "Sistemas sob Medida", desc: "CRMs, ERPs, portais e plataformas alinhadas ao processo de negócio, com UX premium.", color: ACC, from: "#9B59FF", to: "#7C3AED", was: "🧠" },
              { icon: <Bot size={28} strokeWidth={1.5} />, title: "IA & Automação n8n", desc: "Agentes inteligentes, fluxos automatizados e integrações que eliminam trabalho manual.", color: "#34D399", from: "#34D399", to: "#059669", was: "🤖" },
            ].map((s) => (
              <div key={s.title} style={{ background: `linear-gradient(135deg, ${s.from}10, ${s.to}08)`, border: `1px solid ${s.from}25`, borderRadius: 14, padding: "1.5rem" }}>
                <div style={{ color: s.color, marginBottom: "1rem" }}>{s.icon}</div>
                <p style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>{s.title}</p>
                <p style={{ fontSize: "0.75rem", color: "rgba(238,240,247,0.45)", lineHeight: 1.65 }}>{s.desc}</p>
                <p style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.15)", marginTop: "0.75rem", letterSpacing: "0.1em" }}>era: {s.was}</p>
              </div>
            ))}
          </div>

          {/* Mais ícones de serviço disponíveis */}
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.18)", marginBottom: "0.75rem", letterSpacing: "0.12em" }}>OUTROS DISPONÍVEIS</p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {[
                { icon: <Globe size={20} strokeWidth={1.5} />, label: "Globe" },
                { icon: <Code2 size={20} strokeWidth={1.5} />, label: "Code2" },
                { icon: <Workflow size={20} strokeWidth={1.5} />, label: "Workflow" },
                { icon: <ShieldCheck size={20} strokeWidth={1.5} />, label: "ShieldCheck" },
                { icon: <TrendingUp size={20} strokeWidth={1.5} />, label: "TrendingUp" },
                { icon: <Sparkles size={20} strokeWidth={1.5} />, label: "Sparkles" },
                { icon: <CircleDollarSign size={20} strokeWidth={1.5} />, label: "Dollar" },
                { icon: <Package size={20} strokeWidth={1.5} />, label: "Package" },
              ].map((i) => (
                <div key={i.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem" }}>
                  <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.03)", border: BORDER, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(238,240,247,0.5)" }}>{i.icon}</div>
                  <span style={{ fontSize: "0.52rem", color: "rgba(255,255,255,0.18)", letterSpacing: "0.08em" }}>{i.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ S1 — NAVEGAÇÃO ═══════════════════════════════════════════════ */}
        <div id="s1">
          <Label>Nav — mobile menu + acções</Label>
          <Card>
            {/* Nav desktop */}
            <div style={{ background: "#050816", border: "1px solid rgba(155,89,255,0.1)", borderRadius: 10, padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div style={{ width: 28, height: 28, background: `${ACC}20`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap size={14} color={ACC} strokeWidth={2} />
                </div>
                <span style={{ fontSize: "0.65rem", letterSpacing: "0.35em", fontWeight: 800 }}>QUANTUM <span style={{ color: ACC }}>TECH</span></span>
              </div>
              <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.62rem", letterSpacing: "0.12em", color: "rgba(238,240,247,0.35)", alignItems: "center" }}>
                {["Serviços", "Projetos", "Contato"].map(l => <span key={l}>{l}</span>)}
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <Search size={15} color="rgba(238,240,247,0.3)" />
                <Bell size={15} color="rgba(238,240,247,0.3)" />
                <button type="button" style={{ background: ACC, border: "none", color: "#fff", padding: "0.35rem 0.9rem", borderRadius: 6, fontSize: "0.6rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.1em" }}>PROPOSTA</button>
              </div>
            </div>
            {/* Nav mobile */}
            <div style={{ background: "#050816", border: "1px solid rgba(155,89,255,0.1)", borderRadius: 10, padding: "0 1.25rem", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Menu size={18} color="rgba(238,240,247,0.5)" />
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.3em", fontWeight: 800 }}>QUANTUM <span style={{ color: ACC }}>TECH</span></span>
              <Plus size={18} color={ACC} />
            </div>
          </Card>
        </div>

        {/* ══ S2 — FORMULÁRIO ══════════════════════════════════════════════ */}
        <div id="s2">
          <Label>Formulário — campos com ícone prefixo</Label>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", maxWidth: 580 }}>
              {[
                { icon: <User size={15} strokeWidth={1.8} />, label: "Nome", placeholder: "João Silva" },
                { icon: <Mail size={15} strokeWidth={1.8} />, label: "Email", placeholder: "joao@empresa.com" },
                { icon: <Phone size={15} strokeWidth={1.8} />, label: "Telefone", placeholder: "+351 912 000 000" },
                { icon: <Building2 size={15} strokeWidth={1.8} />, label: "Empresa", placeholder: "Quantum Agency" },
              ].map((f) => (
                <div key={f.label}>
                  <p style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "rgba(238,240,247,0.4)", marginBottom: "0.4rem", fontWeight: 600 }}>{f.label}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(155,89,255,0.2)", borderRadius: 8, padding: "0.55rem 0.85rem" }}>
                    <span style={{ color: ACC, display: "flex" }}>{f.icon}</span>
                    <span style={{ fontSize: "0.72rem", color: "rgba(238,240,247,0.2)" }}>{f.placeholder}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* textarea */}
            <div style={{ marginTop: "0.75rem", maxWidth: 580 }}>
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "rgba(238,240,247,0.4)", marginBottom: "0.4rem", fontWeight: 600 }}>Mensagem</p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(155,89,255,0.2)", borderRadius: 8, padding: "0.65rem 0.85rem" }}>
                <span style={{ color: ACC, display: "flex", marginTop: 1 }}><MessageSquare size={15} strokeWidth={1.8} /></span>
                <span style={{ fontSize: "0.72rem", color: "rgba(238,240,247,0.2)" }}>Descreva o seu projecto...</span>
              </div>
            </div>
            {/* submit */}
            <button type="button" style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", background: ACC, border: "none", color: "#fff", padding: "0.65rem 1.5rem", borderRadius: 8, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em" }}>
              <Send size={14} strokeWidth={2} />
              Enviar proposta
            </button>
          </Card>
        </div>

        {/* ══ S3 — STATUS / BADGES ═════════════════════════════════════════ */}
        <div id="s3">
          <Label>Status & Badges — portal + admin</Label>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {[
              { icon: <Clock size={13} strokeWidth={2} />, label: "Aguardando", color: "#F59E0B" },
              { icon: <Loader2 size={13} strokeWidth={2} />, label: "Em progresso", color: CYAN },
              { icon: <CheckCircle2 size={13} strokeWidth={2} />, label: "Concluído", color: "#34D399" },
              { icon: <XCircle size={13} strokeWidth={2} />, label: "Cancelado", color: "#F87171" },
              { icon: <AlertCircle size={13} strokeWidth={2} />, label: "Revisão", color: ACC },
              { icon: <ShieldCheck size={13} strokeWidth={2} />, label: "Aprovado", color: "#34D399" },
            ].map((s) => (
              <Pill key={s.label} color={s.color}>
                {s.icon} {s.label}
              </Pill>
            ))}
          </div>
          {/* Toast / notificações */}
          <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 380 }}>
            <Label>Toasts / alertas</Label>
            {[
              { icon: <Check size={14} strokeWidth={2.5} />, text: "Proposta enviada com sucesso!", bg: "#34D39918", border: "#34D39940", color: "#34D399" },
              { icon: <AlertTriangle size={14} strokeWidth={2} />, text: "Pagamento pendente de confirmação.", bg: "#F59E0B18", border: "#F59E0B40", color: "#F59E0B" },
              { icon: <X size={14} strokeWidth={2.5} />, text: "Erro ao enviar formulário.", bg: "#F8717118", border: "#F8717140", color: "#F87171" },
              { icon: <Info size={14} strokeWidth={2} />, text: "Novo briefing disponível para análise.", bg: `${ACC}18`, border: `${ACC}40`, color: ACC },
            ].map((t) => (
              <div key={t.text} style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 9, padding: "0.65rem 0.9rem" }}>
                <span style={{ color: t.color, display: "flex", flexShrink: 0 }}>{t.icon}</span>
                <span style={{ fontSize: "0.72rem", color: "rgba(238,240,247,0.7)" }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ S4 — ADMIN DASHBOARD ════════════════════════════════════════ */}
        <div id="s4">
          <Label>Admin Dashboard — sidebar + KPIs</Label>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "1rem", background: "#04030D", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
            {/* sidebar */}
            <div style={{ background: "#030208", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "1rem 0" }}>
              <div style={{ padding: "0 1rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", fontWeight: 800, color: "rgba(238,240,247,0.5)" }}>ADMIN</span>
              </div>
              {[
                { icon: <LayoutDashboard size={15} strokeWidth={1.8} />, label: "Dashboard", active: true },
                { icon: <Users size={15} strokeWidth={1.8} />, label: "Utilizadores" },
                { icon: <FileText size={15} strokeWidth={1.8} />, label: "Briefings" },
                { icon: <Package size={15} strokeWidth={1.8} />, label: "Ordens" },
                { icon: <CreditCard size={15} strokeWidth={1.8} />, label: "Pagamentos" },
                { icon: <BarChart3 size={15} strokeWidth={1.8} />, label: "Relatórios" },
                { icon: <Settings size={15} strokeWidth={1.8} />, label: "Definições" },
                { icon: <LogOut size={15} strokeWidth={1.8} />, label: "Sair" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 1rem", background: item.active ? `${ACC}14` : "transparent", borderLeft: item.active ? `2px solid ${ACC}` : "2px solid transparent", cursor: "pointer", color: item.active ? ACC : "rgba(238,240,247,0.3)", fontSize: "0.7rem", fontWeight: item.active ? 600 : 400 }}>
                  {item.icon} {item.label}
                </div>
              ))}
            </div>
            {/* conteúdo */}
            <div style={{ padding: "1.25rem" }}>
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", marginBottom: "0.75rem", fontWeight: 600 }}>KPIs</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.65rem" }}>
                {[
                  { icon: <Users size={16} strokeWidth={1.8} />, label: "Clientes", val: "124", trend: "+12%", color: ACC },
                  { icon: <FileText size={16} strokeWidth={1.8} />, label: "Briefings", val: "38", trend: "+5", color: CYAN },
                  { icon: <CircleDollarSign size={16} strokeWidth={1.8} />, label: "Receita", val: "€84k", trend: "+8.2%", color: "#34D399" },
                  { icon: <Star size={16} strokeWidth={1.8} />, label: "Satisfação", val: "98%", trend: "=", color: "#F59E0B" },
                ].map((k) => (
                  <div key={k.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "0.8rem" }}>
                    <div style={{ color: k.color, marginBottom: "0.4rem" }}>{k.icon}</div>
                    <p style={{ fontSize: "0.58rem", color: "rgba(238,240,247,0.3)", marginBottom: "0.2rem" }}>{k.label}</p>
                    <p style={{ fontSize: "1rem", fontWeight: 800 }}>{k.val}</p>
                    <p style={{ fontSize: "0.6rem", color: "#34D399" }}>{k.trend}</p>
                  </div>
                ))}
              </div>
              {/* tabela de ordens */}
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", margin: "1rem 0 0.5rem", fontWeight: 600 }}>ÚLTIMAS ORDENS</p>
              {[
                { id: "#0041", client: "MedTech SA", status: "Em progresso", icon: <Loader2 size={12} />, color: CYAN },
                { id: "#0040", client: "RetailPlus", status: "Aguardando", icon: <Clock size={12} />, color: "#F59E0B" },
                { id: "#0039", client: "FinTrust", status: "Concluído", icon: <CheckCircle2 size={12} />, color: "#34D399" },
              ].map((o) => (
                <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "0.65rem", color: "rgba(238,240,247,0.4)", width: 48 }}>{o.id}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, flex: 1 }}>{o.client}</span>
                  <Pill color={o.color}>{o.icon} {o.status}</Pill>
                  <div style={{ display: "flex", gap: "0.5rem", marginLeft: "0.75rem" }}>
                    <Pencil size={12} color="rgba(238,240,247,0.2)" style={{ cursor: "pointer" }} />
                    <ExternalLink size={12} color="rgba(238,240,247,0.2)" style={{ cursor: "pointer" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ S5 — COMPARAÇÃO LUCIDE vs LORDICON ══════════════════════════ */}
        <div id="s5">
          <Label>Comparação — quando usar cada um</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Lucide */}
            <Card style={{ borderColor: `${CYAN}25` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <div style={{ width: 32, height: 32, background: `${CYAN}15`, border: `1px solid ${CYAN}30`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Code2 size={16} color={CYAN} strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.82rem" }}>Lucide React</p>
                  <p style={{ fontSize: "0.6rem", color: "rgba(238,240,247,0.3)" }}>UI/UX · Funcional</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {["Nav, sidebar, footer", "Botões e CTAs", "Campos de formulário", "Badges e status", "Tabelas e listas admin", "Indicadores de KPI"].map(u => (
                  <div key={u} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: "rgba(238,240,247,0.55)" }}>
                    <Check size={12} color={CYAN} strokeWidth={3} /> {u}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "0.6rem", color: "rgba(238,240,247,0.2)", marginTop: "0.9rem", lineHeight: 1.6 }}>
                Tree-shakeable · SSR-safe · Sem configuração adicional
              </p>
            </Card>
            {/* Lordicon */}
            <Card style={{ borderColor: `${ACC}25` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <div style={{ width: 32, height: 32, background: `${ACC}15`, border: `1px solid ${ACC}30`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={16} color={ACC} strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.82rem" }}>Lordicon</p>
                  <p style={{ fontSize: "0.6rem", color: "rgba(238,240,247,0.3)" }}>Visual · Impacto</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {["Cards de serviços (hero)", "Steps do processo", "Empty states", "Onboarding screens", "Destaque em landing page", "Testimoniais / social proof"].map(u => (
                  <div key={u} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: "rgba(238,240,247,0.55)" }}>
                    <Check size={12} color={ACC} strokeWidth={3} /> {u}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "0.6rem", color: "rgba(238,240,247,0.2)", marginTop: "0.9rem", lineHeight: 1.6 }}>
                Trigger loop-on-hover · Cores personalizáveis · JSON por ícone
              </p>
            </Card>
          </div>
        </div>

        {/* ══ S6 — INTEGRAÇÃO LORDICON ═════════════════════════════════════ */}
        <div id="s6">
          <Label>Lordicon — guia de integração</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Passo 1 */}
            <Card>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.18em", color: ACC, fontWeight: 700, marginBottom: "0.6rem" }}>PASSO 1 — Descarregar ícone</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(238,240,247,0.45)", lineHeight: 1.7, marginBottom: "0.75rem" }}>
                Ir a <span style={{ color: ACC }}>lordicon.com</span> → escolher ícone → Download → JSON (Lottie) → guardar em:
              </p>
              <div style={{ background: "#020108", border: "1px solid rgba(155,89,255,0.15)", borderRadius: 8, padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.68rem", color: CYAN, lineHeight: 1.8 }}>
                src/<br />
                &nbsp;icons/<br />
                &nbsp;&nbsp;lordicon/<br />
                &nbsp;&nbsp;&nbsp;zap.json<br />
                &nbsp;&nbsp;&nbsp;brain.json<br />
                &nbsp;&nbsp;&nbsp;robot.json
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                <p style={{ fontSize: "0.6rem", color: "rgba(238,240,247,0.2)", marginBottom: "0.4rem" }}>Estilo recomendado (dark mode):</p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {["Wired Outline", "Wired Flat", "System Solid"].map(s => (
                    <span key={s} style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.04)", border: BORDER, borderRadius: 5, padding: "0.2rem 0.6rem", color: "rgba(238,240,247,0.4)" }}>{s}</span>
                  ))}
                </div>
              </div>
            </Card>
            {/* Passo 2 */}
            <Card>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.18em", color: ACC, fontWeight: 700, marginBottom: "0.6rem" }}>PASSO 2 — Usar componente</p>
              <div style={{ background: "#020108", border: "1px solid rgba(155,89,255,0.15)", borderRadius: 8, padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.64rem", color: "#DDD", lineHeight: 1.9 }}>
                <span style={{ color: "#888" }}>{"// importar JSON e componente"}</span><br />
                <span style={{ color: ACCC }}>import</span> LordiconPlayer <span style={{ color: ACCC }}>from</span>{" "}<span style={{ color: CYAN }}>&quot;@/components/ui/LordiconPlayer&quot;</span>;<br />
                <span style={{ color: ACCC }}>import</span> zapIcon <span style={{ color: ACCC }}>from</span>{" "}<span style={{ color: CYAN }}>&quot;@/icons/lordicon/zap.json&quot;</span>;<br />
                <br />
                <span style={{ color: "#888" }}>{"// usar na secção Hero ou Cards"}</span><br />
                <span style={{ color: ACC }}>&lt;LordiconPlayer</span><br />
                &nbsp;&nbsp;icon=<span style={{ color: CYAN }}>{"{zapIcon}"}</span><br />
                &nbsp;&nbsp;trigger=<span style={{ color: CYAN }}>&quot;loop-on-hover&quot;</span><br />
                &nbsp;&nbsp;size=<span style={{ color: CYAN }}>{"{48}"}</span><br />
                &nbsp;&nbsp;colors=<span style={{ color: CYAN }}>&quot;primary:#9B59FF,secondary:#22D4C2&quot;</span><br />
                <span style={{ color: ACC }}>/&gt;</span>
              </div>
            </Card>
            {/* Passo 3 */}
            <Card>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.18em", color: ACC, fontWeight: 700, marginBottom: "0.6rem" }}>PASSO 3 — Paleta de cores (Plasma Violeta)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { prop: "primary", val: "#9B59FF", label: "Acento principal" },
                  { prop: "secondary", val: "#22D4C2", label: "Complementar cyan" },
                  { prop: "tertiary", val: "#C084FC", label: "Acento claro" },
                ].map(c => (
                  <div key={c.prop} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.7rem" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: c.val, flexShrink: 0 }} />
                    <div>
                      <span style={{ color: ACCC, fontFamily: "monospace" }}>{c.prop}</span>
                      <span style={{ color: "rgba(238,240,247,0.2)", fontSize: "0.6rem" }}> · {c.val} · {c.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: "0.75rem", fontFamily: "monospace", fontSize: "0.62rem", color: CYAN }}>
                colors=&quot;primary:#9B59FF,secondary:#22D4C2&quot;
              </p>
            </Card>
            {/* Passo 4 — triggers */}
            <Card>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.18em", color: ACC, fontWeight: 700, marginBottom: "0.6rem" }}>PASSO 4 — Triggers por contexto</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { trigger: "loop-on-hover", uso: "Cards de serviços, destaques" },
                  { trigger: "hover", uso: "Botões, CTAs, nav items" },
                  { trigger: "loop", uso: "Loading states, empty states" },
                  { trigger: "click", uso: "Confirmações, submit" },
                  { trigger: "morph", uso: "Toggle on/off, estados" },
                ].map(t => (
                  <div key={t.trigger} style={{ display: "flex", gap: "0.75rem", alignItems: "baseline" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: ACC, minWidth: 120 }}>{t.trigger}</span>
                    <span style={{ fontSize: "0.68rem", color: "rgba(238,240,247,0.4)" }}>→ {t.uso}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* CTA final */}
          <div style={{ marginTop: "1rem", background: `${ACC}08`, border: `1px solid ${ACC}20`, borderRadius: 12, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.25rem" }}>Componente pronto: <span style={{ color: ACCC }}>LordiconPlayer.tsx</span></p>
              <p style={{ fontSize: "0.72rem", color: "rgba(238,240,247,0.38)" }}>
                src/components/ui/LordiconPlayer.tsx · Basta descarregar os JSON de lordicon.com e importar
              </p>
            </div>
            <a href="https://lordicon.com" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: ACC, color: "#fff", padding: "0.55rem 1.15rem", borderRadius: 8, fontSize: "0.65rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.08em" }}>
              lordicon.com <ExternalLink size={12} strokeWidth={2.5} />
            </a>
          </div>
        </div>

        {/* PRÓXIMO PASSO */}
        <div style={{ borderTop: "1px solid rgba(155,89,255,0.1)", paddingTop: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)", marginBottom: "0.3rem", fontWeight: 600 }}>PRÓXIMO PASSO</p>
            <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>Fase 0 — Tokens CSS + migração de paleta</p>
            <p style={{ fontSize: "0.72rem", color: "rgba(238,240,247,0.3)", marginTop: "0.2rem" }}>Aplicar identidade Plasma Violeta ao site real</p>
          </div>
          <a href="/demo" style={{ display: "flex", alignItems: "center", gap: "0.4rem", border: `1px solid ${ACC}30`, color: ACC, padding: "0.55rem 1.15rem", borderRadius: 8, fontSize: "0.65rem", fontWeight: 700, textDecoration: "none" }}>
            Ver layouts <ArrowRight size={13} strokeWidth={2.5} />
          </a>
        </div>

      </div>
    </div>
  );
}
