# AGENTS.md

## Instruções mandatórias para agentes e execução técnica

Todo agente, automação ou executor que atuar neste repositório deve considerar os documentos abaixo como fontes oficiais de instrução, prioridade e critérios de execução.

## Ordem de leitura obrigatória

1. `.github/copilot-instructions.md`
2. `docs/QUALITY-EXECUTION-PLAN.md`
3. `docs/DEVELOPER-GUIDE.md`
4. `docs/REFACTORING-PLAN.md`
5. `docs/COMPONENTIZATION-GUIDE.md`
6. `docs/API-FIRST-ANALYSIS.md`
7. `README.md`

## Regra operacional

Para qualquer tarefa de implementação, análise, refactoring, teste, release ou manutenção mensal:

- usar `docs/QUALITY-EXECUTION-PLAN.md` como plano operacional principal
- usar `.github/copilot-instructions.md` como regra mandatória de execução, segurança e comportamento
- respeitar o roadmap mensal, os gates de release e o modelo de análise mensal definidos no plano de qualidade
- tratar o backlog e os TODOs do projeto de acordo com as prioridades e frentes definidas no plano de qualidade

## Regra de TODO

Quando existir dúvida sobre prioridade de trabalho, o agente deve seguir esta ordem:

1. Itens críticos de segurança, estabilidade, build e typecheck
2. Itens do mês corrente definidos em `docs/QUALITY-EXECUTION-PLAN.md`
3. Gaps de testes automatizados e quality gates
4. Redução de dívida técnica crítica
5. Refactors estruturais planejados em `docs/REFACTORING-PLAN.md`

## Regra de revisão mensal

Ao final de cada mês, a análise técnica deve obrigatoriamente consultar:

- `docs/QUALITY-EXECUTION-PLAN.md`
- `.github/copilot-instructions.md`
- `docs/COMPONENTIZATION-GUIDE.md` — tamanho de componentes, Server vs Client
- `docs/API-FIRST-ANALYSIS.md` — prontidão para integração externa
- estado real do código, pipeline, testes e release

O relatório mensal deve ser comparado com o mês anterior para medir evolução, regressão e próximos passos.

## Critérios de análise contínua

Em qualquer análise de código, implementação ou refactoring, verificar obrigatoriamente:

### Componentização (`docs/COMPONENTIZATION-GUIDE.md`)
- Componentes acima de 300 linhas (prioridade de refatoração)
- `'use client'` aplicado apenas em componentes folha
- Lógica de negócio em route handlers > 200 linhas (mover para `src/services/`)
- Mais de 3 `useState` ou > 7 props por componente

### API-first (`docs/API-FIRST-ANALYSIS.md`)
- Endpoints sem validação `zod`
- Lógica misturada em route handlers (deveria estar em `src/services/`)
- APIs públicas sem rate limiting ou CSRF
- Ausência de versionamento (`/api/v1/`) e documentação OpenAPI

### Qualidade geral (`docs/QUALITY-EXECUTION-PLAN.md`)
- Alinhamento com roadmap mensal
- Gaps de testes automatizados
- Conformidade com pipeline de segurança (gitleaks, tsc, eslint-plugin-security)

---

## Checklist de Nova Implementação (OBRIGATÓRIO após cada feature)

Após implementar qualquer nova funcionalidade, o agente DEVE verificar e, se ausente, executar os itens abaixo **antes de commitar**. Esta rotina deve ser aplicada a cada PR / feature entregue.

### 1. Testes automatizados
- [ ] Existe teste **unitário** para toda função de lógica de negócio nova (ex: helpers, guards, services)?
  - Criar em `tests/unit/<nome>.test.ts`
- [ ] Existe teste de **integração** para cada novo route handler (`GET`, `POST`, `PATCH`, `DELETE`)?
  - Criar em `tests/integration/<domínio>-route.test.ts`
  - Cobrir: 401 (sem sessão), 403 (sem permissão), 422 (input inválido), 200 (sucesso)
- [ ] Testes de componente existentes precisam de novos casos para refletir o novo estado/props?
  - Verificar em `tests/components/`

### 2. Traduções i18n
- [ ] Há strings visíveis ao utilizador hardcoded em português no novo código?
  - Se sim → mover para `messages/pt.json` sob uma chave semântica nova
  - Adicionar a mesma chave em `messages/en.json` e `messages/es.json`
- [ ] Rodar o teste de paridade: `npx vitest run tests/unit/i18n-parity.test.ts`
  - Ele garante que pt/en/es têm exactamente as mesmas chaves

### 3. Templates de e-mail
- [ ] A nova feature dispara algum evento de comunicação ao utilizador (convite, notificação, confirmação)?
  - Se sim → criar ou atualizar template em `src/lib/email-templates/`
  - Template deve suportar `InviteLocale = "pt" | "en" | "es"` via objeto de cópia multilíngue
  - Usar `emailLogoHeader()` e `emailFooterTeam()` de `shared.ts`
- [ ] O e-mail transacional existente precisa de contexto novo (ex: nome da organização)?
  - Se sim → atualizar os templates afetados

### 4. Segurança e autorização
- [ ] Novos endpoints verificam sessão via `auth()` e retornam 401 se ausente?
- [ ] Acesso a recursos usa helper centralizado (ex: `canAccessOrder`) em vez de guards inline?
- [ ] Input validado com `zod` em todos os route handlers?
- [ ] Rotas públicas sensíveis têm rate limiting?

### 5. Build e typecheck
- [ ] `npm run build` passa sem erros?
- [ ] `npx tsc --noEmit` passa sem erros?

### Critério de conclusão
A feature só está **pronta para commitar** quando todos os itens acima estão marcados. Qualquer gap deve ser documentado como TODO no próprio PR com prazo definido.
