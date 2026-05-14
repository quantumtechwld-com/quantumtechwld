# Quantum Technology Agency — Developer & AI Agent Guide

**Versão:** 1.0 — Abril 2026  
**Audiência:** Developers humanos e agentes de IA  
**Status:** Documento oficial e autoritativo do projeto

## Ordem obrigatória de consulta documental

Antes de qualquer implementação, análise, refactoring, teste, release ou revisão mensal, consultar nesta ordem:

1. `AGENTS.md`
2. `.github/copilot-instructions.md`
3. `docs/QUALITY-EXECUTION-PLAN.md`
4. `docs/DEVELOPER-GUIDE.md`
5. `docs/REFACTORING-PLAN.md`
6. `docs/COMPONENTIZATION-GUIDE.md` — tamanho, Server vs Client, padrões
7. `docs/API-FIRST-ANALYSIS.md` — integração externa, escalabilidade
8. `README.md`

### Regra de execução

- `AGENTS.md` define a ordem de prioridade e o comportamento operacional geral
- `.github/copilot-instructions.md` define as instruções mandatórias de execução
- `docs/QUALITY-EXECUTION-PLAN.md` define roadmap, TODO, análise mensal e gates de release
- Este documento serve como referência estrutural, arquitetural e operacional do projeto

---

## Índice

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Stack Técnica Completa](#2-stack-técnica-completa)
3. [Infraestrutura de Produção](#3-infraestrutura-de-produção)
4. [Estrutura de Diretórios](#4-estrutura-de-diretórios)
5. [Banco de Dados e Migrations](#5-banco-de-dados-e-migrations)
6. [Autenticação e Autorização](#6-autenticação-e-autorização)
7. [Roteamento e i18n](#7-roteamento-e-i18n)
8. [APIs — Endpoints Disponíveis](#8-apis--endpoints-disponíveis)
9. [Pipeline de Segurança Pre-Commit](#9-pipeline-de-segurança-pre-commit)
10. [Fluxo de Desenvolvimento](#10-fluxo-de-desenvolvimento)
11. [Deploy em Produção](#11-deploy-em-produção)
12. [Observabilidade — Sentry + Logs PM2](#12-observabilidade--sentry--logs-pm2)
13. [Backup Automático do Banco](#13-backup-automático-do-banco)
14. [Variáveis de Ambiente](#14-variáveis-de-ambiente)
15. [Regras Críticas — Proibições Absolutas](#15-regras-críticas--proibições-absolutas)

---

## 1. Visão Geral do Projeto

**Quantum Technology Agency** é uma plataforma SaaS de gestão de projetos de desenvolvimento de software. O sistema atende dois perfis de usuário:

- **CLIENT** — contrata serviços, acompanha pedidos, envia briefings, faz pagamentos
- **ADMIN** — gerencia clientes, propõe orçamentos, acompanha ordens, acessa relatórios

### Domínios principais

| Domínio | Descrição |
|---|---|
| **Landing Page** | Site público da agência com formulário de captação de leads |
| **Portal Cliente** | Área autenticada: briefings, pedidos, biblioteca de projetos, perfil |
| **Painel Admin** | Gestão interna: usuários, pedidos, propostas, briefings |
| **DevFlow** | Fluxo de entrega de software com rastreamento de ordens e mensagens |

---

## 2. Stack Técnica Completa

### Runtime e Framework

| Tecnologia | Versão | Papel |
|---|---|---|
| **Node.js** | 24.x | Runtime de produção (EC2) |
| **Next.js** | 16.1.6 | Framework fullstack (App Router) |
| **React** | 19.2.3 | UI |
| **TypeScript** | 5.x | Linguagem principal — `strict: true` |

### Banco de Dados

| Tecnologia | Versão | Papel |
|---|---|---|
| **PostgreSQL** | AWS RDS | Banco principal |
| **Prisma** | 7.x | ORM + migrations |
| **@prisma/adapter-pg** | 7.x | Driver nativo via `pg.Pool` |
| **pgvector** | — | Extensão para embeddings (biblioteca de projetos) |

### Autenticação

| Tecnologia | Versão | Papel |
|---|---|---|
| **NextAuth v5** | 5.0.0-beta.30 | Magic link + JWT sessions |
| **@auth/prisma-adapter** | 2.x | Persiste sessões no PostgreSQL |

### Pagamentos

| Tecnologia | Papel |
|---|---|
| **Stripe** | Checkout, webhooks, pagamentos de ordens |

### UI e Estilo

| Tecnologia | Papel |
|---|---|
| **Tailwind CSS v4** | Utilitários de estilo |
| **GSAP** | Animações da landing page |
| **Lucide React** | Ícones |
| **Lordicon** | Ícones animados |

### Internacionalização

| Tecnologia | Papel |
|---|---|
| **next-intl** | i18n com 3 locales: `pt` (padrão), `en`, `es` |

### Segurança (camadas)

| Ferramenta | Papel |
|---|---|
| **gitleaks** | Detecção de secrets em commits |
| **eslint-plugin-security** | SAST — análise estática de vulnerabilidades |
| **eslint-plugin-no-secrets** | Detecção de strings de alta entropia |
| **Husky + lint-staged** | Orquestra o pipeline pre-commit |
| **zod** | Validação de input em todas as APIs |
| **server-only** | Garante que módulos de servidor não vazem para o client |
| **CSP headers** | Content Security Policy configurada no `next.config.ts` |
| **HSTS** | `max-age=63072000; includeSubDomains; preload` |
| **CSRF double-submit** | Cookie `__csrf` injetado pelo middleware em rotas GET |

### Observabilidade

| Ferramenta | Papel |
|---|---|
| **Sentry** | Error tracking — client, server e edge |
| **PM2** | Process manager com cluster mode e log rotate |

---

## 3. Infraestrutura de Produção

> **Migração concluída em 11/05/2026.** Produção agora roda no VPS HostGator. AWS EC2 e RDS ainda estão ativos como backup — desligar após ~18/05/2026.

```
Internet → Route 53 (AWS) → VPS HostGator (Nginx) → PM2 (Next.js cluster) → PostgreSQL local
                                                                            → Sentry (erros)
                                                                            → Stripe (pagamentos)
```

### VPS HostGator

| Item | Valor |
|---|---|
| **IP** | `69.6.243.198` |
| **SSH** | `ssh -p 22022 root@69.6.243.198` |
| **OS** | Ubuntu 22.04 LTS |
| **App path** | `/home/deploy/quantum-agency/` |
| **Env file** | `/home/deploy/quantum-agency/.env.production.local` |
| **Logs PM2** | `pm2 logs quantum-agency` |

### PostgreSQL (VPS local)

| Item | Valor |
|---|---|
| **Host** | `localhost` / `127.0.0.1` |
| **Porta** | `5432` |
| **Database** | `quantumagency` |
| **User** | `quantum` |
| **Conexão** | `psql -U quantum -d quantumagency -h 127.0.0.1` |

### Nginx

- Proxy reverso: `443 → localhost:3000`
- Certificado TLS gerenciado via Let's Encrypt / certbot
- Config em: `/etc/nginx/sites-enabled/quantum-agency`
- Estáticos servidos direto do disco: `alias /home/deploy/quantum-agency/.next/static/`

### PM2 (`ecosystem.config.cjs`)

```js
instances: 2,          // cluster mode
exec_mode: "cluster",
node_args: "--max-old-space-size=350",  // 2 × 350 MB = 700 MB heap máx
max_restarts: 5,
min_uptime: "10s",
```

- **Deploy zero-downtime:** `pm2 reload ecosystem.config.cjs --update-env`

### S3 (legado AWS — desativar após 18/05/2026)

| Item | Valor |
|---|---|
| **Bucket** | `quantumtechwld-deploy` |
| **Backups** | `s3://quantumtechwld-deploy/db-backups/` |

> Backups do banco agora são feitos localmente no VPS via cron.

---

## 4. Estrutura de Diretórios

```
quantum-technology-agency/
├── .github/
│   └── copilot-instructions.md     # Regras para agentes IA — LEIA PRIMEIRO
├── .husky/
│   └── pre-commit                  # Pipeline de segurança (3 camadas)
├── docs/
│   ├── DEVELOPER-GUIDE.md          # Este documento
│   ├── DEPLOY.md                   # Guia de deploy manual
│   └── HANDOFF-*.md                # Registros de handoff
├── infra/
│   ├── ec2-setup.sh                # Script de provisionamento inicial EC2
│   └── domain-setup.sh             # Configuração de domínio
├── n8n/
│   └── workflow-lead-capture.json  # Workflow de captura de leads via n8n
├── prisma/
│   ├── schema.prisma               # Schema canônico do banco
│   └── migrations/                 # Histórico de migrations
├── public/                         # Assets estáticos
├── scripts/
│   └── ssm-*.json                  # Templates SSM para operações remotas
├── src/
│   ├── auth.config.ts              # Configuração edge-safe do NextAuth
│   ├── auth.ts                     # Configuração completa com PrismaAdapter
│   ├── middleware.ts               # CSRF + i18n + proteção de rotas
│   └── app/
│       ├── globals.css
│       ├── layout.tsx
│       ├── page.tsx                # Landing page (rota pública, com i18n)
│       ├── admin/                  # Painel administrativo (role: ADMIN)
│       ├── api/                    # Route handlers
│       ├── obrigado/               # Página pós-lead
│       └── portal/                 # Área do cliente (autenticada)
│   ├── components/                 # Componentes React compartilhados
│   ├── lib/
│   │   ├── prisma.ts               # Singleton PrismaClient (server-only)
│   │   ├── stripe.ts               # Cliente Stripe
│   │   ├── email.ts                # Nodemailer
│   │   ├── embeddings.ts           # pgvector helpers
│   │   └── constants.ts
│   ├── services/                   # Lógica de negócio (camada de serviço)
│   └── types/                      # Extensões de tipos TypeScript
├── ecosystem.config.cjs            # Configuração PM2
├── next.config.ts                  # Next.js + Sentry + security headers
├── eslint.config.mjs               # ESLint com camadas de segurança
├── tsconfig.json                   # TypeScript strict
└── package.json                    # Scripts, deps, lint-staged config
```

---

## 5. Banco de Dados e Migrations

### Modelos principais

| Modelo | Descrição |
|---|---|
| `User` | Usuário (CLIENT ou ADMIN), com role, status, locale |
| `Account` / `Session` | NextAuth v5 |
| `VerificationToken` | Magic link tokens |
| `Briefing` | Formulário de requisitos do projeto |
| `Order` | Pedido de desenvolvimento |
| `OrderMessage` | Mensagens em ordens (rastreamento) |
| `Proposal` / `ProposalComment` | Propostas e comentários |
| `ContactMessage` | Mensagens do formulário público de contato |

### Enums

```prisma
enum UserRole   { CLIENT  ADMIN }
enum UserStatus { PENDING ACTIVE SUSPENDED }
```

### Regras de migration

```bash
# Criar nova migration (desenvolvimento local)
npx prisma migrate dev --name descricao_da_mudanca

# Aplicar em produção (EC2 via SSM)
npx prisma migrate deploy
```

> **NUNCA** editar arquivos de migration já aplicados em produção.  
> **SEMPRE** fazer `prisma generate` após alterar o schema (já incluído no script `build`).

### Conexão (pool por worker)

```ts
// src/lib/prisma.ts
max: 5,               // 2 workers PM2 × 5 = 10 conexões totais no RDS
idleTimeoutMillis: 30_000,
connectionTimeoutMillis: 5_000,
SSL: true (produção) / false (localhost)
```

---

## 6. Autenticação e Autorização

### Estratégia

- **Magic Link** por e-mail — sem senha
- **JWT sessions** — lidas no edge (middleware) sem acesso ao banco
- **PrismaAdapter** — persiste `Account`, `Session`, `VerificationToken` no PostgreSQL

### Proteção de rotas (middleware.ts)

```
/admin/*     → requer role === "ADMIN"
/portal/*    → requer qualquer usuário autenticado (exceto subpaths públicos)
/api/*       → sem transformação pelo middleware (cada handler valida internamente)
```

### Status de usuário

| Status | Comportamento |
|---|---|
| `PENDING` | Redirect para `/portal/erro?reason=pending` |
| `ACTIVE` | Acesso normal |
| `SUSPENDED` | Redirect para `/portal/erro?reason=suspended` |

### CSRF

- Cookie `__csrf` (double-submit pattern) injetado em todas as respostas GET
- Não é `HttpOnly` para que o JS do formulário possa lê-lo
- `SameSite=Strict` + `Secure` em produção

---

## 7. Roteamento e i18n

### Locales suportados

| Locale | Idioma | Padrão |
|---|---|---|
| `pt` | Português | ✅ |
| `en` | Inglês | — |
| `es` | Espanhol | — |

### Estrutura de URLs

```
/              → landing page (locale detectado automaticamente)
/pt, /en, /es  → landing page em locale explícito
/portal/login  → autenticação
/portal/...    → área do cliente
/admin/...     → painel administrativo
/api/...       → route handlers (sem i18n)
```

### Configuração

- `src/i18n/routing.ts` — define locales e `defaultLocale`
- `src/i18n/request.ts` — carrega traduções por locale
- `next.config.ts` → `createNextIntlPlugin("./src/i18n/request.ts")`

---

## 8. APIs — Endpoints Disponíveis

Todos os endpoints usam **Zod** para validação de input. Respostas de erro seguem o padrão `{ error: string }`.

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/api/lead` | — | Captura lead → webhook n8n |
| `POST` | `/api/auth/[...nextauth]` | — | NextAuth handlers |
| `GET/POST` | `/api/briefing` | CLIENT | CRUD de briefings |
| `GET/POST` | `/api/orders` | CLIENT/ADMIN | Gestão de pedidos |
| `POST` | `/api/orders/[id]/messages` | CLIENT/ADMIN | Mensagens em ordens |
| `GET/POST` | `/api/proposal` | ADMIN | Propostas de orçamento |
| `GET/PUT` | `/api/profile` | CLIENT | Perfil do usuário |
| `GET` | `/api/library` | CLIENT | Biblioteca de projetos (pgvector) |
| `POST` | `/api/contact` | — | Formulário público de contato |
| `POST` | `/api/webhooks/stripe` | Stripe | Eventos de pagamento |
| `GET/POST` | `/api/admin/*` | ADMIN | Operações administrativas |

### Fluxo de lead (n8n)

```
Usuário preenche formulário → POST /api/lead → webhook n8n → CRM/notificação
```

Webhook configurado via variável `N8N_WEBHOOK_URL` no `.env`.

---

## 9. Pipeline de Segurança Pre-Commit

**Todo commit passa obrigatoriamente por 3 camadas.** Nenhuma pode ser bypassada.

### Camada 1 — gitleaks (secrets)

```sh
gitleaks protect --staged --redact --no-banner
```

- Escaneia todos os arquivos staged
- Bloqueia commits com API keys, tokens, senhas, DSNs em cleartext
- Instalado localmente: `winget install Gitleaks.Gitleaks` (Windows)

### Camada 2 — TypeScript (structural)

```sh
npx tsc --noEmit
```

- Valida tipos com `strict: true`
- Captura erros de Next.js App Router, Prisma types, NextAuth types
- Equivalente a "GuardVibe + CodeKeeper" — verifica toda a estrutura do projeto

### Camada 3 — lint-staged → ESLint (SAST)

```sh
npx lint-staged
# aplica: eslint --fix --max-warnings=0
```

- `eslint-plugin-security` — detecta vulnerabilidades OWASP (eval, RegExp injection, path traversal, etc.)
- `eslint-plugin-no-secrets` — entropia de strings (tolerance: 4.5)
- `eslint-config-next` — regras específicas do Next.js

### Fluxo quando um hook falha

```
1. Ler a mensagem de erro para identificar qual camada falhou
2. Corrigir o problema no código-fonte
3. git add <arquivos corrigidos>
4. git commit  (sem --no-verify)
```

> **PROIBIDO:** `git commit --no-verify`, `git commit -n`, modificar `.husky/pre-commit`

---

## 10. Fluxo de Desenvolvimento

### Setup inicial

```bash
git clone <repo>
cd quantum-technology-agency
npm install          # instala deps + executa postinstall: prisma generate && husky
cp .env.example .env.local   # preencher variáveis
npx prisma migrate dev       # aplicar migrations localmente
npm run dev                  # http://localhost:3000
```

### Ciclo de desenvolvimento

```
1. Criar branch: git checkout -b feat/nome-da-feature
2. Implementar a mudança
3. Verificar tipos: npm run typecheck
4. Verificar lint: npm run lint
5. git add + git commit   → pre-commit roda automaticamente
6. Abrir Pull Request
7. Aguardar aprovação
8. Merge em main
9. Deploy em produção (ver seção 11)
```

### Scripts disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `next dev` | Servidor de desenvolvimento |
| `build` | `prisma generate && next build` | Build de produção |
| `start` | `next start` | Servidor de produção local |
| `lint` | `eslint` | ESLint em todo o projeto |
| `typecheck` | `tsc --noEmit` | Verificação de tipos sem emitir |
| `migrate:deploy` | `prisma migrate deploy` | Aplicar migrations em produção |

### Regras de código

- Toda lógica de servidor em `src/lib/` ou `src/services/` deve ter `import "server-only"` no topo
- Toda validação de input de API usa **Zod** — sem `as unknown as Tipo`
- Queries Prisma usam `select` explícito — nunca retornar todos os campos de `User`
- Variáveis `NEXT_PUBLIC_*` são expostas ao browser — nunca colocar secrets nelas

---

## 11. Deploy em Produção

### Fluxo completo

```
git push origin main
→ GitHub Actions build (npm run build + tsc)
→ Artefato enviado para EC2 via SSM
→ pm2 reload ecosystem.config.cjs --update-env  (zero-downtime)
→ Nginx continua servindo sem interrupção
```

### Comando de deploy manual via SSM (PowerShell)

```powershell
$env:AWS_PAGER = ""
$cid = aws ssm send-command `
  --region sa-east-1 `
  --instance-ids i-0551c166546ff66e7 `
  --document-name AWS-RunShellScript `
  --parameters 'commands=["cd /home/ubuntu/quantum-agency && git pull && npm ci && npm run build && pm2 reload ecosystem.config.cjs --update-env"]' `
  --query Command.CommandId --output text

# Verificar resultado (aguardar ~2min)
aws ssm get-command-invocation `
  --command-id $cid `
  --instance-id i-0551c166546ff66e7 `
  --region sa-east-1 `
  --query "[Status,StandardOutputContent]" --output json
```

### Migrations em produção

```powershell
# Executar migrate deploy via SSM
$s = "cd /home/ubuntu/quantum-agency && npx prisma migrate deploy"
$b = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($s))
aws ssm send-command --region sa-east-1 --instance-ids i-0551c166546ff66e7 `
  --document-name AWS-RunShellScript `
  --parameters "commands=[`"echo $b | base64 -d | bash`"]" `
  --query Command.CommandId --output text
```

> **ATENÇÃO:** Sempre executar migrations **antes** de fazer reload do PM2 quando há mudanças de schema.

---

## 12. Observabilidade — Sentry + Logs PM2

### Sentry

- **DSN:** `https://5a1e6c17533d96676c0841be52e72e04@o4511237754978304.ingest.us.sentry.io/4511237758320640`
- **Organização:** `quantumtechwld-com` | **Projeto:** `quantum-agency`
- Captura erros em 3 runtimes: `client`, `server`, `edge`
- `tracesSampleRate: 0.1` — 10% das transações trackeadas
- Dashboard: [sentry.io](https://sentry.io) → organização `quantumtechwld-com`

### Configuração de arquivos Sentry

| Arquivo | Runtime |
|---|---|
| `sentry.client.config.ts` | Browser — Replay habilitado |
| `sentry.server.config.ts` | Node.js server |
| `sentry.edge.config.ts` | Edge runtime (middleware) |

### Logs PM2

```bash
# Via SSM — ver logs de erro
cat /home/ubuntu/logs/quantum-agency.err.log | tail -100

# Via SSM — ver logs de saída
cat /home/ubuntu/logs/quantum-agency.out.log | tail -50

# Status dos processos
pm2 status
pm2 monit
```

---

## 13. Backup Automático do Banco

### Configuração

| Item | Detalhe |
|---|---|
| **Script** | `/home/ubuntu/backup-db.sh` |
| **Cron** | `0 3 * * *` — diariamente às 03:00 UTC |
| **Destino** | `s3://quantumtechwld-deploy/db-backups/` |
| **Formato** | `quantum_devflow_YYYYMMDD_HHMMSS.sql.gz` |
| **Retenção** | 7 dias (arquivos mais antigos deletados automaticamente) |
| **Log** | `/home/ubuntu/logs/backup.log` |

### Executar backup manual

```powershell
$env:AWS_PAGER = ""
$s = "/home/ubuntu/backup-db.sh"
$b = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($s))
$cid = aws ssm send-command --region sa-east-1 --instance-ids i-0551c166546ff66e7 `
  --document-name AWS-RunShellScript `
  --parameters "commands=[`"echo $b | base64 -d | bash`"]" `
  --query Command.CommandId --output text

# Aguardar ~60s e verificar
aws ssm get-command-invocation --command-id $cid `
  --instance-id i-0551c166546ff66e7 --region sa-east-1 `
  --query "[Status,StandardOutputContent]" --output json
```

### Listar backups disponíveis

```powershell
aws s3 ls s3://quantumtechwld-deploy/db-backups/ --region sa-east-1
```

---

## 14. Variáveis de Ambiente

### Arquivo local: `.env.local` (desenvolvimento)

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/quantum_devflow
NEXTAUTH_SECRET=<string aleatória longa>
NEXTAUTH_URL=http://localhost:3000
EMAIL_FROM="Quantum Technology <noreply@quantumtechwld.com>"
EMAIL_SERVER_HOST=smtp.exemplo.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=...
EMAIL_SERVER_PASS=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
N8N_WEBHOOK_URL=https://...
```

### Arquivo de produção: `.env.production.local` (EC2)

Mesmo conjunto de variáveis com valores de produção. Localização: `/home/ubuntu/quantum-agency/.env.production.local`.

> **CRÍTICO:** `EMAIL_FROM` deve estar entre aspas duplas no arquivo `.env` — o bash não processa `export` nesse arquivo, mas o formato `KEY=value` sem aspas quebra se o valor contém espaços ou `<>`.

### GitHub Secrets (CI/CD)

| Secret | Uso |
|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Build no CI com Sentry habilitado |
| `AWS_ACCESS_KEY_ID` | Deploy via SSM |
| `AWS_SECRET_ACCESS_KEY` | Deploy via SSM |

---

## 15. Regras Críticas — Proibições Absolutas

### Git e commits

| Proibido | Motivo |
|---|---|
| `git commit --no-verify` | Bypassa o pipeline de segurança inteiro |
| `git commit -n` | Equivalente ao anterior |
| Modificar `.husky/pre-commit` | Enfraquece as camadas de proteção |
| Remover `"postinstall": "prisma generate && husky"` | Desinstala os hooks ao fazer `npm install` |

### Código

| Proibido | Motivo |
|---|---|
| Queries Prisma sem `select` explícito em dados de usuário | Vaza campos sensíveis |
| Input de API sem validação Zod | Vulnerabilidade de injeção / type confusion |
| Importar `src/lib/prisma.ts` em componentes Client | Vaza conexão de banco para o browser |
| Secrets em variáveis `NEXT_PUBLIC_*` | Exposto publicamente no bundle JS |
| `eval()` ou `new Function()` com input externo | XSS / RCE |

### Infraestrutura

| Proibido | Motivo |
|---|---|
| SSH direto ao VPS | `ssh -p 22022 root@69.6.243.198` (senha em `Acesso.txt`) |
| Editar migrations já aplicadas em produção | Corrompe o histórico do banco |
| `prisma db push` em produção | Bypassa o sistema de migrations |
| Deletar arquivos de log sem backup | Perde rastreabilidade de incidentes |

### Operações destrutivas que requerem confirmação explícita

Antes de executar qualquer um dos comandos abaixo, **comunicar ao usuário e aguardar confirmação**:

- `git reset --hard`
- `git push --force`
- `DROP TABLE` / `DELETE FROM` sem `WHERE`
- `pm2 delete` / `pm2 stop`
- Deletar arquivos do S3
- Alterar IAM policies ou roles

---

## Apêndice A — Comandos SSM de Referência Rápida

Todos os comandos abaixo são executados a partir do PowerShell local.

```powershell
# Verificar status do PM2
$s = "pm2 status"; $b = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($s))
aws ssm send-command --region sa-east-1 --instance-ids i-0551c166546ff66e7 `
  --document-name AWS-RunShellScript `
  --parameters "commands=[`"echo $b | base64 -d | bash`"]" `
  --query Command.CommandId --output text

# Ver últimas linhas do log de erro
$s = "tail -50 /home/ubuntu/logs/quantum-agency.err.log"

# Recarregar app (zero-downtime)
$s = "cd /home/ubuntu/quantum-agency && pm2 reload ecosystem.config.cjs --update-env"

# Verificar versão do Node
$s = "node --version && npm --version"
```

---

## Apêndice B — Histórico de Commits de Infraestrutura

| Commit | Descrição |
|---|---|
| `01e3551` | Fase 1: ESLint + Zod + server-only |
| `73c2621` | Fase 2: SonarCloud config |
| `e621e56` | Fase 3: CSRF double-submit |
| `a445938` | Cookie hardening |
| `9d76aeb` | Prisma select explícito no portal |
| `18ac382` | Sentry config files (client/server/edge) |
| `77620f9` | @sentry/nextjs instalado |
| `93e023c` | Husky pre-commit pipeline (gitleaks + tsc + lint-staged) |

---

*Documento mantido em `docs/DEVELOPER-GUIDE.md`. Atualizar a cada mudança significativa de arquitetura, stack ou regras de desenvolvimento.*
