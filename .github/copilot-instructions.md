- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
  - Website premium para agência de desenvolvimento, com comunicação fácil, formulário de lead e integração com agente via n8n.

- [x] Scaffold the Project
  - Projeto Next.js + TypeScript + Tailwind criado em `.` (raiz do projeto).

- [x] Customize the Project
  - Landing page premium implementada.
  - Página de obrigado criada em `/obrigado`.
  - Endpoint `POST /api/lead` criado para enviar leads ao webhook do n8n.

- [x] Install Required Extensions
  - Nenhuma extensão adicional necessária para este setup.

- [x] Compile the Project
  - Build executado com sucesso (`npm run build`).

- [x] Create and Run Task
  - Etapa dispensada: scripts padrão do `package.json` já atendem execução local e build.

- [x] Launch the Project
  - Servidor de desenvolvimento iniciado e confirmado em http://localhost:3000.

- [x] Ensure Documentation is Complete
  - README atualizado com setup local, variável `N8N_WEBHOOK_URL` e fluxo de lead.
  - Arquivo `copilot-instructions.md` mantido sem comentários HTML.

- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.

## MODO ANÁLISE — Palavras-chave que bloqueiam execução

Sempre que o pedido do utilizador contiver qualquer uma das palavras abaixo (em qualquer capitalização):

- **ANALISE**
- **VERIFIQUE**
- **ME INFORME**

### Comportamento obrigatório neste modo:
1. **NÃO executar, criar, editar ou apagar nenhum arquivo ou código**
2. **NÃO rodar nenhum comando no terminal**
3. Ler e explorar os arquivos necessários (read-only)
4. Retornar ao utilizador uma avaliação clara com:
   - O que foi encontrado / estado atual
   - Riscos, impactos ou pontos de atenção
   - Opções ou recomendações possíveis
5. **Aguardar aprovação explícita ("pode executar", "ok", "faz isso", etc.) antes de qualquer ação**

### Critérios de verificação obrigatórios em análises:

#### Componentização (`docs/COMPONENTIZATION-GUIDE.md`)
- Componentes acima de 300 linhas?
- `'use client'` aplicado apenas nas folhas?
- Lógica de negócio em route handlers (deveria estar em `src/services/`)?
- Mais de 3 `useState` ou > 7 props em algum componente?

#### API-first (`docs/API-FIRST-ANALYSIS.md`)
- Endpoints sem validação `zod`?
- Lógica misturada em route handlers?
- APIs públicas sem rate limiting ou CSRF?
- Ausência de versionamento e documentação OpenAPI?

#### Qualidade geral (`docs/QUALITY-EXECUTION-PLAN.md`)
- Alinhamento com roadmap mensal?
- Gaps de testes automatizados?
- Conformidade com pipeline de segurança?

### Exemplos de frases que NÃO são aprovação:
- "interessante", "entendi", "ok obrigado", "faz sentido" → **não executar**

### Exemplos de frases que SÃO aprovação:
- "pode executar", "faz isso", "ok, implementa", "segue em frente", "confirmo"

## CRÍTICO: Pre-commit hooks são INTOCÁVEIS

O projeto possui um pipeline de segurança obrigatório via Husky (`.husky/pre-commit`):
- Camada 1: **gitleaks** — detecção de secrets/credenciais nos arquivos staged
- Camada 2: **tsc --noEmit** — verificação estrutural TypeScript (Next.js + Prisma strict)
- Camada 3: **lint-staged** — ESLint com `eslint-plugin-security` (SAST) + `eslint-plugin-no-secrets`

### PROIBIDO:
- NUNCA sugerir ou executar `git commit --no-verify`
- NUNCA sugerir ou executar `git commit -n`
- NUNCA desabilitar, modificar ou contornar os hooks do Husky
- NUNCA remover `"postinstall": "prisma generate && husky"` do `package.json`

### Fluxo correto quando um hook falha:
1. Identificar qual camada falhou (gitleaks / tsc / eslint)
2. Corrigir o problema na origem
3. Re-stagear os arquivos corrigidos
4. Commitar normalmente (sem flags de bypass)
