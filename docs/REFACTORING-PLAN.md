# Plano de Refactoring — Quantum Technology Agency

> Gerado em: 22/03/2026 | SonarQube: 0 issues (após fix commit `6c98808`)

## Leitura obrigatória antes de executar refactors

Este documento não deve ser executado isoladamente.

Antes de qualquer refactoring, consultar nesta ordem:

1. `AGENTS.md`
2. `.github/copilot-instructions.md`
3. `docs/QUALITY-EXECUTION-PLAN.md`
4. `docs/DEVELOPER-GUIDE.md`
5. `docs/REFACTORING-PLAN.md`
6. `docs/COMPONENTIZATION-GUIDE.md` — limites de tamanho, Server vs Client
7. `docs/API-FIRST-ANALYSIS.md` — extração para services, versionamento

### Regra de priorização

As ações listadas aqui devem respeitar:

- o mês corrente definido em `docs/QUALITY-EXECUTION-PLAN.md`
- os gates de segurança, estabilidade, build, typecheck e release
- a prioridade do backlog técnico vigente

Se houver conflito entre refactor desejável e risco operacional atual, o risco operacional tem prioridade.

---

## P1 — CRÍTICO

### 1. Quebrar `src/components/lead-form.tsx` (485 linhas)
- **Problema:** Wizard 5 passos + análise IA + validação + routing + 10 estados num só arquivo
- **Solução:** Dividir em:
  - `LeadFormContainer` — orquestrador de estado
  - `AIAnalysisStep` — tela inicial com textarea + análise Gemini
  - `WizardHeader` — barra de progresso
  - `WizardStep1` a `WizardStep5` — cada passo separado
  - `FormActions` — botões voltar/avançar/enviar

### 2. Extrair status maps para `src/lib/constants.ts`
- **Problema:** `STATUS_LABEL` e `STATUS_COLOR` duplicados em 8+ arquivos
- **Locais afetados:**
  - `admin/page.tsx`
  - `admin/orders/page.tsx`
  - `portal/page.tsx`
  - `portal/orders/page.tsx`
  - `portal/orders/[id]/page.tsx`
  - `admin/briefing/[id]/page.tsx`
- **Solução:** Criar `src/lib/constants.ts` com `ORDER_STATUS_MAP` e `BRIEFING_STATUS_MAP`

### 3. Separar `src/lib/email.ts` (404 linhas)
- **Problema:** 10+ templates HTML misturados com lógica de envio
- **Solução:** Dividir em:
  - `src/lib/email.ts` — apenas `sendMail()` (~25 linhas)
  - `src/lib/email-templates/proposal.ts`
  - `src/lib/email-templates/orders.ts`
  - `src/lib/email-templates/payments.ts`
  - `src/lib/email-templates/shared.ts` — layout base e estilos

---

## P2 — ALTO

### 4. Refatorar `src/app/api/orders/[id]/route.ts` (220+ linhas)
- **Problema:** GET + PATCH + email dispatch + data builders + auth tudo misturado
- **Solução:** Extrair para `src/services/order-updates.ts`:
  - `buildAdminUpdateData()`
  - `buildClientUpdateData()`
  - `dispatchPostUpdateEmail()`
- Route.ts fica só com GET/PATCH orquestrando o service

### 5. Quebrar `src/app/admin/briefing/[id]/ProposalManager.tsx` (310+ linhas)
- **Problema:** Preview + edição + rewrite IA + geração + 8 estados + 5 handlers assíncronos
- **Solução:** Dividir em:
  - `ProposalHeader` — status + action buttons
  - `ProposalMetrics` — hours, cost display
  - `ProposalViewMode` — preview read-only
  - `ProposalEditMode` — form fields

### 6. Consolidar ScopeGenerator + ScopeView (~95% duplicados)
- **Problema:** 2 arquivos quase idênticos (310+ e 260 linhas)
  - `src/app/portal/briefing/[id]/ScopeGenerator.tsx`
  - `src/app/admin/briefing/[id]/ScopeView.tsx`
- **Solução:** Criar componente compartilhado `src/components/ScopePanel.tsx` com variant pattern (`portal` vs `admin`)

---

## P3 — MÉDIO

### 7. Quebrar `src/app/admin/page.tsx` (310+ linhas)
- **Problema:** Dashboard monolítico com stats + 2 tabelas + queries inline
- **Solução:** Dividir em:
  - `AdminHeader`
  - `StatsGrid`
  - `BriefingStats`
  - `RecentOrdersTable`
  - `AllBriefingsTable`

### 8. Quebrar `src/app/portal/orders/[id]/page.tsx` (220 linhas)
- **Problema:** 5 seções condicionais renderizadas inline
- **Solução:** Dividir em:
  - `OrderHeader`
  - `OrderDescription`
  - `ProposalSection`
  - `PaymentSection`
  - `RatingSection`

---

## Arquivos OK (sem ação necessária)
- `ProfileForm.tsx`, `NewOrderForm.tsx`, `AdminStatusForm.tsx`, `PayOrderButton.tsx`
- `MessagesPanel.tsx`, `SignOutButton.tsx`, landing page (`page.tsx`)
- `auth.ts`, `middleware.ts`, `lib/prisma.ts`, `lib/stripe.ts`
- `lib/embeddings.ts`, `lib/complexity.ts`
- Maioria das API routes (lead, briefing, proposals, webhooks, library, profile)
