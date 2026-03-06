# DevFlow — SEO & Internacionalização (PT / EN / ES)

> **Projeto:** DevFlow / CodeBrain
> **Objetivo:** Conteúdo 100% otimizado para SEO em três idiomas
> **Data:** 2026-03-06

---

## Sumário

1. [Requisito 1 — Internacionalização (i18n) Completa](#requisito-1--internacionalização-i18n-completa)
2. [Requisito 2 — SEO Técnico + On-Page 100%](#requisito-2--seo-técnico--on-page-100)
3. [Meta Tags por Idioma](#meta-tags-por-idioma)
4. [Palavras-chave Estratégicas](#palavras-chave-estratégicas)
5. [Conteúdo Institucional Trilíngue](#conteúdo-institucional-trilíngue)
6. [Schema.org Structured Data](#schemaorg-structured-data)
7. [Checklist SEO Completo](#checklist-seo-completo)

---

## Requisito 1 — Internacionalização (i18n) Completa

### Arquitetura de URLs (Subpath Routing)

```
devflow.io/            → Português (idioma padrão)
devflow.io/en/         → English
devflow.io/es/         → Español
```

### Implementação no Next.js 16

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  i18n: {
    locales: ['pt-BR', 'en', 'es'],
    defaultLocale: 'pt-BR',
    localeDetection: true,
  },
};

export default nextConfig;
```

### Estrutura de Arquivos de Tradução

```
src/
├── locales/
│   ├── pt-BR/
│   │   ├── common.json
│   │   ├── home.json
│   │   ├── features.json
│   │   ├── pricing.json
│   │   ├── seo.json
│   │   └── legal.json
│   ├── en/
│   │   ├── common.json
│   │   ├── home.json
│   │   ├── features.json
│   │   ├── pricing.json
│   │   ├── seo.json
│   │   └── legal.json
│   └── es/
│       ├── common.json
│       ├── home.json
│       ├── features.json
│       ├── pricing.json
│       ├── seo.json
│       └── legal.json
```

### Hreflang Tags (Obrigatório)

```html
<!-- Em TODAS as páginas -->
<link rel="alternate" hreflang="pt-BR" href="https://devflow.io/" />
<link rel="alternate" hreflang="en" href="https://devflow.io/en/" />
<link rel="alternate" hreflang="es" href="https://devflow.io/es/" />
<link rel="alternate" hreflang="x-default" href="https://devflow.io/" />
```

### Implementação Next.js (App Router)

```typescript
// src/app/layout.tsx
import { Metadata } from 'next';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const meta = {
    'pt-BR': {
      title: 'DevFlow — Plataforma de Orquestração para Agências de Desenvolvimento',
      description: 'Transforme sua agência de software em uma fábrica previsível. Briefing inteligente, estimativas automáticas, dashboard do cliente em tempo real e IA integrada.',
    },
    en: {
      title: 'DevFlow — Orchestration Platform for Development Agencies',
      description: 'Transform your software agency into a predictable factory. Smart briefing, automatic estimates, real-time client dashboard, and integrated AI.',
    },
    es: {
      title: 'DevFlow — Plataforma de Orquestación para Agencias de Desarrollo',
      description: 'Transforma tu agencia de software en una fábrica predecible. Briefing inteligente, estimaciones automáticas, dashboard del cliente en tiempo real e IA integrada.',
    },
  };

  const locale = params.locale || 'pt-BR';
  const m = meta[locale as keyof typeof meta] || meta['pt-BR'];

  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: `https://devflow.io/${locale === 'pt-BR' ? '' : locale + '/'}`,
      languages: {
        'pt-BR': 'https://devflow.io/',
        en: 'https://devflow.io/en/',
        es: 'https://devflow.io/es/',
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      locale: locale,
      alternateLocale: ['pt-BR', 'en', 'es'].filter(l => l !== locale),
    },
  };
}
```

---

## Requisito 2 — SEO Técnico + On-Page 100%

### Checklist Técnico Core Web Vitals

| Métrica | Target | Como atingir |
|---------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Server Components, Image optimization (next/image), Font preload |
| **FID** (First Input Delay) | < 100ms | Minimal client JS, code splitting, lazy loading |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Explicit width/height em imagens, font-display: swap |
| **TTFB** (Time to First Byte) | < 200ms | Edge caching (Vercel), ISR para páginas estáticas |
| **INP** (Interaction to Next Paint) | < 200ms | React 19 Server Components, streaming SSR |

### Sitemap Dinâmico

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://devflow.io';
  const locales = ['', '/en', '/es'];
  const pages = [
    '',
    '/features',
    '/pricing',
    '/about',
    '/blog',
    '/contact',
    '/demo',
  ];

  return locales.flatMap(locale =>
    pages.map(page => ({
      url: `${baseUrl}${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '/blog' ? 'weekly' : 'monthly',
      priority: page === '' ? 1.0 : 0.8,
    }))
  );
}
```

### Robots.txt

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/portal/', '/agency/', '/admin/'],
      },
    ],
    sitemap: 'https://devflow.io/sitemap.xml',
  };
}
```

### Heading Hierarchy (Obrigatório por página)

```
H1 — Apenas 1 por página (título principal com keyword primária)
  H2 — Seções principais (keywords secundárias)
    H3 — Subseções (keywords long-tail)
      H4 — Detalhes (se necessário)
```

---

## Meta Tags por Idioma

### Página Principal (Home)

#### 🇧🇷 Português (pt-BR)

```html
<title>DevFlow — Plataforma de Orquestração para Agências de Desenvolvimento de Software</title>
<meta name="description" content="Transforme sua agência de software em uma fábrica previsível e transparente. Briefing inteligente com IA, estimativas automáticas de projeto, Deal Room digital, dashboard do cliente em tempo real e entrega automatizada. Reduza de 5 dias para 5 minutos entre o primeiro contato e a proposta." />
<meta name="keywords" content="plataforma para agências de desenvolvimento, gestão de projetos de software, orquestração de agência, briefing inteligente IA, estimativa automática de projeto, dashboard do cliente, Deal Room digital, proposta automática, agência de software, DevFlow" />

<!-- Open Graph -->
<meta property="og:title" content="DevFlow — Transforme sua agência de software em uma máquina previsível" />
<meta property="og:description" content="Briefing inteligente, estimativas automáticas, Deal Room, dashboard do cliente em tempo real. Da ideia à entrega com total transparência." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://devflow.io/" />
<meta property="og:image" content="https://devflow.io/og/home-pt.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:site_name" content="DevFlow" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="DevFlow — Plataforma de Orquestração para Agências de Software" />
<meta name="twitter:description" content="De 5 dias para 5 minutos: do primeiro contato à proposta final. IA + automação para agências que querem escalar." />
<meta name="twitter:image" content="https://devflow.io/og/home-pt.png" />
```

#### 🇺🇸 English (en)

```html
<title>DevFlow — Orchestration Platform for Software Development Agencies</title>
<meta name="description" content="Transform your software agency into a predictable and transparent factory. AI-powered smart briefing, automatic project estimates, digital Deal Room, real-time client dashboard, and automated delivery. Reduce proposal time from 5 days to 5 minutes." />
<meta name="keywords" content="development agency platform, software project management, agency orchestration, AI smart briefing, automatic project estimation, client dashboard, digital Deal Room, automatic proposal, software agency, DevFlow" />

<!-- Open Graph -->
<meta property="og:title" content="DevFlow — Transform your software agency into a predictable machine" />
<meta property="og:description" content="Smart briefing, automatic estimates, Deal Room, real-time client dashboard. From idea to delivery with total transparency." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://devflow.io/en/" />
<meta property="og:image" content="https://devflow.io/og/home-en.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_US" />
<meta property="og:site_name" content="DevFlow" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="DevFlow — Orchestration Platform for Software Agencies" />
<meta name="twitter:description" content="From 5 days to 5 minutes: first contact to final proposal. AI + automation for agencies ready to scale." />
<meta name="twitter:image" content="https://devflow.io/og/home-en.png" />
```

#### 🇪🇸 Español (es)

```html
<title>DevFlow — Plataforma de Orquestación para Agencias de Desarrollo de Software</title>
<meta name="description" content="Transforma tu agencia de software en una fábrica predecible y transparente. Briefing inteligente con IA, estimaciones automáticas de proyectos, Deal Room digital, dashboard del cliente en tiempo real y entrega automatizada. Reduce de 5 días a 5 minutos entre el primer contacto y la propuesta." />
<meta name="keywords" content="plataforma para agencias de desarrollo, gestión de proyectos de software, orquestación de agencia, briefing inteligente IA, estimación automática de proyecto, dashboard del cliente, Deal Room digital, propuesta automática, agencia de software, DevFlow" />

<!-- Open Graph -->
<meta property="og:title" content="DevFlow — Transforma tu agencia de software en una máquina predecible" />
<meta property="og:description" content="Briefing inteligente, estimaciones automáticas, Deal Room, dashboard del cliente en tiempo real. De la idea a la entrega con total transparencia." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://devflow.io/es/" />
<meta property="og:image" content="https://devflow.io/og/home-es.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="es_ES" />
<meta property="og:site_name" content="DevFlow" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="DevFlow — Plataforma de Orquestación para Agencias de Software" />
<meta name="twitter:description" content="De 5 días a 5 minutos: del primer contacto a la propuesta final. IA + automatización para agencias que quieren escalar." />
<meta name="twitter:image" content="https://devflow.io/og/home-es.png" />
```

---

## Palavras-chave Estratégicas

### 🇧🇷 Português — Keyword Map

#### Keywords Primárias (Volume Alto, Concorrência Média)

| Keyword | Volume Est. | Página Alvo | Intent |
|---------|------------|-------------|--------|
| plataforma para agências de desenvolvimento | 1.2K/mês | Home | Transacional |
| gestão de projetos de software | 3.5K/mês | Features | Informacional |
| sistema para agência de software | 880/mês | Home | Transacional |
| dashboard para clientes de agência | 390/mês | Features/M5 | Transacional |
| proposta automática para projetos | 480/mês | Features/M2 | Transacional |

#### Keywords Secundárias (Volume Médio, Concorrência Baixa)

| Keyword | Volume Est. | Página Alvo | Intent |
|---------|------------|-------------|--------|
| briefing inteligente com IA | 210/mês | Features/M1 | Informacional |
| estimativa automática de projeto de software | 320/mês | Features/M2 | Transacional |
| deal room para agências | 90/mês | Features/M3 | Transacional |
| acompanhamento de projeto em tempo real | 720/mês | Features/M5 | Informacional |
| entrega automatizada de projeto | 180/mês | Features/M6 | Informacional |
| orquestração de agência de desenvolvimento | 60/mês | Home | Informacional |

#### Keywords Long-tail (Volume Baixo, Alta Conversão)

| Keyword | Página Alvo |
|---------|-------------|
| como reduzir tempo de proposta para cliente de software | Blog |
| ferramenta de briefing com inteligência artificial para agência | Features/M1 |
| software para agência de desenvolvimento gerenciar projetos e clientes | Home |
| plataforma SaaS para gestão de agência de software brasileira | Home |
| como automatizar estimativas de projetos de software | Blog |
| dashboard de acompanhamento de projeto para o cliente ver | Features/M5 |
| sistema de assinatura digital integrado com gestão de projetos | Features/M3 |

---

### 🇺🇸 English — Keyword Map

#### Primary Keywords (High Volume, Medium Competition)

| Keyword | Est. Volume | Target Page | Intent |
|---------|------------|-------------|--------|
| development agency platform | 2.1K/mo | Home | Transactional |
| software project management tool | 8.5K/mo | Features | Informational |
| agency project management software | 1.8K/mo | Home | Transactional |
| client dashboard for agencies | 590/mo | Features/M5 | Transactional |
| automatic project estimation tool | 720/mo | Features/M2 | Transactional |

#### Secondary Keywords (Medium Volume, Low Competition)

| Keyword | Est. Volume | Target Page | Intent |
|---------|------------|-------------|--------|
| AI-powered project briefing | 340/mo | Features/M1 | Informational |
| automatic software project estimate | 480/mo | Features/M2 | Transactional |
| digital deal room for agencies | 120/mo | Features/M3 | Transactional |
| real-time project tracking for clients | 1.1K/mo | Features/M5 | Informational |
| automated project delivery handoff | 230/mo | Features/M6 | Informational |
| agency orchestration platform | 80/mo | Home | Informational |

#### Long-tail Keywords (Low Volume, High Conversion)

| Keyword | Target Page |
|---------|-------------|
| how to reduce software proposal turnaround time | Blog |
| AI briefing tool for software development agencies | Features/M1 |
| SaaS platform for managing development agency projects and clients | Home |
| best project management software for dev agencies 2026 | Blog |
| how to automate software project estimates with AI | Blog |
| client-facing project dashboard for development agencies | Features/M5 |
| integrated digital signature with project management for agencies | Features/M3 |

---

### 🇪🇸 Español — Keyword Map

#### Keywords Primarias (Volumen Alto, Competencia Media)

| Keyword | Vol. Est. | Página Objetivo | Intent |
|---------|----------|-----------------|--------|
| plataforma para agencias de desarrollo | 1.5K/mes | Home | Transaccional |
| gestión de proyectos de software | 4.2K/mes | Features | Informacional |
| sistema para agencia de software | 920/mes | Home | Transaccional |
| dashboard para clientes de agencia | 410/mes | Features/M5 | Transaccional |
| propuesta automática para proyectos de software | 380/mes | Features/M2 | Transaccional |

#### Keywords Secundarias (Volumen Medio, Competencia Baja)

| Keyword | Vol. Est. | Página Objetivo | Intent |
|---------|----------|-----------------|--------|
| briefing inteligente con IA | 190/mes | Features/M1 | Informacional |
| estimación automática de proyecto de software | 290/mes | Features/M2 | Transaccional |
| deal room para agencias de desarrollo | 70/mes | Features/M3 | Transaccional |
| seguimiento de proyecto en tiempo real | 850/mes | Features/M5 | Informacional |
| entrega automatizada de proyecto | 160/mes | Features/M6 | Informacional |
| orquestación de agencia de desarrollo | 50/mes | Home | Informacional |

#### Keywords Long-tail (Volumen Bajo, Alta Conversión)

| Keyword | Página Objetivo |
|---------|-----------------|
| cómo reducir el tiempo de propuesta para cliente de software | Blog |
| herramienta de briefing con inteligencia artificial para agencia | Features/M1 |
| software para agencia de desarrollo gestionar proyectos y clientes | Home |
| plataforma SaaS para gestión de agencia de software | Home |
| cómo automatizar estimaciones de proyectos de software | Blog |
| dashboard de seguimiento de proyecto para que el cliente vea | Features/M5 |
| sistema de firma digital integrado con gestión de proyectos | Features/M3 |

---

## Conteúdo Institucional Trilíngue

### Hero Section — Página Principal

#### 🇧🇷 Português

```
H1: Transforme sua agência de software em uma fábrica previsível e transparente

Sub: Do primeiro contato à entrega final — orquestrado por IA.
     Briefing inteligente. Estimativas automáticas. Dashboard do cliente em tempo real.

CTA Primário: Agendar demonstração gratuita
CTA Secundário: Ver como funciona
```

#### 🇺🇸 English

```
H1: Transform your software agency into a predictable and transparent factory

Sub: From first contact to final delivery — orchestrated by AI.
     Smart briefing. Automatic estimates. Real-time client dashboard.

Primary CTA: Schedule a free demo
Secondary CTA: See how it works
```

#### 🇪🇸 Español

```
H1: Transforma tu agencia de software en una fábrica predecible y transparente

Sub: Del primer contacto a la entrega final — orquestado por IA.
     Briefing inteligente. Estimaciones automáticas. Dashboard del cliente en tiempo real.

CTA Primario: Agendar demostración gratuita
CTA Secundario: Ver cómo funciona
```

---

### Proposta de Valor (Value Props)

#### 🇧🇷 Português

| # | Título | Descrição | Módulo |
|---|--------|-----------|--------|
| 1 | **Briefing em 5 minutos, não 5 dias** | Seu cliente grava ou descreve o que precisa. Nossa IA extrai os requisitos, calcula a complexidade e sugere projetos similares já entregues. | M1 |
| 2 | **Propostas que se vendem sozinhas** | Escopo técnico gerado por IA, estimativas calibradas, grafo de dependências interativo e simulador "E se..." para o cliente ajustar em tempo real. | M2 |
| 3 | **Deal Room: negocie sem reuniões** | Proposta interativa com comentários por cláusula, negociação assistida, assinatura digital e pagamento integrado. Tudo rastreado e versionado. | M3 |
| 4 | **Produção no piloto automático** | Integração nativa com GitHub/Jira, sprint planning inteligente, deploy automático para staging do cliente e triagem automática de issues. | M4 |
| 5 | **Seu cliente nunca mais pergunta "como está?"** | Dashboard em tempo real com timeline, kanban público, galeria de entregas e vídeo de status semanal gerado automaticamente por IA. | M5 |
| 6 | **Entrega impecável, sempre** | Documentação auto-gerada, manual do usuário, cofre seguro de credenciais e previsão de manutenção. Pós-venda que gera upsell. | M6 |
| 7 | **Dados que fazem sua agência crescer** | Margem real por projeto, capacity planning com simulação Monte Carlo, detecção de anomalias e previsão de churn de clientes. | M7 |

#### 🇺🇸 English

| # | Title | Description | Module |
|---|-------|-------------|--------|
| 1 | **Briefing in 5 minutes, not 5 days** | Your client records or describes what they need. Our AI extracts requirements, calculates complexity, and suggests similar delivered projects. | M1 |
| 2 | **Proposals that sell themselves** | AI-generated technical scope, calibrated estimates, interactive dependency graph, and "What if..." simulator for clients to adjust in real time. | M2 |
| 3 | **Deal Room: negotiate without meetings** | Interactive proposal with per-clause comments, assisted negotiation, digital signature, and integrated payments. Everything tracked and versioned. | M3 |
| 4 | **Production on autopilot** | Native GitHub/Jira integration, smart sprint planning, auto-deploy to client staging, and automatic issue triage. | M4 |
| 5 | **Your client never asks "how's it going?" again** | Real-time dashboard with timeline, public kanban, delivery gallery, and weekly AI-generated video status updates. | M5 |
| 6 | **Flawless delivery, every time** | Auto-generated documentation, user manual, secure credential vault, and maintenance prediction. Post-sale that drives upsell. | M6 |
| 7 | **Data that grows your agency** | Real margin per project, Monte Carlo capacity planning, anomaly detection, and client churn prediction. | M7 |

#### 🇪🇸 Español

| # | Título | Descripción | Módulo |
|---|--------|-------------|--------|
| 1 | **Briefing en 5 minutos, no 5 días** | Tu cliente graba o describe lo que necesita. Nuestra IA extrae los requisitos, calcula la complejidad y sugiere proyectos similares ya entregados. | M1 |
| 2 | **Propuestas que se venden solas** | Alcance técnico generado por IA, estimaciones calibradas, grafo de dependencias interactivo y simulador "¿Y si...?" para que el cliente ajuste en tiempo real. | M2 |
| 3 | **Deal Room: negocia sin reuniones** | Propuesta interactiva con comentarios por cláusula, negociación asistida, firma digital y pago integrado. Todo rastreado y versionado. | M3 |
| 4 | **Producción en piloto automático** | Integración nativa con GitHub/Jira, planificación inteligente de sprints, deploy automático al staging del cliente y triaje automático de issues. | M4 |
| 5 | **Tu cliente nunca más pregunta "¿cómo va?"** | Dashboard en tiempo real con línea de tiempo, kanban público, galería de entregas y video de estado semanal generado automáticamente por IA. | M5 |
| 6 | **Entrega impecable, siempre** | Documentación autogenerada, manual del usuario, bóveda segura de credenciales y predicción de mantenimiento. Posventa que genera upsell. | M6 |
| 7 | **Datos que hacen crecer tu agencia** | Margen real por proyecto, planificación de capacidad con simulación Monte Carlo, detección de anomalías y predicción de churn de clientes. | M7 |

---

### Seção "Como Funciona" (How It Works)

#### 🇧🇷 Português

```
H2: Como funciona — do briefing à entrega em 6 passos

Passo 1: O cliente descreve o projeto
→ Wizard inteligente ou gravação de voz. IA estrutura tudo automaticamente.

Passo 2: Escopo e estimativa gerados por IA
→ Funcionalidades, horas, cronograma e proposta comercial em minutos.

Passo 3: Deal Room — negocie e assine digitalmente
→ Cliente comenta, ajusta o escopo, assina e paga. Tudo num só lugar.

Passo 4: Produção integrada com seu workflow
→ Projeto criado automaticamente no GitHub/Jira. Sprints planejados por IA.

Passo 5: Cliente acompanha tudo em tempo real
→ Dashboard com progresso, entregas, vídeos semanais e aprovação de features.

Passo 6: Entrega automática + pós-venda inteligente
→ Documentação, credenciais seguras, analytics de uso e previsão de manutenção.
```

#### 🇺🇸 English

```
H2: How it works — from briefing to delivery in 6 steps

Step 1: The client describes the project
→ Smart wizard or voice recording. AI structures everything automatically.

Step 2: Scope and estimate generated by AI
→ Features, hours, timeline, and commercial proposal in minutes.

Step 3: Deal Room — negotiate and sign digitally
→ Client comments, adjusts scope, signs, and pays. All in one place.

Step 4: Production integrated with your workflow
→ Project automatically created in GitHub/Jira. AI-planned sprints.

Step 5: Client follows everything in real time
→ Dashboard with progress, deliveries, weekly videos, and feature approval.

Step 6: Automatic delivery + smart post-sale
→ Documentation, secure credentials, usage analytics, and maintenance prediction.
```

#### 🇪🇸 Español

```
H2: Cómo funciona — del briefing a la entrega en 6 pasos

Paso 1: El cliente describe el proyecto
→ Wizard inteligente o grabación de voz. La IA estructura todo automáticamente.

Paso 2: Alcance y estimación generados por IA
→ Funcionalidades, horas, cronograma y propuesta comercial en minutos.

Paso 3: Deal Room — negocia y firma digitalmente
→ El cliente comenta, ajusta el alcance, firma y paga. Todo en un solo lugar.

Paso 4: Producción integrada con tu flujo de trabajo
→ Proyecto creado automáticamente en GitHub/Jira. Sprints planificados por IA.

Paso 5: El cliente sigue todo en tiempo real
→ Dashboard con progreso, entregas, videos semanales y aprobación de features.

Paso 6: Entrega automática + posventa inteligente
→ Documentación, credenciales seguras, analytics de uso y predicción de mantenimiento.
```

---

### Seção Preços (Pricing)

#### 🇧🇷 Português

```
H2: Planos que acompanham o crescimento da sua agência

Starter — R$197/mês
→ Ideal para agências pequenas com até 5 projetos/ano
→ Inclui: Briefing inteligente + Deal Room + Timeline do cliente

Growth — R$497/mês
→ Para agências em crescimento com até 20 projetos/ano
→ Inclui: Todos os módulos + 5 usuários internos + integrações

Agency — R$997/mês
→ Para agências grandes com projetos simultâneos
→ Inclui: Multi-marca + API completa + relatórios avançados + IA ilimitada

Enterprise — Sob consulta
→ Para operações com 50+ desenvolvedores
→ Inclui: On-premise, customizações, SLA dedicado e treinamento

CTA: Comece grátis por 14 dias — sem cartão de crédito
```

#### 🇺🇸 English

```
H2: Plans that grow with your agency

Starter — $39/mo
→ Ideal for small agencies with up to 5 projects/year
→ Includes: Smart briefing + Deal Room + Client timeline

Growth — $99/mo
→ For growing agencies with up to 20 projects/year
→ Includes: All modules + 5 internal users + integrations

Agency — $199/mo
→ For large agencies with simultaneous projects
→ Includes: Multi-brand + full API + advanced reports + unlimited AI

Enterprise — Contact us
→ For operations with 50+ developers
→ Includes: On-premise, customizations, dedicated SLA, and training

CTA: Start free for 14 days — no credit card required
```

#### 🇪🇸 Español

```
H2: Planes que acompañan el crecimiento de tu agencia

Starter — $39/mes
→ Ideal para agencias pequeñas con hasta 5 proyectos/año
→ Incluye: Briefing inteligente + Deal Room + Timeline del cliente

Growth — $99/mes
→ Para agencias en crecimiento con hasta 20 proyectos/año
→ Incluye: Todos los módulos + 5 usuarios internos + integraciones

Agency — $199/mes
→ Para agencias grandes con proyectos simultáneos
→ Incluye: Multi-marca + API completa + reportes avanzados + IA ilimitada

Enterprise — Contáctenos
→ Para operaciones con 50+ desarrolladores
→ Incluye: On-premise, personalizaciones, SLA dedicado y capacitación

CTA: Comienza gratis por 14 días — sin tarjeta de crédito
```

---

### FAQ (Perguntas Frequentes) — SEO Rich Snippets

#### 🇧🇷 Português

```
H2: Perguntas frequentes sobre o DevFlow

P: O que é o DevFlow?
R: O DevFlow é uma plataforma de orquestração que conecta todo o ciclo de vida de projetos de software — do briefing à entrega — numa única ferramenta com inteligência artificial, dando total visibilidade para o cliente e previsibilidade para a agência.

P: Preciso mudar minhas ferramentas atuais (Jira, GitHub)?
R: Não. O DevFlow integra com GitHub, GitLab, Jira e Linear. Você continua usando suas ferramentas favoritas e o DevFlow sincroniza tudo automaticamente, adicionando a camada de inteligência e o portal do cliente.

P: Como funciona o briefing inteligente?
R: O cliente pode preencher um questionário dinâmico ou simplesmente gravar um áudio descrevendo o que precisa. A IA transcreve, extrai os requisitos estruturados, calcula a complexidade e sugere projetos similares — tudo em menos de 5 minutos.

P: O DevFlow substitui meu PM?
R: Não. O DevFlow potencializa o PM ao automatizar tarefas repetitivas (status updates, estimativas, documentação) e dar dados precisos para decisões melhores. O PM continua sendo essencial para a relação humana com o cliente e decisões estratégicas.

P: Meus dados estão seguros?
R: Sim. Usamos criptografia AES-256-GCM para dados sensíveis, autenticação multi-fator, isolamento de dados por agência (multi-tenant), e seguimos as diretrizes da LGPD e GDPR. Credenciais de projeto são armazenadas em cofre digital com acesso temporário.

P: Quanto tempo leva para começar a usar?
R: Menos de 30 minutos. Crie sua conta, conecte suas ferramentas (GitHub/Jira) e convide seu primeiro cliente. O onboarding guiado configura tudo passo a passo.

P: O DevFlow funciona para freelancers ou só para agências?
R: Funciona para ambos. Freelancers usam o plano Starter para profissionalizar sua operação. Agências usam os planos Growth, Agency ou Enterprise conforme o volume de projetos.
```

#### 🇺🇸 English

```
H2: Frequently asked questions about DevFlow

Q: What is DevFlow?
A: DevFlow is an orchestration platform that connects the entire software project lifecycle — from briefing to delivery — in a single AI-powered tool, providing full visibility for the client and predictability for the agency.

Q: Do I need to change my current tools (Jira, GitHub)?
A: No. DevFlow integrates with GitHub, GitLab, Jira, and Linear. You keep using your favorite tools and DevFlow syncs everything automatically, adding the intelligence layer and client portal.

Q: How does smart briefing work?
A: The client can fill out a dynamic questionnaire or simply record an audio describing what they need. The AI transcribes, extracts structured requirements, calculates complexity, and suggests similar projects — all in under 5 minutes.

Q: Does DevFlow replace my PM?
A: No. DevFlow empowers PMs by automating repetitive tasks (status updates, estimates, documentation) and providing accurate data for better decisions. The PM remains essential for the human relationship with the client and strategic decisions.

Q: Is my data secure?
A: Yes. We use AES-256-GCM encryption for sensitive data, multi-factor authentication, per-agency data isolation (multi-tenant), and comply with GDPR guidelines. Project credentials are stored in a digital vault with time-limited access.

Q: How long does it take to get started?
A: Less than 30 minutes. Create your account, connect your tools (GitHub/Jira), and invite your first client. The guided onboarding sets everything up step by step.

Q: Does DevFlow work for freelancers or only agencies?
A: It works for both. Freelancers use the Starter plan to professionalize their operation. Agencies use Growth, Agency, or Enterprise plans based on project volume.
```

#### 🇪🇸 Español

```
H2: Preguntas frecuentes sobre DevFlow

P: ¿Qué es DevFlow?
R: DevFlow es una plataforma de orquestación que conecta todo el ciclo de vida de proyectos de software — del briefing a la entrega — en una sola herramienta con inteligencia artificial, dando total visibilidad al cliente y previsibilidad a la agencia.

P: ¿Necesito cambiar mis herramientas actuales (Jira, GitHub)?
R: No. DevFlow se integra con GitHub, GitLab, Jira y Linear. Sigues usando tus herramientas favoritas y DevFlow sincroniza todo automáticamente, añadiendo la capa de inteligencia y el portal del cliente.

P: ¿Cómo funciona el briefing inteligente?
R: El cliente puede completar un cuestionario dinámico o simplemente grabar un audio describiendo lo que necesita. La IA transcribe, extrae los requisitos estructurados, calcula la complejidad y sugiere proyectos similares — todo en menos de 5 minutos.

P: ¿DevFlow reemplaza a mi PM?
R: No. DevFlow potencia al PM automatizando tareas repetitivas (actualizaciones de estado, estimaciones, documentación) y proporcionando datos precisos para mejores decisiones. El PM sigue siendo esencial para la relación humana con el cliente y las decisiones estratégicas.

P: ¿Mis datos están seguros?
R: Sí. Usamos cifrado AES-256-GCM para datos sensibles, autenticación multifactor, aislamiento de datos por agencia (multi-tenant) y cumplimos con las directrices del GDPR. Las credenciales de proyecto se almacenan en una bóveda digital con acceso temporal.

P: ¿Cuánto tiempo lleva empezar a usar?
R: Menos de 30 minutos. Crea tu cuenta, conecta tus herramientas (GitHub/Jira) e invita a tu primer cliente. El onboarding guiado configura todo paso a paso.

P: ¿DevFlow funciona para freelancers o solo para agencias?
R: Funciona para ambos. Los freelancers usan el plan Starter para profesionalizar su operación. Las agencias usan los planes Growth, Agency o Enterprise según el volumen de proyectos.
```

---

## Schema.org Structured Data

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DevFlow",
  "alternateName": "CodeBrain",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Plataforma de orquestração para agências de desenvolvimento de software com IA integrada.",
  "url": "https://devflow.io",
  "inLanguage": ["pt-BR", "en", "es"],
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter",
      "price": "197",
      "priceCurrency": "BRL",
      "billingIncrement": "P1M",
      "description": "Para agências pequenas com até 5 projetos/ano"
    },
    {
      "@type": "Offer",
      "name": "Growth",
      "price": "497",
      "priceCurrency": "BRL",
      "billingIncrement": "P1M",
      "description": "Para agências médias com até 20 projetos/ano"
    },
    {
      "@type": "Offer",
      "name": "Agency",
      "price": "997",
      "priceCurrency": "BRL",
      "billingIncrement": "P1M",
      "description": "Para agências grandes com projetos simultâneos"
    }
  ],
  "featureList": [
    "AI-powered smart briefing",
    "Automatic project estimation",
    "Digital Deal Room with e-signature",
    "Real-time client dashboard",
    "GitHub/Jira integration",
    "Auto-generated documentation",
    "Weekly AI video status updates",
    "Client churn prediction",
    "Monte Carlo capacity planning"
  ],
  "screenshot": "https://devflow.io/screenshots/dashboard.png",
  "softwareVersion": "1.0",
  "creator": {
    "@type": "Organization",
    "name": "Quantum Technology",
    "url": "https://devflow.io"
  }
}
```

### FAQ Schema (Rich Snippets Google)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "O que é o DevFlow?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O DevFlow é uma plataforma de orquestração que conecta todo o ciclo de vida de projetos de software — do briefing à entrega — numa única ferramenta com inteligência artificial, dando total visibilidade para o cliente e previsibilidade para a agência."
      }
    },
    {
      "@type": "Question",
      "name": "What is DevFlow?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DevFlow is an orchestration platform that connects the entire software project lifecycle — from briefing to delivery — in a single AI-powered tool, providing full visibility for the client and predictability for the agency."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es DevFlow?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DevFlow es una plataforma de orquestación que conecta todo el ciclo de vida de proyectos de software — del briefing a la entrega — en una sola herramienta con inteligencia artificial, dando total visibilidad al cliente y previsibilidad a la agencia."
      }
    },
    {
      "@type": "Question",
      "name": "Preciso mudar minhas ferramentas atuais?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Não. O DevFlow integra com GitHub, GitLab, Jira e Linear. Você continua usando suas ferramentas favoritas e o DevFlow sincroniza tudo automaticamente."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to change my current tools?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. DevFlow integrates with GitHub, GitLab, Jira, and Linear. You keep using your favorite tools and DevFlow syncs everything automatically."
      }
    },
    {
      "@type": "Question",
      "name": "¿Necesito cambiar mis herramientas actuales?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. DevFlow se integra con GitHub, GitLab, Jira y Linear. Sigues usando tus herramientas favoritas y DevFlow sincroniza todo automáticamente."
      }
    },
    {
      "@type": "Question",
      "name": "Meus dados estão seguros?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim. Usamos criptografia AES-256-GCM, autenticação multi-fator, isolamento multi-tenant e seguimos LGPD/GDPR. Credenciais são armazenadas em cofre digital com acesso temporário."
      }
    },
    {
      "@type": "Question",
      "name": "Is my data secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. We use AES-256-GCM encryption, multi-factor authentication, multi-tenant isolation, and comply with GDPR. Credentials are stored in a digital vault with time-limited access."
      }
    },
    {
      "@type": "Question",
      "name": "¿Mis datos están seguros?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí. Usamos cifrado AES-256-GCM, autenticación multifactor, aislamiento multi-tenant y cumplimos con GDPR. Las credenciales se almacenan en bóveda digital con acceso temporal."
      }
    }
  ]
}
```

### Breadcrumb Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://devflow.io/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Features",
      "item": "https://devflow.io/features/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Pricing",
      "item": "https://devflow.io/pricing/"
    }
  ]
}
```

---

## Checklist SEO Completo

### Técnico

- [ ] `next/image` com width/height explícitos em todas as imagens
- [ ] `font-display: swap` em todas as fontes (Geist Sans/Mono)
- [ ] Server Components por padrão (client somente quando necessário)
- [ ] Sitemap dinâmico (`/sitemap.xml`) com todas as páginas × idiomas
- [ ] Robots.txt bloqueando `/api/`, `/portal/`, `/agency/`, `/admin/`
- [ ] Hreflang tags em todas as páginas (PT, EN, ES + x-default)
- [ ] Canonical URL em todas as páginas
- [ ] HTTPS obrigatório + HSTS header
- [ ] Compressão gzip/brotli ativada
- [ ] Lazy loading em imagens abaixo do fold
- [ ] Preload de fontes e CSS crítico
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1, INP < 200ms
- [ ] Structured data (JSON-LD) em todas as páginas
- [ ] 404 page customizada com links úteis
- [ ] Redirect 301 de URLs com/sem trailing slash (consistência)

### On-Page (por página)

- [ ] H1 único com keyword primária
- [ ] Meta title ≤ 60 caracteres com keyword
- [ ] Meta description ≤ 155 caracteres com keyword + CTA
- [ ] URL slug curto, descritivo e com keyword
- [ ] Heading hierarchy lógica (H1 > H2 > H3)
- [ ] Alt text descritivo em todas as imagens
- [ ] Internal linking entre páginas relacionadas
- [ ] External links com `rel="noopener noreferrer"` (já implementado)
- [ ] Conteúdo mínimo de 300 palavras por página
- [ ] Keyword density 1–2% (natural, sem keyword stuffing)
- [ ] Featured snippet format (listas, tabelas, FAQ)
- [ ] Schema.org FAQ markup nas páginas com perguntas

### Off-Page (estratégia)

- [ ] Google Search Console configurado
- [ ] Google Analytics 4 / Plausible configurado
- [ ] Perfil Google Business (se aplicável)
- [ ] Publicação semanal no blog (PT + EN + ES)
- [ ] Link building: guest posts em blogs de agências
- [ ] Social sharing meta tags (OG + Twitter Cards) validadas
- [ ] Bing Webmaster Tools configurado

### Conteúdo Blog (primeiros 12 artigos)

| # | Tema (PT) | Theme (EN) | Tema (ES) | Keyword Target |
|---|-----------|------------|-----------|----------------|
| 1 | Como reduzir o tempo de proposta de 5 dias para 5 minutos | How to reduce proposal turnaround from 5 days to 5 minutes | Cómo reducir el tiempo de propuesta de 5 días a 5 minutos | automatic project estimation |
| 2 | Briefing inteligente: o futuro da captação de requisitos | Smart briefing: the future of requirements gathering | Briefing inteligente: el futuro de la captación de requisitos | AI briefing tool |
| 3 | Por que seu cliente precisa de um dashboard em tempo real | Why your client needs a real-time dashboard | Por qué tu cliente necesita un dashboard en tiempo real | client project dashboard |
| 4 | Deal Room digital: como fechar projetos sem reuniões longas | Digital Deal Room: how to close projects without long meetings | Deal Room digital: cómo cerrar proyectos sin reuniones largas | digital deal room agencies |
| 5 | O verdadeiro custo de não automatizar sua agência de software | The real cost of not automating your software agency | El verdadero costo de no automatizar tu agencia de software | agency automation platform |
| 6 | Estimativas de software: por que todo mundo erra (e como acertar) | Software estimates: why everyone gets it wrong (and how to fix it) | Estimaciones de software: por qué todos se equivocan (y cómo acertar) | software project estimation |
| 7 | Como gerar documentação técnica automaticamente com IA | How to auto-generate technical documentation with AI | Cómo generar documentación técnica automáticamente con IA | auto documentation AI |
| 8 | NPS por milestone: medindo satisfação do cliente continuamente | NPS per milestone: measuring client satisfaction continuously | NPS por hito: midiendo satisfacción del cliente continuamente | client satisfaction metrics |
| 9 | Previsão de churn: como saber se o cliente vai voltar | Churn prediction: how to know if the client will come back | Predicción de churn: cómo saber si el cliente volverá | client churn prediction |
| 10 | Capacity planning para agências: quando contratar o próximo dev | Capacity planning for agencies: when to hire the next dev | Planificación de capacidad para agencias: cuándo contratar al próximo dev | agency capacity planning |
| 11 | Video status semanal automático: como surpreender seu cliente | Auto weekly video status: how to wow your client | Video de estado semanal automático: cómo sorprender a tu cliente | automated client updates |
| 12 | Como calcular a margem real de cada projeto da sua agência | How to calculate the real margin of every agency project | Cómo calcular el margen real de cada proyecto de tu agencia | project profitability analysis |

---

## Performance SEO — Implementação Técnica no Next.js 16

### Componente SEO Head Reutilizável

```typescript
// src/lib/seo.ts
import { Metadata } from 'next';

type Locale = 'pt-BR' | 'en' | 'es';

interface SEOParams {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noindex?: boolean;
}

const BASE_URL = 'https://devflow.io';

export function generatePageSEO({
  locale,
  title,
  description,
  path,
  ogImage,
  noindex = false,
}: SEOParams): Metadata {
  const localePath = locale === 'pt-BR' ? '' : `/${locale}`;
  const url = `${BASE_URL}${localePath}${path}`;
  const image = ogImage || `${BASE_URL}/og/default-${locale}.png`;

  return {
    title: `${title} | DevFlow`,
    description,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: url,
      languages: {
        'pt-BR': `${BASE_URL}${path}`,
        en: `${BASE_URL}/en${path}`,
        es: `${BASE_URL}/es${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'DevFlow',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: locale.replace('-', '_'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
```

### JSON-LD Injection Component

```tsx
// src/components/seo/json-ld.tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### Uso por Página

```tsx
// src/app/[locale]/page.tsx
import { generatePageSEO } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';

export function generateMetadata({ params }: { params: { locale: string } }) {
  const seo = {
    'pt-BR': {
      title: 'Plataforma de Orquestração para Agências de Desenvolvimento',
      description: 'Transforme sua agência de software em uma fábrica previsível. Briefing inteligente, estimativas automáticas, dashboard do cliente em tempo real.',
    },
    en: {
      title: 'Orchestration Platform for Development Agencies',
      description: 'Transform your software agency into a predictable factory. Smart briefing, automatic estimates, real-time client dashboard.',
    },
    es: {
      title: 'Plataforma de Orquestación para Agencias de Desarrollo',
      description: 'Transforma tu agencia de software en una fábrica predecible. Briefing inteligente, estimaciones automáticas, dashboard del cliente en tiempo real.',
    },
  };

  const locale = (params.locale || 'pt-BR') as 'pt-BR' | 'en' | 'es';
  const content = seo[locale] || seo['pt-BR'];

  return generatePageSEO({
    locale,
    title: content.title,
    description: content.description,
    path: '/',
  });
}
```

---

## Resumo dos 2 Requisitos

### Requisito 1: Internacionalização (i18n)

| Aspecto | Implementação |
|---------|--------------|
| **Idiomas** | Português (pt-BR), English (en), Español (es) |
| **Routing** | Subpath: `/`, `/en/`, `/es/` |
| **Detecção** | `Accept-Language` header + cookie de preferência |
| **Hreflang** | Em todas as páginas, incluindo `x-default` |
| **Conteúdo** | 100% traduzido: UI, meta tags, FAQ, blog, legal |
| **Preços** | BRL para PT, USD para EN/ES |
| **Data/Hora** | Formatação via `Intl.DateTimeFormat` por locale |
| **Framework** | next-intl ou i18next com App Router |

### Requisito 2: SEO 100%

| Aspecto | Implementação |
|---------|--------------|
| **Core Web Vitals** | LCP < 2.5s, FID < 100ms, CLS < 0.1, INP < 200ms |
| **Meta Tags** | Title, description, OG, Twitter Cards — por página × idioma |
| **Structured Data** | Schema.org JSON-LD: SoftwareApplication, FAQPage, BreadcrumbList |
| **Sitemap** | Dinâmico via Next.js, todas as páginas × 3 idiomas |
| **Robots.txt** | Permite público, bloqueia áreas autenticadas |
| **Heading Hierarchy** | H1 único com keyword, H2–H4 lógicos |
| **Keywords** | Mapeamento completo: primárias, secundárias, long-tail × 3 idiomas |
| **Blog** | 12 artigos iniciais trilíngues com keywords de alta conversão |
| **Rich Snippets** | FAQ schema em todas as páginas com perguntas |
| **Performance** | Server Components, image optimization, font preload, lazy loading |
| **Monitoramento** | Google Search Console + GA4/Plausible + Bing Webmaster |
