# Stack Técnica — Project DevFlow

> **Sistema:** DevFlow / CodeBrain
> **Versão:** 1.0 (Blueprint)
> **Data:** 2026-03-06
> **Base existente:** Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4

---

## Princípios de Arquitetura

1. **Monorepo com separação clara** — Frontend (portal), Backend (API), Workers (jobs assíncronos), ML (serviço Python)
2. **API-first** — Toda funcionalidade é acessível via API REST + GraphQL
3. **Event-driven** — Módulos se comunicam via eventos (BullMQ) para desacoplamento
4. **Multi-tenant** — Cada agência é um tenant isolado, com dados segregados
5. **Progressive enhancement** — MVP entrega valor com features simples; IA incrementa progressivamente

---

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 16)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Portal       │  │ Dashboard    │  │ Deal Room                │  │
│  │ Público      │  │ do Cliente   │  │ (Proposta Interativa)    │  │
│  │ (Landing +   │  │ (M5 Vitrine) │  │ (M3 Negociação)         │  │
│  │  Wizard M1)  │  │              │  │                          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                 │                      │                  │
│  ┌──────┴─────────────────┴──────────────────────┴───────────────┐  │
│  │              API Gateway (Next.js API Routes / tRPC)          │  │
│  └──────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────────┐
│                        BACKEND (NestJS 11)                          │
│  ┌──────────────┐  ┌───────┴──────┐  ┌──────────────────────────┐  │
│  │ Auth Module  │  │ Project      │  │ Billing Module           │  │
│  │ (Auth.js +   │  │ Module       │  │ (Stripe/Asaas)           │  │
│  │  Magic Link) │  │ (CRUD +      │  │                          │  │
│  │              │  │  Workflow)    │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Briefing     │  │ Estimation   │  │ Integration Module       │  │
│  │ Module (M1)  │  │ Module (M2)  │  │ (GitHub/Jira/Linear)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Deal Room    │  │ Production   │  │ Analytics Module         │  │
│  │ Module (M3)  │  │ Module (M4)  │  │ (M7 Cérebro Central)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────┴──────────────────────────────────┐  │
│  │              Event Bus (BullMQ + Redis)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────────┐
│                        WORKERS (BullMQ)                             │
│  ┌──────────────┐  ┌───────┴──────┐  ┌──────────────────────────┐  │
│  │ Notification │  │ Deploy       │  │ Video Generator          │  │
│  │ Worker       │  │ Worker       │  │ Worker                   │  │
│  │ (Email/WA)   │  │ (Staging)    │  │ (TTS + FFmpeg)           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Jira Sync    │  │ Docs         │  │ Analytics Aggregator     │  │
│  │ Worker       │  │ Worker       │  │ Worker                   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────────┐
│                        ML SERVICE (Python FastAPI)                   │
│  ┌──────────────┐  ┌───────┴──────┐  ┌──────────────────────────┐  │
│  │ Complexity   │  │ Churn        │  │ Auto-Triage              │  │
│  │ Scorer       │  │ Predictor    │  │ Classifier               │  │
│  │ (XGBoost)    │  │ (XGBoost)    │  │ (Embeddings + LLM)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Maintenance  │  │ Capacity     │  │ Anomaly                  │  │
│  │ Predictor    │  │ Planner      │  │ Detector                 │  │
│  │ (Cox Reg.)   │  │ (Monte Carlo)│  │ (Z-score)                │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────────┐
│                        DATA LAYER                                   │
│  ┌──────────────┐  ┌───────┴──────┐  ┌──────────────────────────┐  │
│  │ PostgreSQL   │  │ ClickHouse   │  │ Redis 7                  │  │
│  │ 16 + pgvector│  │ (Analytics)  │  │ (Cache + Queues)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ MinIO / S3   │  │ Typesense    │  │ n8n                      │  │
│  │ (File Store) │  │ (Full-text)  │  │ (Workflow Orchestration)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Stack Detalhada

### Frontend

| Tecnologia | Versão | Finalidade |
|------------|--------|-----------|
| **Next.js** | 16 | Framework principal (App Router, Server Components, Streaming) |
| **React** | 19 | UI library (Server Components, Actions, Suspense) |
| **TypeScript** | 5.7+ | Type safety, inferência avançada |
| **Tailwind CSS** | 4 | Estilização utility-first |
| **Shadcn/ui** | latest | Componentes acessíveis (Radix UI primitives) |
| **Zustand** | 5 | Estado global leve (client-side) |
| **TanStack Query** | 5 | Data fetching, caching, sincronização |
| **React Flow** | 12 | Visualização de grafos (Dependency Graph M2) |
| **Recharts** | 3 | Gráficos (burndown, analytics, dashboards) |
| **Framer Motion** | 12 | Animações e transições |
| **tRPC** | 11 | Type-safe API calls (Next.js ↔ NestJS) |
| **Uploadthing** | 7 | Upload de arquivos (briefings, assets) |

### Backend

| Tecnologia | Versão | Finalidade |
|------------|--------|-----------|
| **NestJS** | 11 | Framework principal (modular, DI, guards, interceptors) |
| **TypeScript** | 5.7+ | Type safety end-to-end |
| **Prisma** | 6 | ORM principal (PostgreSQL, migrations, type-safe queries) |
| **Kysely** | — | Query builder para queries complexas (relatórios, analytics) |
| **Auth.js** | 5 | Autenticação (magic link, OAuth, JWT, session) |
| **BullMQ** | 5 | Job queue (workers assíncronos, cron jobs, retries) |
| **Zod** | 3 | Validação de input em todas as camadas |
| **@nestjs/swagger** | — | Geração automática de OpenAPI spec |
| **GraphQL (Apollo)** | 4 | API complementar para queries complexas (dashboards) |
| **node-cron** | — | Agendamento de tarefas periódicas |
| **pdfkit / @react-pdf/renderer** | — | Geração de propostas e relatórios PDF |

### Dados

| Tecnologia | Versão | Finalidade |
|------------|--------|-----------|
| **PostgreSQL** | 16 | Banco principal (transacional, multi-tenant) |
| **pgvector** | 0.7+ | Busca por similaridade semântica (briefings, issues, projetos) |
| **ClickHouse** | 24+ | Analytics de alta performance (time-series, dashboards executivos) |
| **Redis** | 7 | Cache, sessões, filas BullMQ, rate limiting |
| **Typesense** | 27+ | Full-text search (documentação, issues, knowledge base) |
| **MinIO** | — | Object storage S3-compatible (arquivos, vídeos, assets) |

### IA / ML

| Tecnologia | Finalidade |
|------------|-----------|
| **OpenAI GPT-4o** | Geração de escopo técnico, propostas, narrativas, auto-documentação |
| **OpenAI GPT-4o-mini** | Tasks de menor complexidade (classificação, extração, cache-friendly) |
| **Claude 3.5 Sonnet** | Alternativa para análise de código (PRs → documentação) |
| **OpenAI Whisper** | Transcrição de áudio (Briefing Intelligence) |
| **OpenAI TTS-1-HD** | Text-to-speech para vídeos de status semanal |
| **text-embedding-3-small** | Embeddings para busca semântica (pgvector) |
| **LangChain.js** | Orquestração de chains LLM (structured output, RAG) |
| **Python FastAPI** | Serviço ML dedicado (modelos treinados, Monte Carlo) |
| **XGBoost** | Complexity Scorer, Churn Predictor, Estimator calibration |
| **scikit-learn** | Pipelines de ML, feature engineering, métricas |
| **lifelines** | Survival analysis (Maintenance Predictor — Cox regression) |
| **NetworkX** | Grafo de dependências entre funcionalidades |

### Integrações

| Serviço | Função |
|---------|--------|
| **GitHub API** | Repos, PRs, issues, webhooks, deployments |
| **Jira API / Linear API** | Tasks, sprints, boards, webhooks |
| **ZapSign / DocuSign** | Assinatura digital de contratos |
| **Stripe** | Pagamentos internacionais, subscriptions, invoices |
| **Asaas** | Pagamentos Brasil (boleto, PIX, cartão) |
| **Meta Cloud API** | WhatsApp Business (notificações, vídeo status) |
| **Resend** | E-mails transacionais (magic link, notificações, relatórios) |
| **Brevo** | E-mail marketing e nurturing (leads, upsell) |
| **Google Calendar API** | Agendamento de kickoffs, reuniões |
| **ElevenLabs** | TTS premium (alternativa ao OpenAI TTS) |
| **Snyk / GitHub Advisory** | Monitoramento de vulnerabilidades |
| **Svix** | Webhook delivery (confiável, com retry e dashboard) |
| **n8n** | Workflow automation (extensão dos automations existentes) |
| **Vercel** | Deploy de previews e staging (integrado ao CI/CD) |

### Infraestrutura

| Componente | MVP (Q1) | Scale (Q3+) |
|------------|----------|-------------|
| **Hosting Backend** | Railway | AWS ECS Fargate |
| **Hosting Frontend** | Vercel | Vercel (Edge) |
| **Database** | Railway PostgreSQL | AWS RDS PostgreSQL |
| **Cache/Queue** | Railway Redis | AWS ElastiCache Redis |
| **Analytics DB** | ClickHouse Cloud (free tier) | ClickHouse Cloud (paid) |
| **Object Storage** | MinIO on Railway | AWS S3 |
| **ML Service** | Railway (Python container) | AWS ECS + SageMaker |
| **CI/CD** | GitHub Actions | GitHub Actions + ArgoCD |
| **Monitoring** | Sentry + Better Stack | Datadog + PagerDuty |
| **CDN** | Vercel Edge | CloudFront |
| **Containers** | Docker Compose (dev) | Docker + ECS (prod) |
| **IaC** | — | Terraform / Pulumi |

---

## Schema PostgreSQL (Core)

```sql
-- ============================================
-- MULTI-TENANT: AGÊNCIAS
-- ============================================

CREATE TABLE agencies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    plan            VARCHAR(20) NOT NULL DEFAULT 'starter'
                    CHECK (plan IN ('starter','growth','agency','enterprise')),
    logo_url        TEXT,
    settings        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agency_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id       UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(30) NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner','admin','pm','developer','viewer')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(agency_id, user_id)
);

-- ============================================
-- USUÁRIOS E AUTH
-- ============================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(320) UNIQUE NOT NULL,
    name            VARCHAR(200) NOT NULL,
    avatar_url      TEXT,
    role            VARCHAR(20) NOT NULL DEFAULT 'client'
                    CHECK (role IN ('superadmin','agency_admin','agency_member','client')),
    email_verified  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE magic_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(128) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- M1: INPUT HUB (BRIEFINGS)
-- ============================================

CREATE TABLE briefings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id       UUID NOT NULL REFERENCES agencies(id),
    client_id       UUID NOT NULL REFERENCES users(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','submitted','analyzing','proposal_sent','approved','archived')),
    project_type    VARCHAR(50),
    business_pain   TEXT,
    target_audience TEXT,
    desired_features JSONB NOT NULL DEFAULT '[]',
    tech_preferences JSONB NOT NULL DEFAULT '[]',
    budget_range    VARCHAR(50),
    deadline        VARCHAR(50),
    complexity_score DECIMAL(3,1),
    hours_estimate_min INT,
    hours_estimate_max INT,
    audio_url       TEXT,
    transcript      TEXT,
    assets          JSONB NOT NULL DEFAULT '[]',
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE briefing_embeddings (
    briefing_id     UUID PRIMARY KEY REFERENCES briefings(id) ON DELETE CASCADE,
    embedding       vector(1536) NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE similar_projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id       UUID NOT NULL REFERENCES agencies(id),
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    project_type    VARCHAR(50),
    tech_stack      JSONB NOT NULL DEFAULT '[]',
    duration_days   INT,
    complexity_score DECIMAL(3,1),
    embedding       vector(1536),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- M2: CÉREBRO DE ARQUITETURA (ESPECIFICAÇÃO)
-- ============================================

CREATE TABLE specifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    briefing_id     UUID NOT NULL REFERENCES briefings(id),
    agency_id       UUID NOT NULL REFERENCES agencies(id),
    features        JSONB NOT NULL DEFAULT '[]',
    user_stories    JSONB NOT NULL DEFAULT '[]',
    screens         JSONB NOT NULL DEFAULT '[]',
    integrations    JSONB NOT NULL DEFAULT '[]',
    business_rules  JSONB NOT NULL DEFAULT '[]',
    dependency_graph JSONB NOT NULL DEFAULT '{}',
    risk_assessment JSONB NOT NULL DEFAULT '[]',
    version         INT NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE estimates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL REFERENCES specifications(id),
    agency_id       UUID NOT NULL REFERENCES agencies(id),
    scenario        VARCHAR(20) NOT NULL DEFAULT 'realistic'
                    CHECK (scenario IN ('optimistic','realistic','pessimistic')),
    hours_frontend  DECIMAL(8,1),
    hours_backend   DECIMAL(8,1),
    hours_qa        DECIMAL(8,1),
    hours_pm        DECIMAL(8,1),
    hours_total     DECIMAL(8,1),
    cost_junior     DECIMAL(12,2),
    cost_mid        DECIMAL(12,2),
    cost_senior     DECIMAL(12,2),
    cost_total      DECIMAL(12,2),
    deadline_days   INT,
    what_if_params  JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- M3: DEAL ROOM (PROPOSTAS E CONTRATOS)
-- ============================================

CREATE TABLE proposals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL REFERENCES specifications(id),
    agency_id       UUID NOT NULL REFERENCES agencies(id),
    client_id       UUID NOT NULL REFERENCES users(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','sent','review','negotiation','approved','rejected','expired')),
    title           VARCHAR(300) NOT NULL,
    content         JSONB NOT NULL DEFAULT '{}',
    total_value     DECIMAL(12,2),
    payment_terms   JSONB NOT NULL DEFAULT '{}',
    version         INT NOT NULL DEFAULT 1,
    signed_at       TIMESTAMPTZ,
    signature_provider VARCHAR(30),
    signature_ref   VARCHAR(200),
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE proposal_comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id     UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id),
    section_ref     VARCHAR(100),
    content         TEXT NOT NULL,
    resolved        BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE proposal_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id     UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    version         INT NOT NULL,
    content         JSONB NOT NULL,
    changed_by      UUID REFERENCES users(id),
    change_summary  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- M3: PAGAMENTOS
-- ============================================

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id     UUID NOT NULL REFERENCES proposals(id),
    agency_id       UUID NOT NULL REFERENCES agencies(id),
    gateway         VARCHAR(30) NOT NULL
                    CHECK (gateway IN ('stripe','asaas','mercado_pago','manual')),
    gateway_ref     VARCHAR(200),
    amount          DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'BRL',
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','paid','failed','refunded','cancelled')),
    installment     INT DEFAULT 1,
    total_installments INT DEFAULT 1,
    checkout_url    TEXT,
    receipt_url     TEXT,
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- M4: CÉREBRO DE PRODUÇÃO (PROJETOS)
-- ============================================

CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id       UUID NOT NULL REFERENCES agencies(id),
    proposal_id     UUID REFERENCES proposals(id),
    client_id       UUID NOT NULL REFERENCES users(id),
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'setup'
                    CHECK (status IN ('setup','active','paused','completed','cancelled')),
    external_ref    VARCHAR(200),
    external_tool   VARCHAR(30)
                    CHECK (external_tool IN ('jira','linear','github_projects','manual')),
    staging_url     TEXT,
    production_url  TEXT,
    repo_url        TEXT,
    started_at      TIMESTAMPTZ,
    target_date     TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    settings        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(agency_id, slug)
);

CREATE TABLE sprints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    number          INT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'planned'
                    CHECK (status IN ('planned','active','completed')),
    start_date      DATE,
    end_date        DATE,
    capacity_hours  DECIMAL(6,1),
    velocity_planned INT,
    velocity_actual INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id       UUID REFERENCES sprints(id),
    assigned_to     UUID REFERENCES agency_members(id),
    title           VARCHAR(300) NOT NULL,
    description     TEXT,
    type            VARCHAR(20) NOT NULL DEFAULT 'story'
                    CHECK (type IN ('epic','story','task','bug','subtask')),
    status          VARCHAR(30) NOT NULL DEFAULT 'backlog'
                    CHECK (status IN ('backlog','todo','in_progress','review','testing','done','blocked')),
    priority        VARCHAR(10) DEFAULT 'medium'
                    CHECK (priority IN ('critical','high','medium','low')),
    area            VARCHAR(20)
                    CHECK (area IN ('frontend','backend','infra','design','qa','pm')),
    story_points    INT,
    estimated_hours DECIMAL(6,1),
    actual_hours    DECIMAL(6,1),
    requires_client_approval BOOLEAN NOT NULL DEFAULT false,
    client_approved_at TIMESTAMPTZ,
    external_ref    VARCHAR(200),
    embedding       vector(1536),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- M5: VITRINE DO CLIENTE
-- ============================================

CREATE TABLE milestones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    target_date     DATE,
    completed_at    TIMESTAMPTZ,
    nps_score       INT CHECK (nps_score BETWEEN 0 AND 10),
    nps_comment     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE deliverables (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id    UUID REFERENCES milestones(id),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    type            VARCHAR(20) NOT NULL DEFAULT 'feature'
                    CHECK (type IN ('feature','fix','improvement','design')),
    screenshot_url  TEXT,
    video_url       TEXT,
    staging_url     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE client_feedbacks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deliverable_id  UUID REFERENCES deliverables(id),
    project_id      UUID NOT NULL REFERENCES projects(id),
    client_id       UUID NOT NULL REFERENCES users(id),
    content         TEXT NOT NULL,
    sentiment       VARCHAR(10)
                    CHECK (sentiment IN ('positive','neutral','negative')),
    resolved        BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE weekly_videos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id),
    week_start      DATE NOT NULL,
    script          TEXT,
    video_url       TEXT,
    audio_url       TEXT,
    sent_at         TIMESTAMPTZ,
    channel         VARCHAR(20)
                    CHECK (channel IN ('email','whatsapp','both')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- M6: ALQUIMISTA (ENTREGA)
-- ============================================

CREATE TABLE project_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN ('readme','architecture','user_manual','api_docs','env_vars','setup_guide','retrospective')),
    title           VARCHAR(200) NOT NULL,
    content         TEXT,
    file_url        TEXT,
    version         INT NOT NULL DEFAULT 1,
    auto_generated  BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE credential_vault (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label           VARCHAR(200) NOT NULL,
    encrypted_data  BYTEA NOT NULL,
    encryption_key_ref VARCHAR(100) NOT NULL,
    share_token_hash VARCHAR(128),
    share_expires_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    accessed_by     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE support_tickets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id),
    client_id       UUID NOT NULL REFERENCES users(id),
    assigned_to     UUID REFERENCES agency_members(id),
    title           VARCHAR(300) NOT NULL,
    description     TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','in_progress','waiting_client','resolved','closed')),
    priority        VARCHAR(10) DEFAULT 'medium'
                    CHECK (priority IN ('critical','high','medium','low')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at     TIMESTAMPTZ
);

-- ============================================
-- M7: CÉREBRO CENTRAL (ANALYTICS)
-- ============================================

CREATE TABLE project_financials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id),
    agency_id       UUID NOT NULL REFERENCES agencies(id),
    estimated_hours DECIMAL(8,1),
    actual_hours    DECIMAL(8,1),
    estimated_cost  DECIMAL(12,2),
    actual_cost     DECIMAL(12,2),
    revenue         DECIMAL(12,2),
    indirect_costs  DECIMAL(12,2) DEFAULT 0,
    margin_pct      DECIMAL(5,2),
    avg_nps         DECIMAL(3,1),
    churn_risk_score DECIMAL(5,2),
    calculated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agency_metrics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id       UUID NOT NULL REFERENCES agencies(id),
    period          VARCHAR(10) NOT NULL,
    period_start    DATE NOT NULL,
    avg_proposal_days DECIMAL(5,1),
    avg_estimation_accuracy DECIMAL(5,2),
    avg_nps         DECIMAL(3,1),
    avg_margin_pct  DECIMAL(5,2),
    projects_completed INT,
    projects_active INT,
    total_revenue   DECIMAL(14,2),
    calculated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(agency_id, period, period_start)
);

-- ============================================
-- AUDIT LOG (CROSS-MODULE)
-- ============================================

CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id       UUID REFERENCES agencies(id),
    user_id         UUID REFERENCES users(id),
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID NOT NULL,
    action          VARCHAR(30) NOT NULL,
    old_data        JSONB,
    new_data        JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_agency ON audit_log(agency_id, created_at DESC);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_briefings_agency ON briefings(agency_id, status);
CREATE INDEX idx_briefings_client ON briefings(client_id);
CREATE INDEX idx_proposals_agency ON proposals(agency_id, status);
CREATE INDEX idx_projects_agency ON projects(agency_id, status);
CREATE INDEX idx_tasks_project ON tasks(project_id, status);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_payments_proposal ON payments(proposal_id, status);
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_deliverables_project ON deliverables(project_id);
CREATE INDEX idx_support_tickets_project ON support_tickets(project_id, status);

-- VECTOR INDEXES (pgvector)
CREATE INDEX idx_briefing_embeddings ON briefing_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_similar_projects_embedding ON similar_projects USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_tasks_embedding ON tasks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Schema ClickHouse (Analytics)

```sql
-- Events de uso do dashboard do cliente
CREATE TABLE client_events (
    agency_id       UUID,
    project_id      UUID,
    client_id       UUID,
    event_type      LowCardinality(String),
    page            String,
    metadata        String,
    timestamp       DateTime64(3)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (agency_id, project_id, timestamp);

-- Métricas de produção (tasks, sprints)
CREATE TABLE production_metrics (
    agency_id       UUID,
    project_id      UUID,
    sprint_id       UUID,
    tasks_completed UInt32,
    tasks_blocked   UInt32,
    hours_burned    Float32,
    hours_estimated Float32,
    velocity        Float32,
    date            Date
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (agency_id, project_id, date);

-- Usage analytics (produtos do cliente)
CREATE TABLE product_usage (
    project_id      UUID,
    session_id      String,
    page_url        String,
    event_type      LowCardinality(String),
    element_id      String,
    timestamp       DateTime64(3)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (project_id, timestamp);
```

---

## Estrutura do Monorepo

```
quantum-technology/
├── apps/
│   ├── web/                          # Next.js 16 (Frontend)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (public)/         # Landing page, login
│   │   │   │   ├── (portal)/         # Portal do cliente (M5)
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── proposals/
│   │   │   │   │   ├── deliverables/
│   │   │   │   │   └── support/
│   │   │   │   ├── (agency)/         # Painel da agência
│   │   │   │   │   ├── briefings/    # M1
│   │   │   │   │   ├── specs/        # M2
│   │   │   │   │   ├── deal-room/    # M3
│   │   │   │   │   ├── projects/     # M4
│   │   │   │   │   ├── analytics/    # M7
│   │   │   │   │   └── settings/
│   │   │   │   └── api/              # API Routes (proxy/tRPC)
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Shadcn components
│   │   │   │   ├── briefing/
│   │   │   │   ├── deal-room/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── project/
│   │   │   │   └── charts/
│   │   │   ├── lib/
│   │   │   │   ├── trpc.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── utils.ts
│   │   │   └── hooks/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   ├── api/                          # NestJS 11 (Backend)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── agency/
│   │   │   │   ├── briefing/         # M1
│   │   │   │   ├── specification/    # M2
│   │   │   │   ├── proposal/         # M3
│   │   │   │   ├── payment/          # M3
│   │   │   │   ├── project/          # M4
│   │   │   │   ├── sprint/           # M4
│   │   │   │   ├── task/             # M4
│   │   │   │   ├── milestone/        # M5
│   │   │   │   ├── deliverable/      # M5
│   │   │   │   ├── document/         # M6
│   │   │   │   ├── vault/            # M6
│   │   │   │   ├── support/          # M6
│   │   │   │   ├── analytics/        # M7
│   │   │   │   └── integration/      # GitHub, Jira, Linear
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── decorators/
│   │   │   │   └── pipes/
│   │   │   ├── config/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   └── migrations/
│   │   │   └── main.ts
│   │   ├── test/
│   │   └── package.json
│   │
│   └── ml/                           # Python FastAPI (ML Service)
│       ├── app/
│       │   ├── routers/
│       │   │   ├── complexity.py
│       │   │   ├── churn.py
│       │   │   ├── triage.py
│       │   │   ├── maintenance.py
│       │   │   └── capacity.py
│       │   ├── models/
│       │   ├── services/
│       │   └── main.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   ├── shared/                       # Tipos e utils compartilhados
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── constants/
│   │   │   └── validators/
│   │   └── package.json
│   └── db/                           # Prisma client compartilhado
│       ├── prisma/
│       └── package.json
│
├── workers/                          # BullMQ Workers
│   ├── src/
│   │   ├── notification.worker.ts
│   │   ├── deploy.worker.ts
│   │   ├── video.worker.ts
│   │   ├── jira-sync.worker.ts
│   │   ├── docs.worker.ts
│   │   └── analytics.worker.ts
│   └── package.json
│
├── n8n/                              # Workflows n8n (já existente)
│   ├── workflow-lead-capture.json
│   └── README.md
│
├── docs/                             # Documentação do projeto
│   ├── HANDOFF-2026-02-21.md
│   ├── PROJECT-DEVFLOW-ANALISE.md
│   └── STACK-TECNICA.md
│
├── docker-compose.yml
├── turbo.json                        # Turborepo config
├── package.json                      # Root package.json (workspaces)
├── .env.example
├── .gitignore
└── README.md
```

---

## Comandos de Desenvolvimento

```bash
# Instalar dependências (monorepo)
pnpm install

# Dev mode (todos os apps)
pnpm dev

# Dev mode (app específico)
pnpm --filter @devflow/web dev
pnpm --filter @devflow/api dev

# Build
pnpm build

# Testes
pnpm test
pnpm test:e2e

# Lint
pnpm lint

# Database
pnpm --filter @devflow/db prisma migrate dev
pnpm --filter @devflow/db prisma generate
pnpm --filter @devflow/db prisma studio

# Workers
pnpm --filter @devflow/workers dev

# ML Service
cd apps/ml && pip install -r requirements.txt && uvicorn app.main:app --reload

# Docker (local completo)
docker compose up -d

# Type check
pnpm typecheck
```

---

## Variáveis de Ambiente (.env.example)

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://devflow:password@localhost:5432/devflow
CLICKHOUSE_URL=http://localhost:8123
REDIS_URL=redis://localhost:6379

# ============================================
# AUTH
# ============================================
AUTH_SECRET=your-secret-key-min-32-chars
AUTH_URL=http://localhost:3000

# ============================================
# AI / LLM
# ============================================
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=...

# ============================================
# PAYMENTS
# ============================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ASAAS_API_KEY=...

# ============================================
# INTEGRATIONS
# ============================================
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY=...
JIRA_CLIENT_ID=...
JIRA_CLIENT_SECRET=...
LINEAR_API_KEY=...

# ============================================
# NOTIFICATIONS
# ============================================
RESEND_API_KEY=re_...
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_ID=...
N8N_WEBHOOK_URL=https://...

# ============================================
# STORAGE
# ============================================
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_BUCKET=devflow

# ============================================
# SIGNING
# ============================================
ZAPSIGN_API_KEY=...

# ============================================
# ML SERVICE
# ============================================
ML_SERVICE_URL=http://localhost:8000

# ============================================
# APP
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:3001
NODE_ENV=development
```

---

## Segurança

| Camada | Implementação |
|--------|--------------|
| **Autenticação** | Auth.js com Magic Link (e-mail) + OAuth (Google/GitHub) para membros da agência |
| **Autorização** | RBAC multi-nível: `superadmin > agency_admin > pm > developer > client` |
| **Multi-tenant** | Row-level security via `agency_id` em todas as queries + middleware NestJS |
| **Criptografia** | AES-256-GCM para vault de credenciais, TLS 1.3 em trânsito |
| **Rate Limiting** | Redis-backed rate limiter por tenant + por endpoint |
| **Input Validation** | Zod schemas em todas as fronteiras (API routes, workers, webhooks) |
| **CSRF** | Proteção nativa do Next.js + SameSite cookies |
| **Headers** | Helmet.js (CSP, X-Frame-Options, HSTS) |
| **Audit** | Log de todas as ações sensíveis (tabela `audit_log`) |
| **LGPD/GDPR** | Consentimento configurável, export de dados, right to deletion |
| **Secrets** | Variáveis de ambiente, nunca hardcoded; rotação periódica |

---

## Monitoramento e Observabilidade

| Ferramenta | Função | Fase |
|------------|--------|------|
| **Sentry** | Error tracking (frontend + backend) | MVP |
| **Better Stack** | Uptime monitoring + status page | MVP |
| **Axiom** | Log aggregation | MVP |
| **Datadog** | APM + métricas + dashboards | Scale |
| **PagerDuty** | Alertas e escalação | Scale |
| **OpenTelemetry** | Tracing distribuído | Scale |

---

## Performance Targets

| Métrica | Target MVP | Target Scale |
|---------|-----------|-------------|
| TTFB (Time to First Byte) | < 200ms | < 100ms |
| LCP (Largest Contentful Paint) | < 2.5s | < 1.5s |
| API P95 latency | < 500ms | < 200ms |
| Dashboard load time | < 3s | < 1.5s |
| Uptime | 99.5% | 99.9% |
| Video generation | < 5min | < 2min |
| Briefing Intelligence processing | < 30s | < 15s |
