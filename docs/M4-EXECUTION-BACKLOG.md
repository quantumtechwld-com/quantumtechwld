# M4 — Backlog Executável de Smoke E2E de Release

**Projeto:** Quantum Technology Agency  
**Ciclo:** M4  
**Objetivo do mês:** garantir que as jornadas principais funcionem ponta a ponta antes de cada release  
**Documento pai:** `docs/QUALITY-EXECUTION-PLAN.md`

---

## 1. Objetivo do M4

O M4 existe para transformar a cobertura já construída em backend e frontend numa proteção operacional de release.

Este ciclo não busca cobrir toda a aplicação em E2E. O foco é garantir que as jornadas mais críticas do negócio não avancem para produção sem um smoke automatizado verde.

---

## 2. Escopo prioritário do M4

### Prioridade P0

- landing page e envio de lead
- login via fluxo suportado no ambiente de teste
- entrada no portal
- criação de pedido
- visualização de pedido do cliente

### Prioridade P1

- fluxo admin de análise do pedido
- envio de proposta
- aprovação ou revisão da proposta
- pagamento mock
- visualização de invoice

### Prioridade P2

- logout
- leitura de contatos no admin
- gestão básica de utilizadores no admin

---

## 3. Resultados esperados ao final do M4

| Resultado | Critério objetivo |
|---|---|
| Smoke E2E mínimo de release definido | existe suite com jornadas P0 automatizadas |
| Execução local previsível | developers conseguem rodar smoke com um único comando |
| Base para gate de release | nenhuma release segue sem smoke principal verde |
| Dependências externas controladas | autenticação, email e pagamentos testados sem fragilidade operacional |

---

## 4. Backlog executável por semana

## Semana 1 — Preparação do ambiente E2E

### Objetivo

Remover os bloqueios técnicos do Playwright para fluxos autenticados e estáveis.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M4-S1-01 | Definir estratégia segura para autenticação E2E | fluxo autenticado reproduzível sem bypass inseguro |
| M4-S1-02 | Definir fixtures de dados E2E | pedidos, utilizadores e briefings previsíveis |
| M4-S1-03 | Padronizar setup/teardown do ambiente | smoke reproduzível localmente e na CI |

### Definition of done da Semana 1

- ambiente E2E autenticado definido
- dependências de teste explicitadas

---

## Semana 2 — Jornadas P0

### Objetivo

Cobrir a espinha dorsal do produto do ponto de vista do utilizador.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M4-S2-01 | Cobrir lead na landing page | envio validado ponta a ponta |
| M4-S2-02 | Cobrir login e entrada no portal | acesso autenticado validado |
| M4-S2-03 | Cobrir criação de pedido | pedido criado e visível no portal |
| M4-S2-04 | Cobrir visualização do pedido | detalhe do pedido validado após criação |

### Definition of done da Semana 2

- todas as jornadas P0 executam sem flakes locais

---

## Semana 3 — Jornadas P1

### Objetivo

Cobrir o fluxo comercial e operacional principal entre cliente e admin.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M4-S3-01 | Cobrir análise admin do pedido | admin enxerga e interage com pedido criado |
| M4-S3-02 | Cobrir proposta | envio e visualização da proposta validados |
| M4-S3-03 | Cobrir aprovação ou revisão | cliente toma decisão e estado é atualizado |
| M4-S3-04 | Cobrir pagamento mock | sucesso do pagamento e retorno ao pedido validados |

### Definition of done da Semana 3

- principal jornada comercial do produto coberta ponta a ponta

---

## Semana 4 — Gate de release

### Objetivo

Transformar o smoke numa regra operacional de entrega.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M4-S4-01 | Consolidar suite smoke oficial | cenário mínimo estável definido |
| M4-S4-02 | Integrar execução no processo de release | release depende do smoke verde |
| M4-S4-03 | Documentar restrições e manutenção | suite E2E fica sustentável |

### Definition of done da Semana 4

- smoke E2E passa a ser gate operacional do release

---

## 5. Riscos do M4

| Risco | Impacto | Mitigação |
|---|---|---|
| autenticação magic link difícil de automatizar | bloqueio de jornadas reais | criar estratégia de ambiente de teste explícita e segura |
| flakes por dependência externa | baixa confiança no smoke | isolar integrações e usar mocks previsíveis |
| dados inconsistentes entre execuções | falsos negativos | fixtures determinísticas e cleanup claro |

---

## 6. Definition of done do M4

O M4 só pode ser considerado concluído se:

1. existir pelo menos uma suite smoke cobrindo as jornadas P0
2. o fluxo autenticado estiver automatizado de forma segura
3. o fluxo principal de pedido e proposta estiver coberto ponta a ponta
4. o pagamento mock estiver incluído no smoke oficial
5. a release passar a depender do smoke verde

---

## 7. Próximo passo após o M4

Ao concluir este backlog, o próximo passo obrigatório é:

**entrar no M5 com foco em redução de `any`, padronização com Zod e consolidação estrutural.**

---

## 8. Débito técnico identificado em 22/04/2026 — corrigir antes ou durante M4

Descoberto durante a sessão de correção de testes. O `PortalDashboard.tsx` foi redesenhado em sessão anterior sem atualizar os testes nem corrigir os textos — confirmado como descuido.

### 8.1 Textos hardcoded em PT no `PortalDashboard.tsx`

**Ficheiro:** `src/app/portal/PortalDashboard.tsx`

O componente foi refatorado e abandonou o i18n. Todos os textos da área do cliente estão em português hardcoded, quebrando o suporte trilíngue (PT/EN/ES):

| Linha aprox. | Texto hardcoded |
|---|---|
| 39–43 | `FILTER_LABEL`: "Aguardam resposta", "Em produção", "Em revisão", "Concluídos", "Recusados" |
| 90, 102, 114, 126, 138 | Labels dos cards de contagem (duplicados do FILTER_LABEL) |
| 146 | "A aguardar a sua revisão" |
| 162 | "Em revisão" (badge inline) |
| 174 | "Aguardam a sua resposta" |
| 195 | "Proposta enviada" |
| 206 | "Pedidos recentes", "Limpar filtro" |
| 229 | "Ainda não tem pedidos." |

**Ação:** migrar todos estes textos para chaves i18n em `messages/pt.json`, `messages/en.json` e `messages/es.json`, usando `useTranslations("portal")` no componente (é client component — usar `useTranslations`, não `getTranslations`).

---

### 8.2 Chaves i18n obsoletas em `messages/pt.json`

As seguintes chaves existem no ficheiro de tradução mas **nenhum componente as usa**, pois o `PortalDashboard` foi redesenhado:

```
"pendingTitle", "pendingViewAll", "alertProposalSent", "alertInProduction",
"alertPending", "emptyState", "submitBriefing", "viewScope",
"statusReceived", "statusInAnalysis", "statusProposalSent", "statusInNegotiation"
```

**Ação:** após migrar os textos (item 8.1), substituir estas chaves pelas novas e remover as obsoletas dos três ficheiros de mensagens.

---

### 8.3 Mocks órfãos no teste `PortalPage.test.tsx`

**Ficheiro:** `tests/components/PortalPage.test.tsx`

O teste declara e mocka `briefingFindMany` e `briefingCount` (linhas 12–13 e 45–49), mas o componente `PortalPage` já não consulta briefings. São mocks mortos que podem induzir confusão.

**Ação:** remover as entradas `briefingFindMany` e `briefingCount` do `vi.hoisted` e do `vi.mock("@/lib/prisma")` no teste.

---

### 8.4 Confirmação arquitetural pendente

Antes de executar 8.1–8.3, confirmar explicitamente: **o fluxo de briefings foi intencionalmente removido da área do cliente?** Se sim, as chaves i18n de briefing no portal podem ser removidas. Se não, o briefing precisa ser reintegrado ao `PortalDashboard`.