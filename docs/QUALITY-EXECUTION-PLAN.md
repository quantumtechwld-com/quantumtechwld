# Plano de Execução e Manutenção Mensal da Qualidade Técnica

**Projeto:** Quantum Technology Agency  
**Versão:** 1.0  
**Data base:** Abril de 2026  
**Status:** Documento operacional para execução imediata e revisão mensal

---

## 1. Objetivo

Este documento define como o projeto deve:

1. Executar imediatamente as melhorias técnicas já levantadas
2. Adotar testes automatizados de forma compatível com a stack atual
3. Padronizar a análise mensal de qualidade, estabilidade e segurança
4. Criar um processo contínuo de revisão para evitar regressão técnica
5. Estabelecer um gate objetivo para cada release

O foco é transformar a qualidade técnica em rotina operacional, e não em esforço pontual.

### Documentos mandatórios de instrução

Toda execução deste plano deve considerar como instruções oficiais:

1. AGENTS.md
2. .github/copilot-instructions.md
3. docs/DEVELOPER-GUIDE.md
4. docs/REFACTORING-PLAN.md

Estes documentos devem ser tratados como a base de TODO, prioridade, comportamento de execução e critérios de revisão técnica.

---

## 2. Escopo do plano

Este plano cobre:

- Testes automatizados
- Tipagem TypeScript
- Validação de entrada e contratos de API
- Segurança aplicada
- Observabilidade
- Pipeline de qualidade e release
- Banco de dados e migrations
- Frontend crítico do portal e admin
- Rotina mensal de revisão técnica

Este plano não substitui documentação funcional nem documentação de deploy. Ele complementa os documentos existentes e centraliza a execução da melhoria contínua.

---

## 3. Diagnóstico base de referência

Esta é a fotografia inicial do projeto antes da execução do plano.

| Dimensão | Estado atual | Nota de referência | Leitura executiva |
|---|---|---:|---|
| Arquitetura | Boa | 7/10 | Stack coerente, domínio relativamente organizado |
| Segurança | Boa | 7.5/10 | Headers, Auth.js, CSRF em rotas públicas e pipeline já ajudam bastante |
| Estabilidade | Boa | 7/10 | Projeto operável, mas ainda dependente de validação manual |
| Manutenibilidade | Média/boa | 6/10 | Tipagem parcialmente enfraquecida por any e padrões duplicados |
| Testabilidade | Fraca | 3/10 | Ausência de suíte automatizada é o maior risco estrutural |
| Observabilidade | Média | 6/10 | Sentry existe, mas a aplicação ainda depende muito de console.error |
| Qualidade de release | Boa | 7/10 | Pipeline já existe, porém ainda não cobre tudo o que deveria |

### Principais lacunas a corrigir

1. Ausência de testes automatizados
2. Uso excessivo de any em áreas críticas
3. Validação inconsistente entre rotas
4. Quality gate parcial na CI
5. Observabilidade ainda pouco estruturada
6. Inconsistências de padrão entre fluxos principais e auxiliares

---

## 4. Princípios operacionais

Toda execução deste plano deve seguir estes princípios:

1. Corrigir a causa raiz, não só o sintoma
2. Priorizar rotas e fluxos críticos do negócio antes da cobertura ampla
3. Não quebrar release corrente por tentar resolver tudo ao mesmo tempo
4. Substituir validação manual por contratos explícitos sempre que possível
5. Reduzir risco antes de aumentar complexidade
6. Medir evolução mensalmente com critérios repetíveis

### Regra de instrução obrigatória

Antes de iniciar qualquer execução técnica, o responsável deve confirmar que:

- AGENTS.md foi considerado como instrução operacional de alto nível
- .github/copilot-instructions.md foi considerado como regra mandatória de execução
- este documento continua a ser a referência principal de backlog, roadmap, revisão mensal e gate de release

Se houver conflito entre tarefas ad hoc e este plano, a decisão deve priorizar segurança, estabilidade, release e itens do mês vigente.

---

## 5. Frentes de trabalho

| Frente | Objetivo | Prioridade | Impacto | Esforço |
|---|---|---:|---:|---:|
| Testes automatizados | Criar proteção contra regressão | Crítica | Muito alto | Alto |
| Tipagem e redução de any | Recuperar o valor real do TypeScript | Alta | Alto | Médio |
| Validação padronizada | Unificar contratos de entrada e erro | Alta | Alto | Médio |
| CI e quality gates | Bloquear regressões antes do deploy | Alta | Alto | Médio |
| Observabilidade | Tornar falhas rastreáveis em produção | Alta | Alto | Médio |
| Segurança aplicada | Padronizar proteção de rotas mutáveis e abuso | Alta | Alto | Médio |
| Frontend crítico | Reduzir regressões em portal e admin | Média | Médio | Médio |
| Operação e release | Tornar entrega previsível e auditável | Alta | Alto | Médio |
| Dívida técnica residual | Eliminar inconsistências fora do padrão | Média | Médio | Médio |

---

## 6. Execução imediata

### 6.1 Ordem obrigatória de execução

1. Base de testes e convenções
2. Cobertura do backend crítico
3. Cobertura do frontend crítico
4. Smoke E2E de release
5. Redução de any e padronização com Zod
6. Padronização de observabilidade e checklist de release

### 6.2 Objetivos dos primeiros 30 dias

Ao final do primeiro ciclo, o projeto deve ter:

- Stack de testes instalada
- Scripts de teste definidos
- Convenções de testes publicadas
- Primeiros testes unitários e de integração em produção na CI
- Escopo crítico do backend mapeado e priorizado

### 6.3 Backlog de ação imediata

| Item | Ação | Resultado esperado |
|---|---|---|
| Base de testes | Adotar Vitest, Testing Library, Playwright e MSW | Estrutura pronta para iniciar cobertura |
| Convenções | Padronizar nomes, fixtures, mocks e escopo por camada | Todos testam do mesmo jeito |
| CI mínima | Incluir execução de testes unitários em PR | Quebra de regressão básica bloqueia merge |
| Mapeamento crítico | Listar rotas, páginas e fluxos prioritários | Ordem de cobertura definida |
| Padrão de erro | Definir como capturar e reportar erros | Observabilidade mais consistente |

---

## 7. Roadmap mensal de 6 meses

| Mês | Meta central | Entregáveis | Definição de pronto |
|---|---|---|---|
| M1 | Fundação de qualidade | tooling de testes, convenções, scripts, CI inicial | suíte base funcional local e na CI |
| M2 | Backend crítico | testes para auth, lead, contato, pedidos, propostas, pagamentos mock, emails | fluxos principais do backend cobertos |
| M3 | Frontend crítico | testes de portal, admin, formulários, estados e componentes sensíveis | UI crítica protegida contra regressão |
| M4 | Release confiável | smoke E2E para jornadas principais | release bloqueada sem smoke verde |
| M5 | Dívida estrutural | redução forte de any, padronização com Zod, helpers comuns | backend crítico mais tipado e consistente |
| M6 | Governança técnica | checklist oficial de release, observabilidade padronizada, relatório mensal formal | processo repetível, auditável e comparável |

### 7.1 Detalhamento operacional por mês

#### M1 — Fundação

**Objetivo**  
Criar a base técnica para tornar a qualidade mensurável e automatizável.

**Execução**

- Instalar Vitest
- Instalar Testing Library
- Instalar Playwright
- Instalar MSW
- Definir scripts de teste
- Definir estrutura de pastas de teste
- Preparar CI para rodar unitários

**Pronto quando**

- Qualquer developer roda testes localmente com um único comando por camada
- Existe pelo menos um teste funcional de cada categoria
- PR já falha se quebrar teste unitário base

#### M2 — Backend crítico

**Objetivo**  
Cobrir os pontos que mais afetam segurança, estado e fluxo de negócio.

**Escopo prioritário**

- Auth e autorização
- Lead
- Contato
- Orders
- Proposal
- Payment mock e webhook
- Templates de email críticos

**Pronto quando**

- Toda rota crítica tiver teste de sucesso, falha de validação e falha de permissão
- Mudanças de estado críticas estiverem protegidas por testes

#### M3 — Frontend crítico

**Objetivo**  
Blindar o que o usuário mais acessa no portal e no admin.

**Escopo prioritário**

- Login
- Portal principal
- Criação de pedido
- Detalhe de pedido
- Painel admin de briefings e orders
- Componentes de loading, erro e empty state

**Pronto quando**

- Mudanças em componentes críticos forem capturadas automaticamente
- Formulários essenciais não dependerem só de teste manual

#### M4 — Smoke de release

**Objetivo**  
Garantir que jornadas principais funcionem ponta a ponta.

**Fluxos mínimos**

- Envio de lead
- Login
- Entrada no portal
- Criação de pedido
- Interação admin no pedido
- Proposta
- Pagamento mock
- Logout

**Pronto quando**

- Nenhuma release seguir sem smoke E2E verde

#### M5 — Dívida estrutural

**Objetivo**  
Recuperar a disciplina técnica do código principal.

**Execução**

- Reduzir any em módulos críticos
- Padronizar validação de entrada com Zod
- Consolidar helpers e contratos de erro
- Remover duplicações de lógica operacional

**Pronto quando**

- Áreas críticas tiverem tipagem confiável
- Novas rotas seguirem padrão único de validação

#### M6 — Governança

**Objetivo**  
Transformar qualidade em rotina oficial do projeto.

**Execução**

- Formalizar checklist de release
- Formalizar análise mensal
- Padronizar captura de erro relevante
- Medir evolução mês contra mês

**Pronto quando**

- O processo inteiro puder ser executado sem depender de memória informal do time

---

## 8. Plano de adoção de testes automatizados

### 8.1 Ferramentas recomendadas

| Camada | Ferramenta | Finalidade |
|---|---|---|
| Unitário | Vitest | Helpers, regras de negócio, validações, transforms |
| Integração | Vitest + banco de teste + mocks | APIs, auth, side effects, transições de estado |
| Componente | Testing Library | Render, interação, formulários, estados de erro |
| E2E | Playwright | Jornadas ponta a ponta |
| HTTP mock | MSW | Mock de integrações e responses controladas |

### 8.2 Estratégia por stack

| Stack | Como testar | Observação |
|---|---|---|
| Next.js route handlers | integração | validar request, auth, status code e side effects |
| React | componente | preferir teste por comportamento e não por implementação |
| Prisma | integração | usar banco de teste isolado, sem reaproveitar ambiente local |
| Auth.js | integração | validar roles, redirects e bloqueios por status |
| Stripe | integração + E2E mock | não depender de ambiente real para gate de release |
| Nodemailer | teste estrutural | validar subject, links, placeholders e conteúdo mínimo |
| next-intl | unitário e componente | validar chaves críticas, render e fallback |

### 8.3 Ordem de cobertura

1. Helpers puros em src/lib
2. Auth e middleware
3. APIs públicas sensíveis
4. APIs de domínio principal
5. Componentes críticos
6. Jornadas E2E de release

### 8.4 Metas de cobertura

| Tipo | Meta inicial | Meta madura |
|---|---:|---:|
| Unitário | 40% | 80% |
| Integração em fluxos críticos | 70% | 90% |
| Smoke E2E de jornadas críticas | 100% | 100% |

### 8.5 Critério de aceite dos testes

Um módulo é considerado coberto quando houver, no mínimo:

- Caminho feliz
- Falha de validação
- Falha de autenticação ou autorização, quando aplicável
- Falha externa controlada, quando houver integração
- Assert explícito sobre mudança de estado ou efeito esperado

---

## 9. Padrão de análise mensal

Todo mês deve terminar com uma análise técnica formal usando o mesmo método.

### 9.1 Objetivos da análise mensal

1. Medir se o projeto evoluiu ou regrediu
2. Descobrir riscos antes da próxima release
3. Reordenar backlog técnico com base em evidência
4. Decidir foco do mês seguinte

### 9.2 Etapas da análise mensal

| Etapa | O que fazer | Evidência |
|---|---|---|
| Estrutural | Verificar build, typecheck, lint e erros do editor | logs e painel de problemas |
| Testes | Verificar resultado, cobertura e lacunas | relatórios de teste |
| Segurança | Verificar audit, secrets, auth, CSRF e abuso | saída do pipeline e revisão de rotas |
| Banco | Revisar migrations, compatibilidade e transições de estado | histórico de migrations e testes |
| Frontend | Revisar smoke visual e fluxos críticos | smoke checklist ou E2E |
| Observabilidade | Revisar incidentes, erros recorrentes e gaps | Sentry, logs e ocorrências |
| Operação | Revisar deploys, rollback, problemas pós-release | histórico operacional |
| Dívida técnica | Medir any, duplicação, desvios de padrão | análise de código e backlog |

### 9.3 Perguntas obrigatórias da análise mensal

Ao fechar cada mês, responder:

1. O projeto ficou mais seguro para evoluir do que no mês anterior?
2. O número de áreas críticas sem teste diminuiu?
3. Houve regressão de padrão técnico?
4. Houve incidentes que deveriam ter sido pegos antes da release?
5. O tempo de validação de release diminuiu ou aumentou?
6. O backlog técnico está a reduzir risco real ou só gerando movimento?

---

## 10. Modelo de relatório mensal

O relatório mensal deve seguir sempre este formato.

### 10.1 Resumo executivo

- Nota geral do mês
- Evolução em relação ao mês anterior
- Principais riscos abertos
- Decisão de foco do mês seguinte

### 10.2 Estado por dimensão

| Dimensão | Nota atual | Nota anterior | Tendência | Observação |
|---|---:|---:|---|---|
| Arquitetura |  |  |  |  |
| Segurança |  |  |  |  |
| Estabilidade |  |  |  |  |
| Manutenibilidade |  |  |  |  |
| Testabilidade |  |  |  |  |
| Observabilidade |  |  |  |  |
| Qualidade de release |  |  |  |  |

### 10.3 Entregas do mês

| Entrega | Status | Impacto | Observação |
|---|---|---|---|
|  |  |  |  |

### 10.4 Pendências do mês

| Pendência | Motivo | Risco | Próxima ação |
|---|---|---|---|
|  |  |  |  |

### 10.5 Riscos abertos

| Risco | Gravidade | Probabilidade | Mitigação |
|---|---|---|---|
|  |  |  |  |

### 10.6 Métricas do mês

| Métrica | Valor atual | Meta | Status |
|---|---:|---:|---|
| Build verde |  | 100% |  |
| Typecheck verde |  | 100% |  |
| Smoke E2E de jornadas críticas |  | 100% |  |
| Cobertura unitária |  | 40% inicial |  |
| Cobertura de integração crítica |  | 70% inicial |  |
| Uso de any em módulos críticos |  | redução mensal |  |
| Rotas críticas com schema padronizado |  | crescimento mensal |  |
| Falhas pós-release |  | queda mensal |  |

### 10.7 Plano do próximo mês

- Meta principal
- Entregáveis principais
- Risco que será atacado primeiro
- Dependências ou bloqueios conhecidos

---

## 11. Ritmo mensal de execução

Cada mês deve seguir o mesmo ciclo.

| Semana | Objetivo | Resultado esperado |
|---|---|---|
| Semana 1 | Planejamento técnico mensal | escopo fechado e priorizado |
| Semana 2 | Implementação principal | maior parte das entregas em execução |
| Semana 3 | Consolidação e correções | estabilização do que foi implementado |
| Semana 4 | Validação e revisão | relatório fechado e backlog reordenado |

### 11.1 Reuniões recomendadas

| Momento | Objetivo | Saída |
|---|---|---|
| Início do mês | Planejamento do ciclo | lista de entregas do mês |
| Meio do mês | Checkpoint técnico | ajuste de escopo se necessário |
| Fim do mês | Revisão técnica formal | relatório mensal |
| Início do mês seguinte | Replanejamento | novo ciclo baseado em evidência |

---

## 12. Padrão obrigatório para cada release

Nenhuma release deve seguir sem passar por todos os itens abaixo.

### 12.1 Gate estrutural

- Build sem erro
- Typecheck sem erro
- Lint sem erro bloqueante
- Sem erro crítico aberto no editor nos arquivos do release

### 12.2 Gate de segurança

- Sem secret exposto
- Sem vulnerabilidade crítica bloqueante
- Auth e autorização sem regressão
- Rotas mutáveis críticas revisadas
- Integrações externas com comportamento de falha conhecido

### 12.3 Gate de banco

- Migrations válidas
- Compatibilidade com dados antigos preservada
- Impacto das mudanças de estado conhecido

### 12.4 Gate de testes

- Unitários verdes para o escopo alterado
- Integração verde para os fluxos alterados
- Smoke E2E verde para jornadas críticas

### 12.5 Gate operacional

- Observabilidade ativa
- Variáveis obrigatórias presentes
- Smoke pós-deploy executado
- Rollback conhecido

---

## 13. Critérios de aprovação e bloqueio

### A release deve ser bloqueada quando houver:

1. Erro de build ou typecheck
2. Falha em smoke E2E crítico
3. Falha em fluxo de auth, pedido, proposta ou pagamento
4. Migration sem validação suficiente
5. Regressão de segurança relevante
6. Falta de rastreabilidade mínima para erro crítico

### A release pode seguir com ressalva quando houver:

1. Baixa cobertura fora do escopo alterado, mas fluxo crítico preservado
2. Dívida técnica conhecida sem impacto imediato no release
3. Warning não crítico com plano de correção definido

---

## 14. Como usar este documento na prática

### No curto prazo

Usar este documento para iniciar imediatamente:

- instalação da stack de testes
- criação do backlog de M1
- definição de convenções de teste
- definição da lista de rotas e telas críticas

### No médio prazo

Usar este documento para:

- comparar o projeto mês contra mês
- decidir foco de qualidade do próximo ciclo
- validar se o projeto está a ficar mais seguro para evoluir

### No longo prazo

Usar este documento como referência fixa de governança técnica para:

- revisões mensais
- readiness de release
- onboarding de novos developers ou agentes
- auditoria técnica do projeto

---

## 15. Sequência recomendada de início

Se a execução for começar agora, seguir exatamente esta ordem:

1. Aprovar este documento como referência operacional
2. Abrir o backlog do M1 com foco exclusivo em testes e convenções
3. Preparar tooling e scripts
4. Integrar a CI mínima
5. Definir lista de rotas e páginas críticas
6. Iniciar cobertura do backend crítico

### 15.1 Sequência obrigatória de consulta documental

Sempre que um novo ciclo mensal começar, a consulta deve ocorrer nesta ordem:

1. AGENTS.md
2. .github/copilot-instructions.md
3. docs/QUALITY-EXECUTION-PLAN.md
4. docs/DEVELOPER-GUIDE.md
5. docs/REFACTORING-PLAN.md

Isso garante que TODO, prioridade, forma de execução e critérios de revisão mensal estejam alinhados.

---

## 16. Resultado esperado após 6 meses

Se este plano for seguido com disciplina mensal, o projeto deve sair de um estado:

- bom, mas dependente de atenção manual

para um estado:

- tecnicamente previsível
- mais seguro para evoluir
- com regressão significativamente reduzida
- com release auditável
- com análise de qualidade contínua e comparável

---

## 17. Documentos relacionados

- AGENTS.md
- .github/copilot-instructions.md
- docs/M1-CLOSING-REPORT.md
- docs/M1-EXECUTION-BACKLOG.md
- docs/M2-EXECUTION-BACKLOG.md
- docs/DEVELOPER-GUIDE.md
- docs/REFACTORING-PLAN.md
- docs/DEPLOY.md
- README.md
