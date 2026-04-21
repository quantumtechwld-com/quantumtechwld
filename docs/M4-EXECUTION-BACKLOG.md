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