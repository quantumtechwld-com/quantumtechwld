# Identidade Visual — Guia Técnico de Referência
> Quantum Technology Agency · Versão 2.0 · Abril 2026
>
> Este documento é a **fonte de verdade** para qualquer decisão visual no projecto.
> Toda implementação nova deve seguir os tokens e padrões aqui definidos.

---

## 1. Paleta — Plasma Violeta

**Decisão confirmada:** Plasma Violeta como cor de acento principal.  
**Data:** Abril 2026 | **Referência:** `/demo/paletas` (explorador interactivo)

### 1.1 Tokens principais

| Token | Valor | Uso |
|-------|-------|-----|
| `--accent` | `#9B59FF` | Acento primário — botões, bordas, glows |
| `--accent-light` | `#C084FC` | Acento claro — hover states, texto secundário |
| `--accent-muted` | `rgba(155,89,255,0.12)` | Fundos de cards, overlays |
| `--accent-border` | `rgba(155,89,255,0.18)` | Bordas subtis |
| `--cyan` | `#22D4C2` | Cor complementar — dados, métricas, tech |
| `--bg-base` | `#050816` | Fundo global |
| `--bg-surface` | `#07050F` | Surfaces elevadas |
| `--bg-card` | `#0A0A1A` | Cards e painéis |
| `--fg-primary` | `#EEF0F7` | Texto principal |
| `--fg-secondary` | `rgba(238,240,247,0.5)` | Texto secundário |
| `--fg-muted` | `rgba(238,240,247,0.25)` | Texto terciário / labels |

### 1.2 Escala de violeta

```
violet-900: #1A0533   (fundos profundos)
violet-800: #2E0D5C
violet-700: #4A1A8A
violet-600: #6B32C8
violet-500: #9B59FF   ← ACENTO PRINCIPAL
violet-400: #C084FC   ← ACENTO CLARO
violet-300: #DDB4FE
violet-200: #EDD9FF
violet-100: #F5EEFF   (texto sobre fundo escuro)
```

### 1.3 Gradientes de referência

```css
/* Hero / CTA principal */
background: linear-gradient(135deg, #9B59FF 0%, #7C3AED 100%);

/* Botão primário hover */
background: linear-gradient(135deg, #C084FC 0%, #9B59FF 100%);

/* Glow difuso (blobs de fundo) */
background: radial-gradient(circle, rgba(155,89,255,0.15) 0%, transparent 70%);

/* Gradiente de texto premium */
background: linear-gradient(to right, #C084FC, #9B59FF, #7C3AED);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Complementar cyan */
background: linear-gradient(135deg, #9B59FF 0%, #22D4C2 100%);
```

### 1.4 Sombras e glows

```css
/* Sombra de botão primário */
box-shadow: 0 0 24px rgba(155,89,255,0.35);

/* Hover state botão */
box-shadow: 0 0 40px rgba(155,89,255,0.55);

/* Borda luminosa de card */
border: 1px solid rgba(155,89,255,0.18);
box-shadow: inset 0 0 30px rgba(155,89,255,0.04);
```

---

## 2. Logo — Símbolo Superposição ∞

**Decisão confirmada:** Símbolo de Superposição Quântica.  
**Conceito:** Dois loops que se intersectam num ponto central branco — estado |0⟩ e |1⟩ co-existindo simultaneamente.

### 2.1 Ficheiro de implementação

```
src/components/home/LogoAnimated.tsx   — símbolo SVG com animações GSAP
src/components/home/LogoTextAnimated.tsx — texto "QuantumTech" animado
```

### 2.2 SVG — geometria do símbolo

```
viewBox: 0 0 40 40
```

| Elemento | Path | Cor | Função |
|----------|------|-----|--------|
| Loop esquerdo (|0⟩) | `M20,20 C20,20 5,8 5,20 C5,32 20,20 20,20` | `#9B59FF` | Estado quântico 0 |
| Loop direito (|1⟩) | `M20,20 C20,20 35,8 35,20 C35,32 20,20 20,20` | `#C084FC` | Estado quântico 1 |
| Eixo quântico | `M5,20 L35,20` | `#22D4C2` | Linha de superposição |
| Ring rotativo | `cx=20 cy=20 r=5.5` | `#9B59FF` | Dashed, rotation 8s |
| Nó esquerdo | `cx=5 cy=20 r=1.8` | `#9B59FF` | `data-node="corner"` |
| Nó direito | `cx=35 cy=20 r=1.8` | `#C084FC` | `data-node="corner"` |
| Nó central | `cx=20 cy=20 r=2.5` | `#ffffff` | `data-node="center"`, ponto de intersecção |

### 2.3 Glow blobs de fundo

| Blob | cx | cy | r | Fill |
|------|----|----|---|------|
| Esquerdo | 14 | 20 | 9 | `#9B59FF` |
| Direito | 26 | 20 | 9 | `#C084FC` |
| Centro | 20 | 20 | 5 | `#22D4C2` |

### 2.4 Atributos de data (hooks de animação GSAP)

```
data-draw="1"    → loop esquerdo (luz viajante)
data-draw="2"    → loop direito (luz viajante)
data-draw="3"    → eixo horizontal (luz viajante)
data-glow="cyan"   → blob esquerdo
data-glow="violet" → blob direito
data-glow="green"  → blob centro
data-ring          → ring rotativo
data-node="corner" → nós extremos (2x)
data-node="center" → nó central
```

### 2.5 Filtros SVG (definidos em `<defs>`)

```
#ald-glow-sm — feGaussianBlur stdDeviation=1.2 (paths)
#ald-glow-lg — feGaussianBlur stdDeviation=4   (blobs, nó central)
```

### 2.6 Escala de uso

| Contexto | Tamanho recomendado |
|----------|-------------------|
| Favicon | 16px |
| Nav mobile | 24px |
| Nav desktop | 30–34px |
| Footer | 36px |
| Hero / standalone | 64–120px |

### 2.7 Texto — LogoTextAnimated

```
Fonte: Geist Sans (var(--font-geist-sans))
"Quantum" → COLOR_QUANTUM = #C4C4CC  (alumínio)
"Tech"    → COLOR_TECH    = #9B59FF  (Plasma Violeta)
Animação: stroke-draw letra a letra → fill opacity reveal
```

---

## 3. GSAP — Padrões e Convenções

### 3.1 Import pattern (obrigatório)

```tsx
// Dynamic import dentro de useEffect — nunca import estático de GSAP
// Razão: SSR compatibility + code splitting

useEffect(() => {
  let ctx: any;
  (async () => {
    const { gsap } = await import("gsap");
    const el = ref.current;
    if (!el) return;
    ctx = gsap.context(() => {
      // animações aqui
    }, el);
  })();
  return () => ctx?.revert();
}, []);
```

### 3.2 Limite de aninhamento

```
Máximo 4 níveis de aninhamento em callbacks GSAP.
Extrair helpers para nível de módulo quando necessário.
```

### 3.3 Prefers-reduced-motion

```tsx
// SEMPRE verificar antes de iniciar animações
if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
```

### 3.4 Helpers de módulo (padrão estabelecido)

Funções de animação extraídas para fora do componente:

```tsx
// ✅ Correcto — helper no módulo
function animateTravelingLight(gsap: any, svg: SVGSVGElement) { ... }

// ❌ Incorrecto — inline dentro do useEffect/gsap.context
gsap.context(() => {
  const animate = () => { ... }  // evitar
})
```

### 3.5 Animações estabelecidas

| Animação | Técnica | Target |
|----------|---------|--------|
| Luz viajante | `strokeDasharray` snake | `[data-draw]` paths |
| Glow pulsante | `attr:{r}` + opacity yoyo | `[data-glow]` circles |
| Nó pulse | `attr:{r}` + opacity yoyo | `[data-node]` circles |
| Ring rotation | `rotation: 360` loop | `[data-ring]` |
| Color shift | `stroke` cycling | `[data-draw]` paths |
| Hero reveal | `fromTo` stagger words | `[data-hero]` |
| Orbs parallax | `x/y` on mousemove | `[data-orb]` |
| Float badges | `y` oscillation | `[data-float]` |
| Scroll counter | `innerHTML` update | stat numbers |

### 3.6 ScrollTrigger

```tsx
// Registar sempre antes de usar
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```

---

## 4. Tipografia

### 4.1 Fontes

```
Principal (sans):  Geist Sans   — var(--font-geist-sans)
Mono:             Geist Mono   — var(--font-geist-mono)
Fallback:         system-ui, -apple-system, 'Segoe UI', sans-serif
```

### 4.2 Escala tipográfica (landing page)

| Elemento | Classe Tailwind | Equiv. px |
|----------|----------------|-----------|
| H1 hero | `text-5xl md:text-[4.2rem] lg:text-[5rem]` | 48–80px |
| H2 secção | `text-4xl font-bold` | 36px |
| H3 card | `text-xl font-semibold` | 20px |
| Body | `text-lg leading-relaxed` | 18px |
| Caption | `text-xs tracking-widest uppercase` | 12px |
| Micro label | `text-[9px] uppercase tracking-wider` | 9px |

### 4.3 Pesos

```
400 — texto corrido
500 — labels, navegação
600 — semibold (subtítulos, botões)
700 — bold (headings)
800 — extrabold (hero H1, números de stat)
```

---

## 5. Layout — Estrutura e Grid

### 5.1 Wrapper principal

```html
<div class="mx-auto max-w-6xl px-6"> ... </div>
```

### 5.2 Secções da landing page

| Secção | Âncora | Descrição |
|--------|--------|-----------|
| Nav | — | Fixed, backdrop blur, h-16 |
| Hero | — | min-h-screen, 2 colunas em md+ |
| Serviços | `#services` | 3 cards, grid-cols-1 md:3 |
| Stats | — | 4 métricas, counter animado |
| Método | `#how` | 3 passos numerados |
| Portfólio | `#portfolio` | 3 cards de projecto |
| Tech stack | — | Marquee infinito |
| Lead form | `#lead` | Wizard 5 passos + IA |
| Footer | — | Info da empresa + links |

### 5.3 Hero — dois painéis

```
Esquerda:  texto + badge + CTA + mini stats
Direita:   dashboard mockup animado (hidden em mobile)
```

### 5.4 Background do hero

```
1. Base: bg-[#050816]
2. Grid overlay: linear-gradient branca 1px, opacity 0.028, size 60×60px
3. Orb 1: left-[10%] top-[20%] h-500 w-500 bg-violet-500/10 blur-[80px]
4. Orb 2: right-[8%] top-[28%] h-450 w-450 bg-violet-500/10 blur-[70px]
5. Orb 3: bottom-[15%] left-[40%] h-380 w-380 bg-indigo-600/10 blur-[60px]
```

> **Nota de migração:** Os orbs actualmente usam `cyan-500/10` e `violet-500/10`.
> Com a migração para Plasma Violeta, devem passar a `violet-600/12` nos 3 orbs.

---

## 6. Componentes — Padrões de tokens aplicados

Todos os componentes foram migrados para tokens `accent`. Ver Secção 10 para a tabela completa.

### 6.1 Botão primary

```tsx
// ✅ Padrão actual
<button className="bg-accent hover:bg-accent-light hover:shadow-[0_0_20px_var(--accent-glow)] text-white px-6 py-3 rounded-xl font-semibold transition">
```

### 6.2 Badge / label de secção

```tsx
<span className="text-accent text-xs uppercase tracking-widest">label</span>
```

### 6.3 Nav CTA

```tsx
<a className="bg-accent hover:bg-accent-light hover:shadow-[0_0_20px_var(--accent-glow)] rounded-lg px-4 py-2 text-sm font-semibold text-white transition">
```

### 6.4 Focus ring / border interactivo

```tsx
// Input / textarea
className="focus:border-accent focus:ring-accent/30"

// Focus ring button
className="focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
```

### 6.5 Card com destaque accent

```tsx
className="border border-accent/20 bg-accent/5 hover:bg-accent/10"
```

### 6.6 Uso correcto de cyan-tech

```tsx
// ✅ Correcto — dados, gráficos, métricas
<span className="text-cyan-tech">22.4k req/s</span>

// ❌ Incorrecto — UI, botões, ícones de serviço
<button className="bg-cyan-500">Enviar</button>  // usar bg-accent
```

---

## 7. Migração concluída — ficheiros actualizados

Todos os ficheiros foram migrados para o sistema de tokens `accent`. Listagem completa:

```
✅ src/app/globals.css                          — sistema de tokens completo
✅ src/components/home/HomeClient.tsx           — tokens + ícones Lucide
✅ src/components/home/LogoAnimated.tsx        — Plasma Violeta
✅ src/components/home/LogoTextAnimated.tsx    — Plasma Violeta
✅ src/components/lead-form/AIBriefingInput.tsx — accent
✅ src/components/scope/ScopePanel.tsx          — accent
✅ src/components/MessagesPanel.tsx             — accent
✅ src/components/orders/OrderPayment.tsx       — accent
✅ src/components/orders/OrderStatusBadge.tsx   — accent
✅ src/app/admin/page.tsx                       — accent
✅ src/app/admin/users/UsersClient.tsx          — accent
✅ src/app/admin/components/StatsGrid.tsx       — accent
✅ src/app/admin/briefing/[id]/ProposalEditForm.tsx
✅ src/app/admin/briefing/[id]/ProposalManager.tsx
✅ src/app/admin/orders/[id]/page.tsx
✅ src/app/portal/page.tsx
✅ src/app/portal/login/page.tsx
✅ src/app/portal/briefing/[id]/page.tsx
✅ src/app/portal/briefing/[id]/ProposalActions.tsx
✅ src/app/portal/briefing/[id]/ProposalComments.tsx
✅ src/app/portal/briefing/[id]/PrintButton.tsx
✅ src/app/portal/orders/[id]/OrderClientActions.tsx
✅ src/app/portal/biblioteca/[id]/page.tsx      — accent
```

**Cores que permanecem intencionalmente hardcoded:**
- `from-violet-500 to-cyan-500` — logótipo Q (AdminHeader + páginas de admin/orders e briefing)
- `from-blue-500 to-cyan-600` — gráfico de barras BriefingStats (cor de dados)
- Status colors (emerald/amber/red/yellow) — semântica de estado, não são de marca

---

## 8. Referências de exploração

| URL | Conteúdo |
|-----|----------|
| `/demo` | 3 conceitos de layout institucional |
| `/demo/paletas` | Explorador interactivo de 6 paletas com GSAP |
| `/demo/logo` | Explorador dos 5 símbolos com preview animado |
| `/demo/icons` | Demo do sistema de ícones duplo (Lucide + Lordicon) |

---

## 9. Ícones — Sistema Duplo

**Decisão confirmada (Abril 2026):** Lucide React para UI funcional + Lordicon para destaques animados.

### 9.1 Bibliotecas instaladas

| Biblioteca | Versão | Peso | Instalação |
|------------|--------|------|-----------|
| `lucide-react` | 1.8.0 | Tree-shaken (0 KB extra se não importado) | `npm i lucide-react` |
| `@lordicon/element` | 2.1.0 | ~45 KB base + JSON por ícone | `npm i @lordicon/element` |

### 9.2 Quando usar cada biblioteca

| Contexto | Biblioteca | Motivo |
|----------|------------|--------|
| Navegação (nav, sidebar) | Lucide | Leve, consistente, sem animação |
| Formulários (prefixos de campo) | Lucide | Semântico, acessível com `aria-hidden` |
| Badges de estado (loading, erro, sucesso) | Lucide | `Loader2` com `animate-spin`, `CheckCircle2`, `XCircle` |
| Tabelas e listas no admin | Lucide | Clareza, sem distracção |
| Cards de serviços (hero/landing) | Lordicon | Animação `loop-on-hover` reforça o conceito de cada serviço |
| Steps / timeline de processo | Lordicon | Anima ao entrar no viewport (`IntersectionObserver`) |
| Hero highlights (acima do fold) | Lordicon | Impressão premium no primeiro contacto |
| Botões de acção (confirmação, envio) | Lordicon `click` | Feedback imediato visual |

> **Regra geral:** Lucide é o padrão. Lordicon é a excepção — só onde a animação acrescenta valor percepcionável.

### 9.3 Mapeamento por contexto do projecto

#### HomeClient.tsx — secção de serviços
| Serviço actual | Ícone Lucide | Alternativa Lordicon |
|----------------|-------------|---------------------|
| ⚡ Automação | `<Zap />` | `automation.json` com `loop-on-hover` |
| 🧠 IA | `<BrainCircuit />` | `brain.json` com `loop-on-hover` |
| 🤖 Chatbots | `<Bot />` | `robot.json` com `loop-on-hover` |

#### Nav
```tsx
import { Search, Bell, Menu, Plus, LogOut, ChevronRight } from 'lucide-react'
```

#### Formulários (briefing, lead, profile)
```tsx
import { User, Mail, Phone, Building2, Send, MessageSquare, Lock } from 'lucide-react'
```

#### Badges / estado
```tsx
import { Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
// Loader2 → className="animate-spin"
```

#### Admin (sidebar, KPIs, tabelas)
```tsx
import { LayoutDashboard, Users, FileText, CreditCard, Settings, TrendingUp, Eye } from 'lucide-react'
```

### 9.4 Componente LordiconPlayer

**Localização:** `src/components/ui/LordiconPlayer.tsx`

```tsx
import LordiconPlayer from '@/components/ui/LordiconPlayer'
import robotJson from '@/icons/lordicon/robot.json'

<LordiconPlayer
  icon={robotJson}
  trigger="loop-on-hover"   // "hover" | "loop" | "loop-on-hover" | "click" | "morph" | "none"
  size={48}
  colors="primary:#9B59FF,secondary:#22D4C2"
  stroke={55}               // 1–100, espessura do traço
/>
```

**Triggers recomendados por contexto:**

| Trigger | Contexto de uso |
|---------|----------------|
| `loop-on-hover` | Cards de serviços, features |
| `hover` | Botões de acção, ícones de nav |
| `loop` | Estados de loading, backgrounds decorativos |
| `click` | Confirmações (envio de formulário, acção conclúida) |
| `morph` | Transições de estado (ex: toggle) |
| `none` | Estático mas com visual premium |

**JSONs de ícones:** devem ser descarregados manualmente em [lordicon.com](https://lordicon.com) e guardados em `src/icons/lordicon/*.json`.

> ⚠️ **Nota de versão:** `@lordicon/element@2.1.0` — `defineElement()` não aceita argumentos.
> Não usar `defineElement(Player)` — causará erro de runtime.

### 9.5 Acessibilidade

```tsx
// Lucide — sempre com aria-hidden em ícones decorativos
<Zap size={20} aria-hidden="true" />

// Lucide — com label quando é o único elemento interactivo
<button>
  <Search size={20} />
  <span className="sr-only">Pesquisar</span>
</button>

// LordiconPlayer — sempre decorativo, nunca interactivo isolado
// Envolver sempre num elemento com texto visível ou aria-label
```

---

## 10. Tokens de cor — Referência rápida para manutenção

> **Como mudar a cor de acento do projecto:** editar apenas `--accent` e `--accent-light` em `src/app/globals.css` → tudo o resto actualiza automaticamente.

### 10.1 Tokens activos (`src/app/globals.css` → `:root`)

| Token CSS | Valor | Classe Tailwind | Usos típicos |
|-----------|-------|-----------------|--------------|
| `--accent` | `#9B59FF` | `bg-accent` `text-accent` `border-accent` `ring-accent` | Botões primários, labels de secção, badges activos |
| `--accent-light` | `#C084FC` | `bg-accent-light` `text-accent-light` | States hover, texto secundário colorido |
| `--accent-dim` | `#7C3AED` | `bg-accent-dim` | Botões pressed/darker variant |
| `--accent-muted` | `rgba(155,89,255,0.12)` | `bg-accent-muted` | Fundos subtis de card |
| `--accent-border` | `rgba(155,89,255,0.18)` | `border-accent-border` | Bordas de containers |
| `--accent-glow` | `rgba(155,89,255,0.4)` | — (usar directo) | `shadow-[0_0_20px_var(--accent-glow)]` em hover/focus |
| `--cyan` | `#22D4C2` | `bg-cyan-tech` `text-cyan-tech` | Gráficos, métricas, indicadores de dados **APENAS** |
| `--bg-base` | `#050816` | — | Fundo global (definido em `body`) |
| `--bg-surface` | `#07050F` | `bg-bg-surface` | Surfaces elevadas |
| `--bg-card` | `#0A0A1A` | `bg-bg-card` | Cards e painéis |

### 10.2 Modificadores de opacidade (Tailwind v4)

```tsx
bg-accent/5    → rgba(155,89,255, 0.05)   // fundo muito subtil
bg-accent/10   → rgba(155,89,255, 0.10)   // hover de fundo subtil
bg-accent/15   → rgba(155,89,255, 0.15)   // badge background
bg-accent/20   → rgba(155,89,255, 0.20)   // mensagem own / destaque
border-accent/20 → rgba(155,89,255, 0.20)  // borda de card
border-accent/30 → rgba(155,89,255, 0.30)  // borda de badge
ring-accent/30   → rgba(155,89,255, 0.30)  // focus ring
ring-accent/50   → rgba(155,89,255, 0.50)  // focus ring mais visível
text-accent/70   → rgba(155,89,255, 0.70)  // label ligeiramente atenuada
```

### 10.3 Como adicionar um novo token

1. Adicionar CSS var em `:root {}` em `globals.css`
2. Expor no bloco `@theme inline {}`:
   ```css
   --color-meu-token: var(--meu-token);
   ```
3. Usar em qualquer ficheiro como `bg-meu-token`, `text-meu-token`, etc.
4. Documentar na tabela 10.1 acima.

### 10.4 Cores que NÃO usam tokens accent (intencionais)

| Cor hardcoded | Localização | Motivo |
|--------------|-------------|--------|
| `from-violet-500 to-cyan-500` | AdminHeader + logos de admin | Gradiente do logótipo Q — design intencional |
| `from-blue-500 to-cyan-600` | BriefingStats, barras de gráfico | Dados/tech — usa cyan-tech, não accent |
| `emerald-*` | Status ACTIVE, APPROVED, sucesso | Semântica de estado (verde = OK) |
| `amber-*` | Status PENDING, alertas | Semântica de estado (amarelo = atenção) |
| `red-*` | Status SUSPENDED, erros | Semântica de estado (vermelho = erro) |
| `yellow-*` | Avisos | Semântica de estado |
| `violet-*` (directo) | ADMIN role badge, alguns elementos decorativos | Violet puro sem token — aceitável para decorativo |
