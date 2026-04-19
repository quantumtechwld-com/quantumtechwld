# AGENTS.md

## Instruções mandatórias para agentes e execução técnica

Todo agente, automação ou executor que atuar neste repositório deve considerar os documentos abaixo como fontes oficiais de instrução, prioridade e critérios de execução.

## Ordem de leitura obrigatória

1. `.github/copilot-instructions.md`
2. `docs/QUALITY-EXECUTION-PLAN.md`
3. `docs/DEVELOPER-GUIDE.md`
4. `docs/REFACTORING-PLAN.md`
5. `README.md`

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
- estado real do código, pipeline, testes e release

O relatório mensal deve ser comparado com o mês anterior para medir evolução, regressão e próximos passos.
