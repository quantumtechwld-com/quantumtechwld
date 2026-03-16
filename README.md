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

## Executar localmente

1. Instale dependências:

```bash
npm install
```

2. Crie ou ajuste `.env.local`:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/quantum_devflow
N8N_WEBHOOK_URL=https://seu-webhook
GEMINI_API_KEY=sua_chave_gemini
AUTH_SECRET=string_aleatoria_32_chars
EMAIL_SERVER_USER=seu@gmail.com
EMAIL_SERVER_PASSWORD=app_password_gmail
EMAIL_FROM=seu@gmail.com
NEXTAUTH_URL=http://localhost:3000
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

## Fluxo principal

```
Cliente acessa / → texto livre "Analisar com IA" (S5)
  → Gemini extrai requisitos + busca projetos similares (S6)
  → Wizard pré-preenchido (S1–S2)
  → Complexity Score calculado (S3)
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

## Banco de dados

- Instância: PostgreSQL 15, `localhost:5432`
- Banco: `quantum_devflow`
- Migrações em: `prisma/migrations/`
- Schema em: `prisma/schema.prisma`

OS DADOS DO BANCO E AS CHAVES DE API NUNCA DEVEM SER COMMITADOS.
