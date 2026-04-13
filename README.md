# Agency Site — Apex Dev Studio

Landing page + sistema DevFlow para agência de desenvolvimento de software.

## Funcionalidades implementadas

| Módulo | Descrição | Status |
|--------|-----------|--------|
| S1–S2 | Wizard multi-etapas (5 etapas) | ✅ |
| S3 | Complexity Score (heurística 1–10 + estimativa de horas) | ✅ |
| S4 | Portal do cliente com magic-link auth | ✅ |
| S5 | Briefing Intelligence — análise de texto livre com Gemini | ✅ |
| S6 | Similar Projects Library — embeddings + busca semântica | ✅ |
| S7 | Conversão cambial real (EUR→BRL/USD) via frankfurter.app | ✅ |
| S8 | E-mails de convite multilíngues (PT/EN/ES) com seletor de idioma no admin | ✅ |
| S9 | Magic link reescrito com Auth.js nativo — sem hash manual | ✅ |

## Executar localmente

1. Instale dependências:

```bash
npm install
```

2. Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env.local
```

Variáveis obrigatórias em `.env.local`:

```env
DATABASE_URL=postgresql://user:senha@host:5432/quantum_devflow
AUTH_SECRET=string_aleatoria_32_chars
AUTH_URL=http://localhost:3000
GEMINI_API_KEY=sua_chave_gemini
N8N_WEBHOOK_URL=https://seu-webhook
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=seu@gmail.com
EMAIL_SERVER_PASSWORD=app_password_gmail
EMAIL_FROM=Nome <seu@gmail.com>
EMAIL_ADMIN=seu@gmail.com
ADMIN_EMAIL=seu@gmail.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MOCK=true
```

3. Execute a migração do banco:

```bash
npx prisma migrate deploy
```

4. Inicie o projeto:

```bash
npm run dev
```

5. Acesse `http://localhost:3000`.

## Deploy em produção

O deploy é feito automaticamente via GitHub Actions a cada push na branch `main`.

Consulte o guia completo em [docs/DEPLOY.md](docs/DEPLOY.md).
  → Lead salvo no banco + webhook n8n
  → Magic link enviado por e-mail (S4)
  → Cliente acessa /portal → dashboard com status
  → Equipe acessa /portal/biblioteca → cadastra projetos entregues
```

## Similar Projects Library (S6)

Quando um briefing é analisado, o sistema:
1. Gera um embedding de 768 dimensões via `text-embedding-004` (Gemini).
2. Compara com todos os projetos cadastrados usando cosine similarity em TypeScript.
3. Injeta os 3 mais similares (threshold ≥ 0.7) no prompt do Gemini como contexto.

**Nota sobre pgvector:** A biblioteca pgvector não possui binários pré-compilados para Windows/PostgreSQL 15. Em produção Linux, basta alterar a coluna `embedding` para `vector(768)` e usar o operador `<=>` — a lógica de negócio não muda.

Para cadastrar projetos na biblioteca: `/portal/biblioteca` (autenticação necessária).

## Build de produção

```bash
npm run build
npm run start
```

## Política de moeda

Este item é sensível e influencia diretamente percepção de preço, proposta e cobrança.

- Exibição por idioma: estimativas e propostas do portal podem ser formatadas por locale.
  `en -> USD`, `es -> EUR`, `pt -> BRL`.
- Cobrança real: checkout Stripe e invoice devem usar a moeda da transação gravada,
  nunca a moeda inferida do idioma.
- Estado atual do projeto: o checkout de pedidos cobra em `EUR`.
- Regra obrigatória: não usar helpers baseados em locale em fluxos de pagamento,
  fatura, webhook ou persistência financeira.
- Para suportar multi-currency real no futuro: persistir `proposalCurrency`/`paymentCurrency`
  no banco e aplicar conversão cambial explícita antes de criar a sessão Stripe.

Resumo:
- `locale` controla exibição.
- `currency` persistida controla cobrança.

### Próxima implementação recomendada: multi-currency real

Para evoluir de exibição por idioma para cobrança real por moeda, seguir esta ordem:

1. Banco de dados:
  adicionar campos persistidos como `proposalCurrency`, `paymentCurrency`, `fxRate`, `fxBaseCurrency`.
2. Proposta:
  gerar e salvar a moeda comercial da proposta no momento da emissão, sem depender do locale depois.
3. Conversão:
  aplicar conversão cambial explícita a partir de uma fonte definida e versionar a taxa usada.
4. Checkout Stripe:
  criar a sessão com `currency` derivada da proposta/pagamento persistido, nunca da interface.
5. Invoice e e-mails:
  renderizar sempre a moeda persistida na transação.
6. Auditoria:
  registrar no pedido a moeda original, taxa aplicada e valor final cobrado para rastreabilidade.

Regra de segurança:
qualquer mudança em cobrança deve preservar consistência entre proposta, checkout, webhook, invoice e portal.

## Banco de dados

- **Produção:** AWS RDS PostgreSQL 16.6 (`db.t3.micro`, `sa-east-1`)
- **Local:** PostgreSQL rodando localmente
- Banco: `quantum_devflow`
- Migrações em: `prisma/migrations/`
- Schema em: `prisma/schema.prisma`

> **Segurança:** Credenciais e chaves de API NUNCA devem ser commitadas. Use `.env.local` localmente e GitHub Secrets em produção.

## Fluxo de convite de clientes

O admin acessa `/admin/users`, preenche nome, e-mail e idioma (🇧🇷/🇺🇸/🇪🇸) e clica em **Convidar**.

1. `POST /api/admin/users/invite` cria ou reativa o usuário como `ACTIVE`.
2. Auth.js (`signIn("nodemailer", { redirect: false })`) gera o token, faz hash, persiste no DB e chama `sendVerificationRequest`.
3. `sendVerificationRequest` (em `src/auth.ts`) detecta o parâmetro `invite_locale` no `callbackUrl`, busca o nome do usuário no banco e envia o e-mail personalizado no idioma correto.
4. Login normal (página `/portal/login`) também usa `sendVerificationRequest`, mas recebe um e-mail simples (sem `invite_locale` → template diferente).

> **Por que Auth.js nativo?** Qualquer implementação manual de token cria risco de incompatibilidade de hash entre geração e validação. O Auth.js internamente usa `SHA256(rawToken + AUTH_SECRET)` — ao delegar para `signIn()`, esse detalhe fica encapsulado e imune a mudanças de versão.

## Templates de e-mail

| Arquivo | Finalidade |
|---|---|
| `src/lib/email-templates/invite.ts` | Templates multilíngues de convite (PT/EN/ES) |
| `src/lib/email-templates/orders.ts` | Notificações de pedido |
| `src/lib/email-templates/payments.ts` | Notificações de pagamento |
| `src/lib/email-templates/proposal.ts` | Envio de proposta |
