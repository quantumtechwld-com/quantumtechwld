# M1 — Backlog Executável da Fundação de Qualidade

**Projeto:** Quantum Technology Agency  
**Ciclo:** M1  
**Objetivo do mês:** criar a base de qualidade para testes automatizados, CI mínima e rotina técnica repetível  
**Documento pai:** `docs/QUALITY-EXECUTION-PLAN.md`

---

## 1. Objetivo do M1

O M1 existe para preparar o projeto para evolução segura.

Ao final deste ciclo, o repositório deve ter:

- stack mínima de testes instalada
- convenções de testes definidas
- scripts de execução padronizados
- CI mínima executando testes unitários
- escopo crítico mapeado para cobertura futura
- base documental pronta para suportar os próximos meses

Este mês não tem como meta cobrir tudo. A meta é criar a fundação correta.

---

## 2. Resultado esperado ao final do M1

| Resultado | Critério objetivo |
|---|---|
| Stack de testes instalada | Vitest, Testing Library, Playwright e MSW configurados |
| Scripts padronizados | comandos separados por camada de teste |
| CI mínima ativa | PR executa pelo menos build, typecheck e unitários |
| Convenção definida | estrutura de pastas, naming e mocks documentados |
| Primeiro pacote de testes | ao menos 1 teste funcional por camada |
| Escopo crítico mapeado | lista priorizada de rotas, componentes e jornadas |

---

## 3. Sequência obrigatória de leitura

Antes de executar o M1, consultar nesta ordem:

1. `AGENTS.md`
2. `.github/copilot-instructions.md`
3. `docs/QUALITY-EXECUTION-PLAN.md`
4. `docs/M1-EXECUTION-BACKLOG.md`
5. `docs/DEVELOPER-GUIDE.md`

---

## 4. Backlog executável por semana

## Semana 1 — Preparação e desenho técnico

### Objetivo

Fechar o desenho operacional do M1 antes de instalar qualquer coisa.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M1-S1-01 | Confirmar stack de testes a adotar | decisão formal sobre Vitest, Testing Library, Playwright e MSW |
| M1-S1-02 | Definir estratégia por camada | separar unit, integration, component e e2e |
| M1-S1-03 | Mapear módulos críticos | lista priorizada de backend, frontend e jornadas |
| M1-S1-04 | Definir convenção de arquivos | padrão para `*.test.ts`, `*.spec.tsx`, fixtures e mocks |
| M1-S1-05 | Definir critérios de aceite do M1 | definition of done do ciclo validada |

### Definition of done da Semana 1

- a stack está decidida
- a ordem de adoção está decidida
- o escopo crítico do M2 já está pré-mapeado
- não existem dúvidas abertas sobre a base técnica do mês

---

## Semana 2 — Implantação da base de testes

### Objetivo

Instalar e configurar o tooling mínimo do projeto.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M1-S2-01 | Instalar Vitest | testes unitários executáveis |
| M1-S2-02 | Instalar Testing Library | componentes React testáveis |
| M1-S2-03 | Instalar Playwright | ambiente E2E configurado |
| M1-S2-04 | Instalar MSW | mocks HTTP padronizados |
| M1-S2-05 | Criar arquivos de config | configs mínimas para cada ferramenta |
| M1-S2-06 | Criar scripts no `package.json` | execução simples por camada |

### Entregáveis técnicos

- configuração mínima funcional para unitário
- configuração mínima funcional para componente
- configuração mínima funcional para E2E
- pasta ou convenção de fixtures/mocks definida

### Definition of done da Semana 2

- os comandos de teste executam localmente
- a base não conflita com Next.js, TypeScript e App Router
- existe pelo menos um teste de sanidade por camada

---

## Semana 3 — Primeiros testes e CI mínima

### Objetivo

Conectar a fundação de testes ao processo real de entrega.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M1-S3-01 | Criar primeiros testes unitários | helpers críticos passam a ser protegidos |
| M1-S3-02 | Criar primeiros testes de componente | uma tela ou componente crítico testado |
| M1-S3-03 | Criar primeiro teste de integração leve | uma rota crítica validada |
| M1-S3-04 | Preparar workflow de CI mínima | PR roda build, typecheck e unitários |
| M1-S3-05 | Validar tempo de execução | pipeline continua viável para o time |

### Escopo mínimo sugerido

- `src/lib` com helpers puros
- uma rota pública crítica
- um componente de formulário crítico

### Definition of done da Semana 3

- CI mínima está ativa
- regressão básica já bloqueia merge
- existe prova real de que a stack funciona no projeto

---

## Semana 4 — Consolidação e fechamento do M1

### Objetivo

Fechar o mês com documentação, critérios e backlog pronto para o M2.

### Tarefas

| ID | Tarefa | Resultado esperado |
|---|---|---|
| M1-S4-01 | Revisar convenções adotadas | remover ambiguidade do processo |
| M1-S4-02 | Registrar lacunas técnicas encontradas | backlog do M2 fica baseado em evidência |
| M1-S4-03 | Medir o que já está coberto | baseline inicial de cobertura e maturidade |
| M1-S4-04 | Fechar relatório do M1 | análise do mês concluída |
| M1-S4-05 | Preparar plano do M2 | backend crítico pronto para entrar em execução |

### Definition of done da Semana 4

- o M1 terminou com entrega verificável
- existe relatório do mês
- o M2 pode começar sem redescobrir contexto

---

## 5. Backlog consolidado por prioridade

| Prioridade | Item | Justificativa |
|---|---|---|
| P0 | Configurar stack de testes | sem isso não existe fundação real |
| P0 | Configurar scripts e convenções | evita adoção caótica |
| P0 | Configurar CI mínima | sem gate, a base não protege release |
| P1 | Criar testes iniciais reais | garante que a base foi validada no projeto |
| P1 | Mapear escopo crítico do M2 | acelera backend crítico |
| P2 | Refinar documentação operacional | importante, mas não antes da base funcional |

---

## 6. Definition of done do M1

O M1 só pode ser considerado concluído se todos os itens abaixo forem verdadeiros:

1. o projeto tem stack mínima de testes funcional
2. existem scripts separados por camada
3. a CI executa pelo menos build, typecheck e unitários
4. há pelo menos um teste funcional por camada principal adotada no mês
5. existe documentação suficiente para qualquer pessoa continuar o trabalho
6. o backlog do M2 foi preparado com base no que foi validado no M1

---

## 7. Riscos do M1

| Risco | Impacto | Mitigação |
|---|---|---|
| Escolha errada de tooling | retrabalho técnico | validar aderência ao stack antes de instalar tudo |
| CI ficar lenta demais | queda de produtividade | começar com gate mínimo e expandir gradualmente |
| Cobertura dispersa demais | baixo retorno | focar só em fundação e amostras críticas |
| Falta de padrão | testes inconsistentes | congelar convenção já na Semana 1 |

---

## 8. Evidências obrigatórias de fechamento

Ao fechar o M1, deve existir evidência clara de:

- configuração das ferramentas
- scripts definidos
- pipeline mínima funcionando
- primeiros testes rodando
- lista priorizada do M2
- relatório mensal do ciclo

---

## 9. Próximo passo após o M1

Ao concluir este backlog, o próximo passo obrigatório é:

**iniciar a implementação da base de testes e CI mínima no repositório, seguida da entrada no M2 com cobertura do backend crítico.**
