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
