# Project DevFlow — Análise Completa & Recursos Inovadores

> **Sistema:** DevFlow / CodeBrain
> **Conceito:** IA como "Cérebro de Produção" — orquestra, automatiza e otimiza cada etapa do ciclo de vida de um projeto de software, desde a ideação até a entrega e manutenção, com total visibilidade para o cliente.
> **Repositório:** quantum-technology
> **Data da análise:** 2026-03-06

---

## Estado Atual do Repositório

| Aspecto | Detalhe |
|---------|---------|
| Stack existente | Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 |
| Funcionalidades | Landing page premium + Formulário de lead + API `/api/lead` + Integração n8n |
| Infraestrutura | Workflow n8n para captura de lead, webhook configurável |
| Problema pendente | Mapeamento de campos no nó IF do n8n (validação retornando 400) |

**Diagnóstico:** O projeto atual é o **embrião do Módulo 1 (Input Hub)** — já captura nome, e-mail, empresa, serviço desejado, orçamento e mensagem. A evolução natural é transformar esse formulário básico no Wizard de Descoberta inteligente e construir os demais módulos sobre essa base.

---

## Visão Geral — Transformação Proposta

| Dimensão | Agência Tradicional | DevFlow (proposto) |
|-----------|---------------------|--------------------|
| Solicitação | E-mail, WhatsApp, reunião perdida | Portal unificado com formulário inteligente |
| Análise/Orçamento | Planilha manual, semanas de idas e vindas | Estimador automático + proposta gerada por IA |
| Aprovação | Contrato assinado e esquecido | Deal Room com cláusulas interativas e assinatura digital |
| Acompanhamento | Cliente pergunta no WhatsApp "como está?" | Dashboard em tempo real com milestones + burndown |
| Entrega | Link por e-mail, documentação esquecida | Portal do projeto com documentação + handoff automatizado |

---

## Módulo 1 — Input Hub (DNA do Cliente e do Projeto)

**Função:** Capturar a essência da necessidade do cliente e estruturar os requisitos iniciais.

### Escopo original (adaptado)

- **Wizard de Descoberta:** Questionário dinâmico multi-etapa que extrai:
  - Tipo de projeto (site, app, sistema, integração)
  - Dores do negócio (o que o cliente quer resolver)
  - Público-alvo da solução
  - Funcionalidades desejadas (com pesos por prioridade)
  - Tecnologias preferenciais (se houver)
  - Orçamento estimado e prazo desejado
- **Repositório de Ativos:** Upload de briefings, wireframes, referências visuais, identidade da marca
- **Analisador de Concorrência (IA):** Varredura de soluções similares no mercado para sugerir diferenciais competitivos

### Recursos inovadores

#### 1.1 Briefing Intelligence
Ao invés de questionário extenso, o sistema analisa uma **gravação ou descrição livre** do cliente e extrai automaticamente os requisitos estruturados.

**Implementação:** Whisper (transcrição) + LLM → extração de entidades (funcionalidades, prazos, dores) → pré-preenche o wizard.

**Detalhamento técnico:**
- Endpoint `POST /api/briefing/audio` recebe arquivo de áudio (até 25MB, mp3/wav/webm)
- Whisper Large v3 via OpenAI API ou self-hosted (Faster Whisper no backend Python)
- Pipeline: áudio → transcrição → prompt estruturado ao LLM → JSON com campos do wizard
- Fallback: se a transcrição for ambígua, o sistema marca campos como "a confirmar" e pede revisão

#### 1.2 Complexity Score Preview
Baseado nas respostas, o sistema gera um **score preliminar de complexidade (1-10)** e uma estimativa de range de horas, para alinhar expectativas antes da análise técnica.

**Implementação:** Modelo de regressão treinado com histórico de projetos da agência → features: número de funcionalidades, integrações, plataformas, etc.

**Detalhamento técnico:**
- Modelo XGBoost treinado com dataset interno (mínimo 50 projetos históricos para bootstrap)
- Features: `n_funcionalidades`, `n_integrações`, `n_plataformas`, `tipo_projeto`, `tem_auth`, `tem_pagamento`, `tem_api_externa`
- Output: `complexity_score` (1–10), `hours_range_min`, `hours_range_max`, `confidence`
- Fallback inicial (antes de ter dados): tabela de lookup baseada em regras heurísticas

#### 1.3 Similar Project Library
Cliente vê **projetos similares** já entregues pela agência (anônimos) como referência do que é possível.

**Implementação:** Embeddings do briefing vs. projetos anteriores → busca por similaridade semântica → exibe cards com escopo, prazo, tecnologias.

**Detalhamento técnico:**
- Embeddings via `text-embedding-3-small` (OpenAI) ou `nomic-embed-text` (self-hosted)
- Armazenamento em pgvector (PostgreSQL)
- Busca por cosine similarity, top-3 resultados
- Cards exibem: tipo, escopo resumido, prazo real, stack, complexidade (anônimo)

### ⚡ Melhoria adicional: Technical Feasibility Check
Integração com APIs de terceiros (Stripe, Mercado Pago, etc.) para verificar se a stack escolhida tem limitações conhecidas para os requisitos do cliente.

**Exemplo:** "Você quer marketplace com pagamento split? A Stripe permite, mas tem custo X por transação."

**Implementação:**
- Base de conhecimento interna (JSON/YAML) com limitações conhecidas por provedor
- LLM cruza requisitos do briefing com a base → gera alertas contextualizados
- Atualizável manualmente pela equipe técnica ou via scraping periódico de changelogs

### ⚡ Melhoria adicional 2: Client Portal Onboarding
Após o wizard, o cliente recebe acesso a um portal pessoal onde pode:
- Revisar e editar o briefing a qualquer momento
- Fazer upload adicional de assets (logo, paletas, wireframes)
- Ver o status do briefing (em análise / proposta gerada / em negociação)
- Receber notificação por e-mail a cada mudança de status

**Implementação:** Autenticação via magic link (sem senha) → portal com SSR protegido → notificações via Resend/Brevo.

---

## Módulo 2 — Cérebro de Arquitetura (Especificação e Estimativa)

**Função:** Transformar briefing em especificação técnica, estimativas e proposta comercial.

### Escopo original (adaptado)

- **Gerador de Escopo Técnico (IA):** A partir do briefing, gera:
  - Lista de funcionalidades detalhadas
  - User stories / épicos
  - Telas principais (descrição, não visual)
  - Integrações necessárias
  - Regras de negócio críticas
- **Estimador Automático:** Com base em histórico da agência, calcula:
  - Horas por funcionalidade (front, back, QA, PM)
  - Custo total (com diferentes níveis de equipe: júnior, pleno, sênior)
  - Prazo estimado (otimista, realista, pessimista)
- **Gerador de Proposta:** Cria documento comercial com escopo, cronograma, valor e condições de pagamento

### Recursos inovadores

#### 2.1 Technical Dependency Graph
Gera um **grafo de dependências** entre funcionalidades, identificando o que precisa vir primeiro e alertando se o cliente quer priorizar algo que depende de outra feature.

**Implementação:** LLM extrai dependências da especificação → constrói grafo (NetworkX) → visualização interativa para o cliente aprovar a ordem.

**Detalhamento técnico:**
- Backend Python: LLM gera JSON de dependências `{feature_id, depends_on: []}` → NetworkX valida DAG
- Frontend: React Flow para visualização interativa do grafo de dependências
- Detecção automática de ciclos e alertas de inconsistência
- Cliente pode arrastar nós e o sistema recalcula cronograma em tempo real

#### 2.2 "What-If" Estimator
Cliente pode **ajustar variáveis em tempo real** e ver impacto:
- "E se eu trocar app nativo por híbrido?" → horas caem 20%
- "E se eu adiar o módulo de relatórios para V2?" → entrega antecipa 15 dias

**Implementação:** Modelo paramétrico onde cada variável tem coeficientes de impacto pré-definidos (base histórica).

**Detalhamento técnico:**
- UI com sliders/toggles para cada variável modificável
- Cálculo no frontend (coeficientes servidos via API) → feedback instantâneo
- Coeficientes calibrados periodicamente via M7 (dados reais vs. estimativas)
- Exporta comparativo PDF: "Cenário A vs. Cenário B"

#### 2.3 Risk Assessment Automático
Identifica **riscos técnicos** no escopo e sugere estratégias de mitigação:
- "Integração com sistema legado do cliente → risco alto. Sugerimos POC prévia"
- "Funcionalidade de pagamento → risco médio. Incluir testes de segurança dedicados"

**Implementação:** Regras baseadas em palavras-chave + LLM para contextualização.

**Detalhamento técnico:**
- Banco de regras categorizadas: `integracao_legada`, `pagamento`, `auth_custom`, `alta_concorrencia`, etc.
- Cada regra tem: gatilho (keywords/padrões), nível de risco base, mitigações sugeridas
- LLM contextualiza: ajusta o risco com base no contexto específico do projeto
- Output: tabela de riscos com semáforo (verde/amarelo/vermelho) + plano de mitigação

### ⚡ Melhoria adicional: Benchmarking de Preço
Comparar o orçamento gerado com **média de mercado** para projetos similares (base anônima de outros projetos da agência ou APIs de benchmarking), dando confiança ao cliente de que o preço é justo.

**Implementação:**
- Base interna: média de custo/hora por tipo de projeto, porte e complexidade
- Exibe ao cliente: "Seu projeto está X% abaixo/acima da média para projetos similares"
- Para a agência: indicador de margem estimada vs. benchmark

### ⚡ Melhoria adicional 2: Auto-Wireframe Preview
Após gerar as telas (descrição), o sistema cria **wireframes lo-fi automáticos** usando templates componíveis, para o cliente visualizar o fluxo antes de aprovar.

**Implementação:**
- Biblioteca de componentes wireframe (header, sidebar, form, table, card, modal, etc.)
- LLM mapeia descrição de tela → composição de componentes → render SVG/HTML
- Cliente comenta diretamente no wireframe (tipo Figma simplificado)
- Reduz retrabalho: cliente entende o escopo visualmente, não só textualmente

---

## Módulo 3 — Deal Room (Negociação e Aprovação)

**Função:** Espaço onde cliente e agência interagem para aprovar escopo, negociar e assinar.

### Escopo original (adaptado)

- **Proposta Interativa:** Documento vivo onde cada seção pode ser comentada
- **Negociação Assistida:** Cliente sugere alterações, sistema recalcula impacto automaticamente
- **Assinatura Digital:** Integração com contratos eletrônicos (ZapSign, DocuSign)
- **Histórico de Versões:** Cada alteração na proposta é versionada e rastreada

### Recursos inovadores

#### 3.1 Clause Intelligence
Para contratos recorrentes, o sistema aprende quais cláusulas geram mais perguntas ou negociação e sugere melhorias na redação.

**Implementação:** Análise de comentários dos clientes no Deal Room → identificação de padrões → sugestão de rewrite via LLM.

**Detalhamento técnico:**
- Tracking de tempo gasto por cláusula + número de comentários + rate de alteração
- Após N contratos, o sistema agrupa cláusulas problemáticas e sugere reescrita
- A/B test automático: nova redação vs. anterior → mede taxa de aprovação direta
- Dashboard para o jurídico/comercial da agência acompanhar métricas de cláusulas

#### 3.2 Approval Workflow com Gatilhos
Quando o cliente aprova, automaticamente:
- Cria o projeto no Jira/GitHub (via API)
- Abre tarefa para o time comercial dar entrada
- Envia e-mail de boas-vindas com próximos passos
- Agenda kickoff no calendário

**Implementação:** Webhooks + automações via n8n interno ou BullMQ jobs.

**Detalhamento técnico:**
- Estado da proposta: `draft → review → negotiation → approved → active`
- Cada transição dispara jobs no BullMQ:
  - `approved` → `CreateJiraProjectJob`, `SendWelcomeEmailJob`, `ScheduleKickoffJob`
- Integração bidirecional: se o projeto for cancelado no Jira, atualiza status no DevFlow
- Audit log completo de cada mudança de estado

#### 3.3 Payment Integration
Geração de link de pagamento integrado ao sistema financeiro da agência. Status do projeto só muda para "Em Andamento" após confirmação.

**Implementação:** Integração com Stripe/Asaas/Mercado Pago → webhook de confirmação atualiza status no DevFlow.

**Detalhamento técnico:**
- Suporte a: entrada + parcelas, pagamento único, recorrência mensal (para planos de suporte)
- Webhook de confirmação → `PaymentConfirmedJob` → atualiza status → dispara onboarding
- Tabela `payments` com status, gateway, valor, parcela, receipt_url
- Retry automático para webhooks falhos + alerta ao financeiro

### ⚡ Melhoria adicional: Smart Deposit Calculator
Se o projeto for parcelado, o sistema calcula o **valor de entrada ideal** com base no risco do cliente (score interno) e no custo das primeiras sprints.

**Implementação:**
- Risk score do cliente: pontualidade em pagamentos anteriores, porte da empresa, histórico
- Fórmula: `deposit = base_deposit + (risk_factor × sprint_1_cost)`
- Clientes com histórico bom → entrada menor; novos/risco alto → entrada maior
- Transparente para o cliente: "Entrada sugerida com base no cronograma do projeto"

### ⚡ Melhoria adicional 2: Multi-Stakeholder Approval
Para projetos corporativos, permitir que **múltiplos stakeholders** revisem e aprovem a proposta, cada um vendo seções relevantes para seu papel.

**Implementação:**
- Roles no Deal Room: `decision_maker`, `technical_reviewer`, `financial_approver`
- Cada role vê e comenta apenas seções relevantes (técnico vê stack, financeiro vê valores)
- Aprovação completa requer aprovação de todos os roles obrigatórios
- Timeline visual mostra quem já aprovou e quem está pendente

---

## Requisito — Portal de Pedidos para Clientes Existentes

**Função:** Clientes já cadastrados na plataforma acedem de forma autónoma ao seu espaço, consultam as suas informações e submetem novos pedidos. Cada pedido é enviado diretamente ao admin para avaliação; o admin responde com as informações de produção e o valor estimado.

### Fluxo de uso

1. **Acesso autenticado:** Cliente existente faz login com as suas credenciais (e-mail + password ou magic link)
2. **Dashboard do cliente:** Visualiza os dados de perfil, histórico de projetos e pedidos anteriores
3. **Novo pedido:** Preenche o formulário de solicitação (tipo, descrição, urgência, ficheiros de referência)
4. **Envio ao admin:** Pedido submetido → estado "Aguardando avaliação"
5. **Avaliação pelo admin:** Admin acede ao painel, revê o pedido e preenche as informações de produção (prazo, recursos) e valor (orçamento em €)
6. **Notificação ao cliente:** Cliente recebe notificação (e-mail + plataforma) com a proposta de produção e valor
7. **Aprovação / Negociação:** Cliente aceita, pede revisão ou rejeita o pedido diretamente na plataforma

### Componentes necessários

#### Portal do Cliente (frontend)
- Página de perfil: dados pessoais, empresa, contacto, histórico de pedidos
- Formulário de novo pedido: tipo (`new_feature`, `bug_fix`, `new_project`, `support`, `other`), descrição livre, urgência, upload de ficheiros de referência
- Listagem de pedidos com badge de estado: `Rascunho → Em avaliação → Proposta recebida → Aprovado → Em produção → Concluído`
- Página de detalhe do pedido: visualiza a resposta do admin com informações de produção + valor

#### Painel Admin (frontend)
- Listagem de pedidos recebidos com filtro por estado, cliente e data
- Página de detalhe: formulário para preencher informações de produção + valor + nota interna
- Ações: **Enviar proposta**, **Pedir mais informação**, **Recusar**

#### API (backend)

| Rota | Método | Actor | Descrição |
|------|--------|-------|-----------|
| `/api/orders` | GET | Cliente | Lista os pedidos do cliente autenticado |
| `/api/orders` | POST | Cliente | Cria novo pedido |
| `/api/orders/[id]` | GET | Cliente / Admin | Detalhe de um pedido |
| `/api/orders/[id]` | PATCH | Admin / Cliente | Admin envia proposta; cliente aprova/recusa/pede revisão |
| `/api/admin/orders` | GET | Admin | Lista todos os pedidos da plataforma |

#### Schema Prisma

```prisma
model Order {
  id             String      @id @default(cuid())
  clientId       String
  client         User        @relation(fields: [clientId], references: [id])
  type           String      // "new_feature" | "bug_fix" | "new_project" | "support" | "other"
  description    String      @db.Text
  urgency        String      @default("normal") // "low" | "normal" | "high" | "critical"
  attachments    String[]    // URLs dos ficheiros enviados
  status         OrderStatus @default(PENDING)
  // Resposta do admin
  productionInfo String?     @db.Text  // recursos, prazo, metodologia
  estimatedValue Float?      // valor estimado em EUR
  adminNote      String?     @db.Text
  respondedAt    DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

enum OrderStatus {
  DRAFT            // rascunho
  PENDING          // aguardando avaliação do admin
  EVALUATING       // admin a avaliar
  PROPOSAL_SENT    // proposta de produção + valor enviada ao cliente
  APPROVED         // cliente aprovou
  REVISION         // cliente pediu revisão
  REJECTED         // cliente recusou
  IN_PRODUCTION    // em execução
  COMPLETED        // concluído
}
```

### Notificações automáticas

| Evento | Destinatário | Canal |
|--------|-------------|-------|
| Novo pedido submetido | Admin | E-mail + painel |
| Proposta enviada pelo admin | Cliente | E-mail + notificação na plataforma |
| Cliente aprova pedido | Admin | E-mail + painel |
| Cliente pede revisão | Admin | E-mail + painel |
| Pedido em produção | Cliente | E-mail + notificação na plataforma |
| Pedido concluído | Cliente | E-mail + notificação na plataforma |

### Integração com módulos existentes

- **M3 (Deal Room):** Pedidos aprovados podem gerar automaticamente uma proposta formal no Deal Room, mantendo histórico de negociação e assinatura digital
- **M4 (Produção):** Após aprovação, o pedido é vinculado a um sprint/projeto no painel de produção
- **M7 (Cérebro Central):** Pedidos de clientes existentes alimentam métricas de recorrência, LTV (Lifetime Value) e Predictive Client Churn

---

## Módulo 4 — Cérebro de Produção (Gestão do Desenvolvimento)

**Função:** Orquestrar o time de desenvolvimento e manter tudo sincronizado.

### Escopo original (adaptado)

- **Integração com Ferramentas de Dev:** GitHub/GitLab, Jira/Linear, CI/CD, ambientes de staging
- **Gestão de Sprints:** Planejamento, priorização, alocação de recursos
- **Burndown Automático:** Gráficos atualizados em tempo real baseados nas entregas do time
- **Detector de Riscos:** Identifica tarefas atrasadas, blockers, e alerta PM e cliente (quando relevante)

### Recursos inovadores

#### 4.1 Dev Velocity Tracking
Para cada desenvolvedor (anonimizado), o sistema aprende a **velocidade média por tipo de tarefa** e ajusta as estimativas futuras automaticamente.

**Implementação:** Histórico de tarefas × tempo real × tipo de tarefa → modelo por dev → estimativas calibradas.

**Detalhamento técnico:**
- Coleta via webhooks do Jira/Linear: `task_created`, `task_started`, `task_completed`
- Métricas por dev (anônimo no dashboard do cliente): story points/semana, tempo médio por tipo
- Modelo de série temporal (EMA — Exponential Moving Average) para suavizar variações
- Alimenta o estimador do M2: "Para este tipo de tarefa, o time leva em média X horas"

#### 4.2 Auto-Triage de Issues
Quando uma nova issue chega (bug report interno ou do cliente), o sistema:
- Classifica gravidade (crítica, alta, média, baixa)
- Sugere área responsável (front, back, infra)
- Estima complexidade com base em issues similares do passado

**Implementação:** LLM + embeddings vs. issues históricas → classificação multiclasse.

**Detalhamento técnico:**
- Issues históricas como embeddings em pgvector → busca por similaridade
- Classificação multi-label: `[severity, area, estimated_hours]`
- Confiança abaixo de 70% → encaminha para triage manual do PM
- Integração bidirecional: classificação é aplicada como labels no Jira/GitHub Issues

#### 4.3 Dependency Sync
Monitora dependências externas (bibliotecas, APIs) e alerta se alguma:
- Teve atualização crítica de segurança
- Vai ser descontinuada
- Mudou de preço (para APIs pagas)

**Implementação:** Jobs periódicos consultam APIs de segurança (Snyk, GitHub Advisory) + scraping de documentação.

**Detalhamento técnico:**
- Cron job diário: `npm audit --json` + GitHub Advisory Database API
- Parse de `package.json` / `requirements.txt` de cada projeto ativo
- Alertas categorizados: `critical_security`, `deprecation_warning`, `price_change`
- Dashboard com timeline de vulnerabilidades e status de resolução por projeto

### ⚡ Melhoria adicional: Auto-Deploy para Staging Cliente
A cada nova feature entregue, o sistema faz deploy automático em um **ambiente de staging dedicado** ao cliente e envia um link + vídeo curto (gerado automaticamente com a feature rodando) para o cliente testar.

**Implementação:**
- GitHub Actions/GitLab CI → deploy em preview (Vercel Preview, Railway PR environments, Docker)
- Puppeteer/Playwright captura screenshot/gravação → gera GIF/vídeo de 15s
- Notificação push para o cliente com link + preview visual
- Cada PR aprovada = novo deploy staging → cliente testa antes de ir para produção

### ⚡ Melhoria adicional 2: Smart Sprint Planner
Com base na velocidade do time, dependências e prioridades do cliente, o sistema **sugere automaticamente o conteúdo de cada sprint**, otimizando para:
- Minimizar blockers (respeitar dependências)
- Balancear carga entre devs
- Priorizar features de maior valor para o cliente

**Implementação:**
- Algoritmo de bin-packing: tasks (com story points) → sprints (com capacidade)
- Respeita DAG de dependências do M2
- PM pode aceitar, ajustar ou rejeitar a sugestão
- Após cada sprint, o algoritmo é recalibrado com dados reais

---

## Módulo 5 — Vitrine do Cliente (Acompanhamento em Tempo Real)

**Função:** O que o cliente vê — um dashboard limpo, simples e informativo.

### Escopo original (adaptado)

- **Timeline do Projeto:** Linha do tempo visual com marcos, entregas e próximos passos
- **Kanban Público:** Visão simplificada: "A Fazer", "Em Andamento", "Em Teste", "Concluído"
- **Burndown do Cliente:** Gráfico de progresso geral (não técnico)
- **Galeria de Entregas:** Prints, vídeos, links do que já foi produzido
- **Central de Feedbacks:** Cliente pode comentar diretamente em cada entrega

### Recursos inovadores

#### 5.1 Video Status Semanal Automático
Toda sexta, o sistema compila:
- O que foi entregue (com prints)
- O que vem na próxima semana
- Bloqueios (se houver, com tom cuidadoso)

E gera um **vídeo com áudio sintético (IA)** narrando o resumo.

**Implementação:** Template de vídeo + screenshots automáticos das entregas + API de TTS (ElevenLabs, OpenAI TTS) → vídeo enviado por WhatsApp/e-mail.

**Detalhamento técnico:**
- Cron job sexta 16h: coleta dados do Jira/GitHub → gera script de narração via LLM
- TTS: OpenAI TTS-1-HD (Onyx/Nova voice) → arquivo mp3
- FFmpeg: compõe screenshots + narração + template de vídeo da agência → mp4 (até 2min)
- Envio via WhatsApp Business API (Meta Cloud API) ou e-mail (Resend)
- Tom: profissional mas amigável, sem jargão técnico

#### 5.2 "Test Drive" de Funcionalidades
Para apps/sites, o cliente pode **interagir com a funcionalidade em staging** diretamente do dashboard, sem precisar de acesso técnico.

**Implementação:** Iframe seguro para o ambiente de staging + rastreamento de eventos (Hotjar-style, mas interno).

**Detalhamento técnico:**
- Iframe sandboxed com CSP configurado para o domínio de staging
- Script leve injetado no staging: captura clicks, scrolls, tempo por área
- Heatmap semanal gerado automaticamente → PM vê onde o cliente testou mais
- Botão "Feedback" flutuante no iframe → cliente anota diretamente sobre a tela

#### 5.3 Approval Gates
Funcionalidades críticas exigem **aprovação explícita** do cliente no dashboard antes de irem para produção.

**Implementação:** Webhook do frontend → atualiza status no Jira → trava coluna "Pronto para Deploy" até confirmação.

**Detalhamento técnico:**
- PM marca tasks como `requires_client_approval` no Jira/Linear
- No dashboard do cliente, essas tasks aparecem com botão "Aprovar" / "Solicitar Ajuste"
- Timer de 48h: se o cliente não aprova, lembrete automático
- Audit log: quem aprovou, quando, com que comentário

### ⚡ Melhoria adicional: NPS por Milestone
A cada marco entregue, o sistema pergunta automaticamente ao cliente: "De 0 a 10, o quanto você está satisfeito com esta entrega?" com campo opcional para comentário.

**Implementação:**
- Modal elegante no dashboard com escala visual (0–10) + campo de texto
- Dados alimentam o M7 (Cérebro Central) para cálculo de satisfação contínua
- Alertas para PM quando NPS < 7 em qualquer milestone → ação preventiva
- Relatório consolidado por projeto para retrospectiva

### ⚡ Melhoria adicional 2: Client Activity Insights
Monitorar (com consentimento) a **frequência e profundidade** de acesso do cliente ao dashboard:
- Cliente acessa diariamente e comenta → altamente engajado
- Cliente não acessa há 2 semanas → risco de desengajamento → PM notificado

**Implementação:**
- Event tracking no dashboard: `page_view`, `comment_created`, `approval_given`
- Score de engajamento calculado semanalmente (recência + frequência + profundidade)
- Alerta ao PM quando score cai abaixo do percentil 25 do histórico
- Alimenta o Predictive Client Churn do M7

---

## Módulo 6 — Alquimista (Entrega e Pós-Projeto)

**Função:** Garantir que a entrega final seja impecável e que o pós-venda gere novas oportunidades.

### Escopo original (adaptado)

- **Handoff Automático:** Geração automática de:
  - Documentação técnica (README, arquitetura)
  - Manual do usuário
  - Credenciais e acessos (cofre seguro)
- **Treinamento Assíncrono:** Vídeos gravados automaticamente mostrando como usar o sistema
- **Suporte Pós-Entrega:** Central de tickets integrada ao dashboard
- **Upsell Intelligence:** Sugestão de novas funcionalidades baseada no uso real

### Recursos inovadores

#### 6.1 Auto-Documentação
Conforme o código é escrito (commits, PRs), o sistema **documenta automaticamente**:
- O que cada módulo faz
- Como rodar localmente
- Variáveis de ambiente necessárias
- Endpoints da API (via OpenAPI gerado)

**Implementação:** LLM analisa código dos PRs aprovados → atualiza documentação no repositório (mkdocs, ReadTheDocs).

**Detalhamento técnico:**
- GitHub webhook `pull_request.merged` → job `AutoDocumentationJob`
- LLM (GPT-4o ou Claude) analisa diff do PR → gera/atualiza seções relevantes do docs
- OpenAPI spec gerada via `@nestjs/swagger` (backend) → sync automático
- Versionamento: cada release gera snapshot da documentação
- Saída: site estático com busca (MkDocs Material + Algolia/Typesense)

#### 6.2 Usage Analytics (para produtos do cliente)
Se o projeto for um produto do cliente, o sistema oferece um **dashboard de uso básico** que ajuda o cliente a tomar decisões de negócio e justifica novos investimentos.

**Implementação:** Pixel/script leve embutido no código → dados anônimos → dashboard para o cliente.

**Detalhamento técnico:**
- Script ~2KB (vanilla JS) injetado via tag `<script>` → coleta: page views, clicks, sessions
- Dados enviados para endpoint do DevFlow via beacon API (não impacta performance)
- Armazenamento em ClickHouse (alta performance para time-series)
- Dashboard para o cliente: DAU, MAU, páginas mais acessadas, funis, retenção
- LGPD/GDPR: dados anonimizados, sem PII, consentimento configurável

#### 6.3 Maintenance Predictor
Baseado no histórico do projeto, o sistema **prevê a necessidade de manutenção** e sugere contratação de plano de suporte.

**Implementação:** Modelo de sobrevivência (Cox regression) com features: idade do código, número de dependências, histórico de bugs, complexidade ciclomática.

**Detalhamento técnico:**
- Features: `code_age_days`, `n_dependencies`, `n_known_vulnerabilities`, `cyclomatic_complexity_avg`, `bug_rate_last_90d`
- Modelo treinado com projetos históricos da agência → output: probabilidade de incidente nos próximos 30/60/90 dias
- Score 0–100 exibido no dashboard executivo → vermelho > 70 → e-mail automático para o cliente
- Proposta de plano de suporte pré-configurada (baseada no porte/complexidade do projeto)

### ⚡ Melhoria adicional: Retrospectiva Automática
Após o projeto, o sistema gera um **relatório de retrospectiva**:
- O que deu certo (estimativas precisas, sprints tranquilas)
- O que deu errado (tasks estouradas, blockers frequentes)
- Sugestões para próximos projetos similares

**Implementação:**
- Coleta automática: estimativa vs. real por task, blockers, NPS por milestone, bugs em produção
- LLM gera narrativa a partir dos dados → relatório markdown + PDF
- Armazenado no banco de conhecimento interno → alimenta M2 continuamente
- PM pode adicionar observações qualitativas antes de finalizar

### ⚡ Melhoria adicional 2: Credential Vault Seguro
Em vez de enviar credenciais por e-mail/WhatsApp, o sistema oferece um **cofre digital** onde:
- Credenciais são armazenadas criptografadas (AES-256-GCM)
- Acesso via magic link com expiração (24h)
- Log de quem acessou cada credencial e quando
- Rotação automática de senhas de serviço pós-entrega

**Implementação:**
- Vault interno (ou integração com HashiCorp Vault / 1Password CLI)
- API: `POST /api/vault/share` → gera link temporário → cliente acessa com 2FA
- Após 30 dias sem acesso, lembrete ao cliente para rotacionar credenciais

---

## Módulo 7 — Cérebro Central (Orquestração e Inteligência)

**Função:** Onde tudo se conecta, aprende e melhora.

### Escopo original (adaptado)

- **Data Lake Unificado:** Junta dados de todos os módulos:
  - M1 (briefings), M2 (estimativas vs. real), M4 (velocidade, blockers), M5 (feedback), M6 (pós-entrega)
- **Dashboard Executivo:** Visão consolidada da agência (performance, margem, satisfação)
- **Loop de Aprendizado:** Melhora contínua das estimativas, alocação e previsibilidade

### Recursos inovadores

#### 7.1 Profitability Per Project
Para cada projeto, o sistema calcula **margem real** considerando:
- Horas reais vs. orçadas (por perfil de dev)
- Custos indiretos (gerência, infra, ferramentas)
- Satisfação do cliente (NPS) como peso para decisões futuras

**Implementação:** Integração com sistema financeiro da agência → cálculo automático ao final.

**Detalhamento técnico:**
- Tabela `project_financials`: `project_id`, `estimated_hours`, `actual_hours`, `hourly_cost_by_role`, `indirect_costs`, `total_revenue`, `nps_score`
- Margem real = `(revenue - total_cost) / revenue × 100`
- Dashboard: gráfico de margem por projeto, por tipo de projeto, tendência temporal
- Alerta: margem < 15% → revisão obrigatória de processo pelo PM sênior

#### 7.2 Capacity Planner
Com base nos projetos em andamento e na velocidade histórica, o sistema recomenda:
- Quantos novos projetos podem começar no próximo mês
- Quais perfis contratar (se houver gargalo recorrente)
- Qual o melhor momento para férias sem impactar entregas

**Implementação:** Simulação de Monte Carlo com base em dados reais de entregas e alocação.

**Detalhamento técnico:**
- Input: alocação atual por dev, velocidade histórica, backlog de projetos futuros
- Monte Carlo: 10.000 simulações com variação probabilística de velocidade e escopo
- Output: distribuição de probabilidade de cumprimento de prazos + recomendação de contratação
- Visualização: heatmap de alocação (dev × semana), com zonas verdes/amarelas/vermelhas
- Integra com Google Calendar para verificar férias planejadas

#### 7.3 Anomaly Detection em Projetos
Monitora todos os projetos ativos e alerta quando um desvia da curva esperada:
- Burndown estagnado há 3 dias → possível blocker não reportado
- Horas estouradas em 20% sem nova funcionalidade entregue → possível má alocação
- Cliente não acessa o dashboard há 2 semanas → possível desengajamento

**Implementação:** Z-score em métricas-chave por projeto vs. baseline de projetos similares.

**Detalhamento técnico:**
- Métricas monitoradas: `daily_tasks_completed`, `hours_burned_vs_estimated`, `client_last_access`, `blockers_count`, `pr_merge_rate`
- Baseline calculada por tipo/porte de projeto (clusters k-means)
- Alerta quando z-score > 2 em qualquer métrica por 2+ dias consecutivos
- Escalação automática: PM → Lead → Sócio (conforme gravidade e duração)

### ⚡ Melhoria adicional: Predictive Client Churn
Combina dados de satisfação (NPS), frequência de acesso, feedbacks negativos e atrasos para **prever a probabilidade de o cliente não voltar**.

**Implementação:**
- Features: `avg_nps`, `dashboard_access_frequency`, `negative_reviews_count`, `delays_count`, `project_overrun_pct`
- Modelo: Gradient Boosting (XGBoost) treinado com histórico de retenção
- Score 0–100: < 30 = saudável, 30–70 = atenção, > 70 = crítico
- Ações automáticas configuráveis: e-mail do sócio, ligação do PM, proposta de melhoria

### ⚡ Melhoria adicional 2: Agency Benchmarking Dashboard
Comparação da performance da agência consigo mesma ao longo do tempo:
- Tempo médio de proposta (M1→M3): está caindo?
- Precisão das estimativas: % de desvio trend
- NPS médio: evolução trimestral
- Margem média: crescendo ou estagnada?

**Implementação:**
- Agregação trimestral automática de todas as métricas dos módulos
- Gráficos de tendência com meta configurável pela agência
- Relatório PDF trimestral enviado aos sócios automaticamente

---

## Fluxo de Funcionamento Automatizado

```
1. SOLICITAÇÃO:    Cliente acessa portal e responde wizard (M1)
                   → Briefing Intelligence extrai requisitos de gravação opcional
                   → Similar Project Library mostra referências

2. ANÁLISE:        M2 gera escopo técnico + estimativas + proposta
                   → Dependency Graph mostra ordem das features
                   → "What-If" permite cliente ajustar e ver impacto
                   → Auto-Wireframe Preview visualiza telas do projeto

3. APROVAÇÃO:      Cliente entra no Deal Room (M3), comenta cláusulas, assina
                   → Pagamento via link → projeto criado automaticamente no Jira
                   → Multi-Stakeholder Approval para projetos corporativos

4. PRODUÇÃO:       Time desenvolve → M4 integra com GitHub/Jira
                   → Smart Sprint Planner sugere conteúdo de cada sprint
                   → Auto-Deploy para staging a cada PR aprovado

5. ACOMPANHAMENTO: Cliente vê progresso no M5
                   → Sexta-feira: vídeo automático com resumo da semana
                   → "Test Drive" de funcionalidades no staging
                   → NPS por milestone continuamente coletado

6. FEEDBACK:       Cliente testa funcionalidade no staging e aprova via M5
                   → Approval Gates travam deploy até confirmação

7. ENTREGA:        Projeto concluído → M6 gera documentação + manual + vídeos
                   → Credential Vault compartilha acessos de forma segura
                   → Usage Analytics ativo para acompanhamento pós-entrega

8. APRENDIZADO:    M7 calcula margem real + performance
                   → Retrospectiva Automática gera lições aprendidas
                   → Alimenta M2 para próximas estimativas
                   → Se churn risk > 70%, aciona retenção
```

---

## Modelo de Negócio

### Planos sugeridos

| Plano | Preço | Público | Inclui |
|-------|-------|---------|--------|
| **Starter** | R$197/mês | Agências pequenas (até 5 projetos/ano) | M1 + M3 + M5 básico |
| **Growth** | R$497/mês | Agências médias (até 20 projetos/ano) | Todos módulos + 5 usuários internos |
| **Agency** | R$997/mês | Agências grandes (projetos simultâneos) | Multi-marca + API + relatórios avançados |
| **Enterprise** | Sob consulta | Agências com times 50+ devs | On-premise, customizações, SLA |

### Modelos de monetização complementar

- **Pay per Project:** R$ 500/projeto + % sobre valor do projeto (parceria)
- **White Label:** Agências revendem como plataforma própria para seus clientes acompanharem
- **Marketplace de Templates:** Briefings prontos por nicho (e-commerce, fintech, educação) como upsell
- **AI Credits:** Uso de IA além do limite do plano cobra por token/uso (transparente)

---

## Prioridade de Implementação

| Fase | Foco | Inovação-chave | Métrica de sucesso |
|------|------|----------------|---------------------|
| **Q1 MVP** | M1 + M3 + M5 básico | Briefing Wizard + Deal Room + Timeline cliente | 5 agências pilotos ativas |
| **Q2** | M2 + M4 + M7 base | Estimador automático + Integração GitHub/Jira | 15 agências, NPS > 40 |
| **Q3** | M6 + M5 avançado | Auto-documentação + Video Status automático | 30 agências, redução de 20% em reuniões |
| **Q4** | M7 completo + IA | Predictive Churn + Profitability Analytics | +15% margem para clientes da plataforma |

### Detalhamento da Fase 1 (Q1 — MVP)

**Módulo 1 (Input Hub) — 6 semanas:**
| Semana | Entrega | Dependência |
|--------|---------|-------------|
| S1-S2 | Wizard de Descoberta multi-etapa + upload de ativos | — |
| S3 | Complexity Score Preview (versão heurística) | Wizard |
| S4 | Portal do cliente com magic-link auth | Wizard |
| S5 | Briefing Intelligence (áudio → requisitos) | Wizard + LLM |
| S6 | Similar Project Library + QA | Wizard + pgvector |

**Módulo 3 (Deal Room) — 4 semanas (paralelo com M1 S3–S6):**
| Semana | Entrega | Dependência |
|--------|---------|-------------|
| S3-S4 | Proposta interativa com versionamento | M1 Wizard |
| S5 | Negociação assistida + recalculo de impacto | Proposta |
| S6 | Assinatura digital (ZapSign) + Payment integration | Proposta |

**Módulo 5 (Vitrine do Cliente) — 3 semanas (paralelo com M3 S4–S6):**
| Semana | Entrega | Dependência |
|--------|---------|-------------|
| S4-S5 | Timeline do projeto + Kanban público | M3 aprovação |
| S6 | Burndown do cliente + galeria de entregas + Central de feedbacks | Timeline |

---

## Diferenciais Competitivos

| Concorrente | Foco | O que o DevFlow tem a mais |
|-------------|------|---------------------------|
| **Jira + Confluence** | Gestão de projeto + docs | Portal do cliente nativo, IA generativa, Deal Room, estimativas automáticas |
| **PipeRun / Pipedrive** | CRM para agência | Não gerencia produção; DevFlow une comercial + produção |
| **Basecamp / Asana** | Gestão de tarefas | Sem camada de IA, sem estimativas automáticas, sem portal do cliente rico |
| **PandaDoc** | Propostas | DevFlow integra proposta com execução real e acompanhamento |
| **Monday.com** | Gestão visual | Sem IA, sem estimador, sem ambiente staging para cliente, sem video status |
| **Notion** | Docs/wiki | Sem workflow automatizado, sem integrações dev nativas, sem analytics |

**Resumo do diferencial:** Enquanto as ferramentas existentes tratam a agência como duas empresas separadas (comercial e produção), o DevFlow trata como um **organismo único** — e dá visibilidade disso para o cliente.

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Integração com GitHub/Jira complexa | Média | Alto | Começar com APIs oficiais; V1 apenas com status manual |
| Agências com processos muito diferentes | Alta | Médio | Customização de fluxos + templates por tipo de agência |
| Cliente achar o dashboard complexo | Média | Médio | Modo "cliente" vs. "agência" com permissões e visões diferentes |
| Custo de LLM escalar com uso | Média | Médio | Cache de respostas RAG; rate limits; modelos menores (GPT-4o-mini) |
| Concorrência copiar features | Alta | Médio | Velocidade de execução + dados proprietários (histórico de projetos) |
| Adoção lenta por resistência cultural | Média | Alto | Onboarding assistido (1-1 com PM da agência), caso de sucesso documentado |
| Segurança de dados sensíveis (contratos, credenciais) | Baixa | Muito Alto | Criptografia E2E, vault dedicado, SOC 2 compliance no roadmap |

---

## Análise de Viabilidade — Fase 1

### Por que M1 + M3 + M5 primeiro?

1. **Resolve a maior dor imediata:** O tempo entre "primeiro contato" e "proposta aprovada" é onde agências mais perdem clientes e dinheiro.
2. **Gera valor tangível rápido:** Cliente vê um portal profissional desde o dia 1 → diferenciação imediata.
3. **Baixa complexidade técnica:** Não depende de integrações complexas (GitHub/Jira vem no Q2).
4. **Feedback loop rápido:** Agências pilotos podem usar e dar feedback antes de construir os módulos pesados.

### Métricas de validação do MVP (Prova dos 10)

| # | Prova | Métrica | Meta |
|---|-------|---------|------|
| 1 | Alguém usa? | DAU das agências pilotos | > 3 acessos/semana por agência |
| 2 | Alguém paga? | Conversão trial → plano pago | > 20% |
| 3 | Resolve a dor? | Tempo médio briefing→proposta (antes vs. depois) | Redução > 50% |
| 4 | Cliente do cliente aprova? | Taxa de aprovação de propostas no Deal Room | > 60% |
| 5 | NPS da plataforma | NPS entre agências pilotos | > 40 |
| 6 | Retenção | Agências que continuam após 3 meses | > 70% |
| 7 | Expansão | Agências que pedem mais módulos | > 50% |
| 8 | Economia | Horas economizadas/mês reportadas | > 10h/agência |
| 9 | Qualidade do briefing | Briefings completos na primeira submissão | > 80% |
| 10 | Boca a boca | Referrals naturais entre agências | > 1 por agência |

---

## Recomendação Estratégica

### Feature "Game Changer" para começar

**Briefing Intelligence + Estimador Automático (M1 + M2)** — essa dupla resolve a maior dor de qualquer agência: o tempo perdido entre o primeiro contato do cliente e a proposta final. Se você reduz isso de **5 dias para 5 minutos**, você ganha o mercado.

### Próximo passo sugerido

1. **Validar com 3 agências parceiras:**
   - Mapear o processo atual delas (briefing → proposta → execução → entrega)
   - Identificar as dores mais agudas
   - Testar um protótipo do M1 + M3 com um projeto real de cada uma

2. **Com esse feedback, ajustar o MVP e começar o desenvolvimento da Fase 1.**

### Sinergia com o estado atual do repositório

O site atual (landing page + formulário de lead + integração n8n) torna-se o **ponto de entrada do DevFlow:**
- O formulário existente evolui para o **Wizard de Descoberta** (M1)
- A integração n8n existente evolui para o **pipeline de automação** (Deal Room triggers)
- A landing page se torna o **portal público** + onboarding do cliente
- A arquitetura Next.js 16 + React 19 já é a stack base para o frontend completo

> *"O cliente não compra código, compra previsibilidade e confiança."*
> O DevFlow entrega exatamente isso.
