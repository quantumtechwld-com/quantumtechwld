# Análise de Riscos — Migração Visual para Plasma Violeta
> Quantum Technology Agency · Abril 2026
>
> Análise dos riscos de migrar o site real (actualmente cyan/blue) para a nova
> identidade Plasma Violeta, com plano de execução faseado e critérios de rollback.

---

## Estado actual vs target

| Dimensão | Actual | Target |
|----------|--------|--------|
| Cor de acento | `#22d3ee` (cyan-400) | `#9B59FF` (Plasma Violeta) |
| Logo símbolo | Circuit brackets | Superposição ∞ ✅ já aplicado |
| Logo texto "Tech" | `#22d3ee` | `#9B59FF` ✅ já aplicado |
| Botões CTA | `bg-cyan-500` gradiente azul | `bg-violet-600/#9B59FF` |
| Badge hero | borda/texto cyan | borda/texto violeta |
| Progress bars | `from-cyan-500 to-blue-500` | `from-violet-500 to-violet-400` |
| Orbs de fundo | `cyan-500/10` + `violet-500/10` | `violet-600/12` (todos violeta) |
| Accent text | `from-cyan-400 via-blue-400` | `from-violet-400 via-violet-500` |
| Ícones | Emojis ⚡🧠🤖 + SVG inline WhatsApp | `lucide-react` (UI) + Lordicon (animados) |

---

## 1. Mapa de riscos

### RISCO 1 — Contraste de acessibilidade (WCAG AA)
**Probabilidade:** Alta | **Impacto:** Alto

Violeta `#9B59FF` sobre fundo `#050816` tem ratio de ~6.8:1 — passa WCAG AA.  
Mas variantes claras (`#C084FC`, `text-violet-300`) têm ratio mais baixo.

**Ficheiros de risco:**
- `HomeClient.tsx` — badge text (`text-violet-300` sobre bg escuro)
- Botões com hover `bg-[#C084FC]` — verificar sobre branco

**Mitigação:**
```bash
# Verificar com:
npx @accessibility-checker/cli check --url http://localhost:3000
# Ou manualmente: https://webaim.org/resources/contrastchecker/
# Regra: texto normal ≥ 4.5:1 | texto grande ≥ 3:1
```

---

### RISCO 2 — Referências cyan hardcoded em 20+ locais
**Probabilidade:** Certa | **Impacto:** Médio

O Tailwind usa classes directas (sem tokens centrais). Uma pesquisa rápida encontra:

```
HomeClient.tsx:
  - bg-cyan-500 (2×)  → hover:bg-cyan-400
  - shadow-cyan-500/20, shadow-cyan-500/40
  - border-cyan-500/20, bg-cyan-500/5, text-cyan-300, text-cyan-400
  - from-cyan-500 to-blue-500 (3×)
  - from-cyan-400 via-blue-400 to-violet-400

GsapAnimations.tsx:
  - Paleta de cores no animateColorShift (já corrigido no logo)

portal/page.tsx, admin/page.tsx:
  - accent refs a auditar
```

**Mitigação:** Migração faseada por secção (ver Fase 2 abaixo). Nunca substituição global de `cyan` → `violet` de uma vez (risco de quebrar contraste em contextos que propositadamente usam cyan como cor de dados).

> ⚠️ **Atenção:** `#22D4C2` (cyan) deve ser **mantido** como cor complementar em:
> gráficos de barras, métricas de dados, indicadores de estado (verde/teal),
> technologia neutral (stack badges). Apenas os **acentos de UI** migram para violeta.

---

### RISCO 3 — Regressão visual no Portal + Admin
**Probabilidade:** Média | **Impacto:** Médio

O portal (`/portal`) e o admin (`/admin`) têm os seus próprios estilos com referências cyan.  
Alterar apenas a landing deixa inconsistência entre áreas do produto.

**Ficheiros a auditar:**
```
src/app/portal/page.tsx
src/app/portal/briefing/
src/app/admin/page.tsx
src/app/admin/users/page.tsx
src/app/admin/orders/page.tsx
```

**Mitigação:** A migração do portal/admin é fase separada (Fase 3). Priorizar a landing page que é pública.

---

### RISCO 4 — GsapAnimations.tsx não usa novos tokens
**Probabilidade:** Certa | **Impacto:** Baixo-Médio

O ficheiro `GsapAnimations.tsx` (que anima o hero) pode ter hardcoded `#22d3ee` nos orbs e animações de cor.

**Mitigação:** Verificar e actualizar junto com `HomeClient.tsx` na Fase 2.

---

### RISCO 5 — Sem design tokens CSS (risco estrutural)
**Probabilidade:** Certa | **Impacto:** Alto a longo prazo

Actualmente não há variáveis CSS nem tokens Tailwind centrais para as cores de acento.  
Cada mudança futura de paleta exige busca manual em todos os ficheiros.

**Mitigação (Fase 1 — antes de tudo):**
```css
/* globals.css — adicionar tokens */
:root {
  --accent:        #9B59FF;
  --accent-light:  #C084FC;
  --accent-muted:  rgba(155,89,255,0.12);
  --accent-border: rgba(155,89,255,0.18);
  --cyan:          #22D4C2;
  --bg-base:       #050816;
  --bg-surface:    #07050F;
  --bg-card:       #0A0A1A;
}
```

```ts
// tailwind.config.ts — expor como classes
theme: {
  extend: {
    colors: {
      accent:       "var(--accent)",
      "accent-light": "var(--accent-light)",
      cyan:         "var(--cyan)",
    }
  }
}
```

**Benefício:** `bg-accent`, `text-accent-light`, `border-accent/20` — qualquer mudança futura é 1 linha em globals.css.

---

### RISCO 6 — Percepção de marca (negativo de violeta)
**Probabilidade:** Baixa | **Impacto:** Alto

Violeta intenso pode ser percebido como "criativo/artístico" em vez de "tech sério".  
O cyan actual tem conotação mais "tech/científico".

**Mitigação:** O combinar violeta `#9B59FF` com branco limpo, fundo muito escuro `#050816` e tipografia apertada resulta em "premium tech" — o mesmo posicionamento de Stripe, Linear, Vercel. A decisão está validada pela exploração em `/demo/paletas`.

---

## 2. Plano de execução faseado

### Fase 0 — Tokens CSS (pré-requisito)
**Estimativa:** 30 min | **Impacto de risco:** Elimina Risco 5

1. Adicionar variáveis CSS em `globals.css`
2. Expor no `tailwind.config.ts` ou como custom properties Tailwind v4
3. **Não mudar nenhuma cor ainda** — só definir os tokens

---

### Fase 1 — Logo + nav (já feito parcialmente ✅)
**Estado:** Logo aplicado. Nav CTA e "Área do Cliente" ainda em cyan.

Pendente:
- [ ] `HomeClient.tsx` nav: `bg-cyan-500` → `bg-[var(--accent)]`
- [ ] `HomeClient.tsx` nav hover: `hover:bg-cyan-400` → `hover:bg-[var(--accent-light)]`
- [ ] `HomeClient.tsx` nav glow: `rgba(6,182,212,0.4)` → `rgba(155,89,255,0.4)`

**Critério de aprovação:** Nav com logo + botão visualmente coesos.

---

### Fase 2 — Hero completo
**Estimativa:** 1–2h | **Impacto:** Maior transformação visual

Mudanças em `HomeClient.tsx`:
- [ ] Badge hero: `border-cyan-500/20 bg-cyan-500/5 text-cyan-300` → violeta
- [ ] Dot de ping: `bg-cyan-400` → `bg-violet-400`
- [ ] H1 gradiente: `from-cyan-400 via-blue-400` → `from-violet-400 via-violet-500`
- [ ] CTA principal: `from-cyan-500 to-blue-500` → `from-violet-600 to-violet-500`
- [ ] CTA sombras: `shadow-cyan-500/*` → `shadow-violet-500/*`
- [ ] Orbs de fundo: `cyan-500/10` → `violet-600/12` (nos 3 orbs)
- [ ] Dashboard mockup barra de chart: `from-cyan-500 to-blue-400` → `from-violet-500 to-violet-400`
- [ ] Progress bars: `from-cyan-500 to-blue-500` → `from-violet-500 to-violet-400`
- [ ] Secção Serviços: manter accent colors individuais (cyan/violet/emerald) — não migrar estes

> ⚠️ **Preservar cyan em:** barras de chart, "Receita mensal" label, complementares tech. Só migram os elementos de UI/branding.

**Critério de aprovação:** Hero visualmente consistente. Comparar com `/demo/paletas` conceito Plasma Violeta.

---

### Fase 3 — Restante landing (serviços, stats, footer)
**Estimativa:** 1h

- [ ] Stats section: número highlight color
- [ ] Método section: step number color
- [ ] Tech marquee: sem accent — manter neutro
- [ ] Footer: link hover color

---

### Fase 4 — Portal + Admin (sessão separada)
**Estimativa:** 2–3h | **Pré-requisito:** Fases 0–3 completas e testadas

- [ ] Auditar `portal/page.tsx`
- [ ] Auditar componentes de portal
- [ ] Auditar admin pages
- [ ] Verificar badges de status (manter cyan/green/red semânticos — não são accent)

---

## 3. Critérios de rollback

Se após a Fase 2 o resultado visual não for aprovado:

```bash
# Git — reverter HomeClient.tsx para estado anterior
git checkout HEAD~1 -- src/components/home/HomeClient.tsx

# Logo mantém-se (Superposição já foi aprovado)
# LogoTextAnimated mantém-se (#9B59FF no "Tech" aprovado)
```

---

## 4. Checklist de validação por fase

```
□ TypeScript sem erros (npx tsc --noEmit)
□ Build limpo (npm run build)
□ Visual testado em:
    □ Desktop 1440px
    □ Tablet 768px
    □ Mobile 375px
□ Contraste WCAG AA em textos críticos
□ Animações GSAP funcionais (logo + hero)
□ Dark mode (site é sempre dark — verificar mesmo assim overrides)
□ Teste manual no browser antes de commit
```

---

### Fase 5 — Ícones (independente, baixo risco)
**Estimativa:** 1–2h | **Risco:** Baixo | **Pré-requisito:** nenhum (pode ser feita em qualquer momento)

- [ ] `HomeClient.tsx` secção serviços: substituir emojis `⚡🧠🤖` por `<Zap />`, `<BrainCircuit />`, `<Bot />` (Lucide)
- [ ] Opcionalmente: descarregar 3 JSONs Lordicon correspondentes → `src/icons/lordicon/` e usar `<LordiconPlayer>` com `trigger="loop-on-hover"`
- [ ] Nav: adicionar `<Search />`, `<Bell />` onde aplicável
- [ ] Verificar ícone WhatsApp inline (SVG) — manter ou substituir por `<MessageCircle />` do Lucide
- [ ] Portal/admin: substituir emojis residuais por Lucide nos formulários e badges

> **Nota:** Esta fase não depende da migração de paleta. Pode ser executada antes, durante ou depois das outras fases.

---

## 5. Dependências entre tarefas

```
Fase 0 (tokens)
    └── Fase 1 (nav)
            └── Fase 2 (hero) ← maior risco visual
                    └── Fase 3 (landing completa)
                            └── Fase 4 (portal/admin) ← sessão separada

Fase 5 (ícones) ← independente, qualquer ordem
```

> **Nota:** Fase 0 e Fase 1 podem ser feitas em conjunto numa única sessão curta.
> Fase 2 requer teste visual manual antes de continuar.
> Fase 4 requer que o utilizador valide as fases anteriores em produção primeiro.
> Fase 5 é totalmente independente — ideal para sessão curta de melhorias rápidas.
