# M2 — Backlog Executável do Backend Crítico

**Projeto:** Quantum Technology Agency  
**Ciclo:** M2  
**Objetivo do mês:** expandir a proteção automatizada para os fluxos mais críticos do backend  
**Documento pai:** `docs/QUALITY-EXECUTION-PLAN.md`

---

## 1. Objetivo do M2

O M2 existe para proteger os fluxos de backend que mais afetam:

- autenticação e autorização
- integridade de estado
- segurança de entrada
- side effects críticos como email, webhook e pagamento

Este ciclo não busca cobrir todo o backend. O foco é o backend crítico.

---

## 2. Escopo prioritário do M2

### Prioridade P0

- `src/app/api/lead/route.ts`
- `src/app/api/contact/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/orders/[id]/route.ts`
- `src/app/api/orders/[id]/checkout/route.ts`
- `src/app/api/webhooks/stripe/route.ts`

### Prioridade P1

- `src/app/api/orders/[id]/messages/route.ts`
- `src/app/api/orders/[id]/rating/route.ts`
- `src/app/api/proposal/[id]/route.ts`
- `src/app/api/proposal/[id]/comments/route.ts`
- `src/app/api/profile/route.ts`

### Prioridade P2

- `src/app/api/library/add/route.ts`
- `src/app/api/library/similar/route.ts`
- `src/app/api/briefing/analyze/route.ts`
- `src/app/api/briefing/scope/route.ts`
- rotas admin auxiliares

---

## 3. Resultados esperados ao final do M2

| Resultado | Critério objetivo |
|---|---|
| Rotas críticas cobertas | toda rota P0 com testes de sucesso, erro e permissão |
| Side effects isolados | email, webhook e pagamento testados com mocks previsíveis |
| Auth e autorização cobertos | cenários de acesso negado e acesso permitido automatizados |
| Mudança de estado coberta | transições críticas de pedidos e pagamentos validadas |
| Base de integração expandida | padrões de mock e request reutilizáveis definidos |

---

## 4. Backlog executável por semana

## Semana 1 — Cobertura das rotas públicas críticas

### Objetivo

Blindar as rotas públicas com maior exposição e impacto operacional.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M2-S1-01 | Expandir testes de `lead/route.ts` | casos de sucesso, CSRF, rate limit e erro externo cobertos |
| M2-S1-02 | Cobrir `contact/route.ts` | casos de sucesso, CSRF, rate limit e envio de email cobertos |
| M2-S1-03 | Consolidar helpers de request e mock | reduzir duplicação dos testes de rotas |

### Definition of done da Semana 1

- rotas públicas críticas protegidas por testes consistentes
- padrões de mock reaproveitáveis definidos

---

## Semana 2 — Pedidos: criação, atualização e mensagens

### Objetivo

Proteger o principal fluxo operacional do portal.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M2-S2-01 | Cobrir `orders/route.ts` | criação e validação de pedido testadas |
| M2-S2-02 | Cobrir `orders/[id]/route.ts` | transições críticas e permissões testadas |
| M2-S2-03 | Cobrir `orders/[id]/messages/route.ts` | thread e notificações testadas |
| M2-S2-04 | Cobrir `orders/[id]/rating/route.ts` | regras básicas de avaliação testadas |

### Definition of done da Semana 2

- fluxo central de pedidos protegido com testes de integração suficientes

---

## Semana 3 — Pagamentos e webhooks

### Objetivo

Cobrir as áreas mais sensíveis de consistência de estado e side effect externo.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M2-S3-01 | Cobrir `orders/[id]/checkout/route.ts` | mock checkout e regras de entrada testadas |
| M2-S3-02 | Cobrir `webhooks/stripe/route.ts` | assinatura, atualização de pagamento e side effects testados |
| M2-S3-03 | Cobrir `orders/payment/route.ts` e service associado | criação de pagamento e fluxo auxiliar cobertos |

### Definition of done da Semana 3

- fluxo de pagamento e confirmação com risco reduzido por testes automáticos

---

## Semana 4 — Propostas, perfil e fechamento do M2

### Objetivo

Fechar o mês com proteção dos fluxos administrativos e comerciais centrais.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M2-S4-01 | Cobrir `proposal/[id]/route.ts` | envio, aprovação, revisão e notificações cobertos |
| M2-S4-02 | Cobrir `proposal/[id]/comments/route.ts` | comentários e permissões cobertos |
| M2-S4-03 | Cobrir `profile/route.ts` | leitura e atualização de perfil cobertas |
| M2-S4-04 | Consolidar padrões do M2 | helpers, mocks e convenções estabilizados |
| M2-S4-05 | Fechar relatório do M2 | backlog do M3 preparado |

### Definition of done da Semana 4

- o backend crítico prioritário entrou em cobertura consistente
- existe relatório do ciclo e plano pronto para M3

---

## 5. Critério mínimo por rota no M2

Cada rota crítica coberta no M2 deve ter, no mínimo:

1. um teste de caminho feliz
2. um teste de validação inválida
3. um teste de autenticação ou autorização quando aplicável
4. um teste de falha externa quando houver side effect relevante
5. um assert sobre o estado final esperado

---

## 6. Riscos do M2

| Risco | Impacto | Mitigação |
|---|---|---|
| Mocks frágeis de auth e Prisma | baixa confiança | consolidar factories e helpers já no início do ciclo |
| Rotas extensas demais | testes difíceis de manter | focar em contratos externos e transições principais |
| Side effects assíncronos pouco previsíveis | flakes | padronizar mocks de email, Stripe e webhook |
| Escopo excessivo | atraso no ciclo | manter P0 e P1 como núcleo obrigatório |

---

## 7. Definition of done do M2

O M2 só pode ser considerado concluído se:

1. as rotas P0 estiverem cobertas
2. os fluxos de pedidos e pagamento estiverem protegidos por testes úteis
3. auth e autorização estiverem exercitados em cenários reais
4. side effects relevantes estiverem mockados e verificados
5. o M3 puder iniciar sem redescobrir convenções ou estrutura de testes

---

## 8. Próximo passo após o M2

Ao concluir este backlog, o próximo passo obrigatório é:

**entrar no M3 com foco no frontend crítico do portal e admin.**
