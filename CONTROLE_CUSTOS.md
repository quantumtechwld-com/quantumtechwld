# Controle de Custos — Quantum Technology Agency

> Documento LOCAL — não versionado no Git.  
> Atualizar sempre que houver mudança de plano, cobrança ou novo serviço.

---

## Resumo do Projeto

| Campo             | Valor                                                        |
|-------------------|--------------------------------------------------------------|
| Projeto           | Quantum Technology Agency — Plataforma DevFlow + Landing     |
| Domínio           | quantumtechwld.com                                           |
| Início            | 2026                                                         |
| Stack principal   | Next.js 16 · TypeScript · TailwindCSS · PostgreSQL · Prisma  |
| Ambiente prod     | AWS EC2 t3.small · sa-east-1 · PM2 cluster · Nginx           |

---

## Serviços e APIs Ativos

### 1. AWS EC2 — Servidor de Produção
| Campo             | Detalhe                                                      |
|-------------------|--------------------------------------------------------------|
| Instância         | t3.small — sa-east-1 (São Paulo)                             |
| Account ID        | 5653-8786-8790                                               |
| IP Público        | 15.228.226.69                                                |
| Custo mensal      | ~US$ 17,00 (~R$ 87,00)                                       |
| Storage EBS       | _GB — ~US$ ___ / mês_                                        |
| Renovação         | Sob demanda (pay-as-you-go)                                  |
| Observações       | PM2 cluster mode · Nginx reverse proxy · Node.js 20          |

### 2. AWS RDS — Banco de Dados PostgreSQL
| Campo             | Detalhe                                                      |
|-------------------|--------------------------------------------------------------|
| Engine            | PostgreSQL 16.6                                              |
| Instância         | db.t3.micro — sa-east-1                                      |
| Custo mensal      | ~US$ 15,00 (~R$ 77,00)                                       |
| Storage           | _GB gp2_                                                     |
| Renovação         | Sob demanda (pay-as-you-go)                                  |
| Observações       | 14 tabelas · Prisma ORM · Backups automáticos RDS            |

### 3. AWS WorkMail — Email Corporativo
| Campo             | Detalhe                                                      |
|-------------------|--------------------------------------------------------------|
| Conta             | contato@quantumtechwld.com                                   |
| Webmail           | https://quantumtechwld.awsapps.com/mail                      |
| Plano             | AWS WorkMail Standard                                        |
| Custo mensal      | US$ 4,00/caixa (~R$ 21,00)                                   |
| IMAP              | outlook.awsapps.com · porta 993 SSL                          |
| SMTP              | outlook.awsapps.com · porta 465 SSL                          |
| Observações       | _Verificar se Resend está substituindo SMTP de transacional_ |

### 4. GoDaddy — Domínio
| Campo             | Detalhe                                                      |
|-------------------|--------------------------------------------------------------|
| Domínio           | quantumtechwld.com                                           |
| Registrar         | GoDaddy (login Google)                                       |
| Custo anual       | US$ 13,00/ano (~R$ 67,00/ano)                                |
| Custo mensal      | ~US$ 1,08/mês                                                |
| Renovação         | _dd/mm/aaaa_                                                 |
| Observações       | DNS gerenciado no GoDaddy · A record → 15.228.226.69         |

### 5. Resend — Email Transacional
| Campo             | Detalhe                                                      |
|-------------------|--------------------------------------------------------------|
| Plano             | _Free / Pro_                                                 |
| Custo mensal      | _R$ 0,00 (free) / US$ 20 (Pro)_                              |
| Limite free       | 3.000 emails/mês · 100/dia                                   |
| Uso               | Magic link auth · notificações de pedidos · leads            |
| Observações       | Atualizar plano quando ultrapassar 100 emails/dia            |

### 6. Stripe — Pagamentos
| Campo             | Detalhe                                                      |
|-------------------|--------------------------------------------------------------|
| Modo              | _Test / Live_                                                |
| Taxa por transação| 1,5% + R$ 0,40 (cartão nacional) · 3,99% (internacional)    |
| Custo fixo mensal | R$ 0,00 (pay-per-use)                                        |
| Dashboard         | https://dashboard.stripe.com                                 |
| Observações       | Webhook configurado no EC2 · `STRIPE_MOCK=true` em dev       |

### 7. Google Gemini — IA (Briefing Intelligence)
| Campo             | Detalhe                                                      |
|-------------------|--------------------------------------------------------------|
| Modelo            | gemini-pro (ou gemini-1.5-flash)                             |
| Plano             | _Free Tier / Pay-as-you-go_                                  |
| Custo mensal      | _R$ 0,00 (free) / US$ ___ (produção)_                        |
| Limite free       | 15 req/min · 1.500 req/dia · 1M tokens/min                   |
| Uso               | Análise de briefings · geração de propostas                  |
| Observações       | Rotacionar GEMINI_API_KEY em: _dd/mm/aaaa_                   |

### 8. n8n — Automação
| Campo             | Detalhe                                                      |
|-------------------|--------------------------------------------------------------|
| Plano             | _Self-hosted / Cloud_                                        |
| Custo mensal      | _R$ 0,00 (self-hosted) / US$ 20 (Cloud Starter)_             |
| Uso               | Captura de leads · notificações · webhooks                   |
| Webhook URL       | _https://___/webhook/..._ (preencher)                        |
| Observações       | Workflow: `n8n/workflow-lead-capture.json`                   |

### 9. GitHub
| Campo             | Detalhe                                                      |
|-------------------|--------------------------------------------------------------|
| Organização       | github.com/quantumtechwld-com                                |
| Plano             | Free                                                         |
| Custo mensal      | R$ 0,00                                                      |
| GitHub Actions    | 2.000 min/mês (free) · US$ 0,008/min excedente               |
| Observações       | CI/CD via Actions → S3 → SSM → EC2                           |

### 10. AWS S3 — Artefatos de Deploy
| Campo             | Detalhe                                                      |
|-------------------|--------------------------------------------------------------|
| Bucket            | Armazenamento temporário de `deploy.tar.gz`                  |
| Custo mensal      | ~US$ 0,023/GB (Standard) · praticamente R$ 0,00              |
| Observações       | Upload de artefato por deploy; arquivos removidos após uso   |

### 11. VS Code + GitHub Copilot
| Campo             | Detalhe                                                      |
|-------------------|--------------------------------------------------------------|
| Plano             | _Individual / Business_                                      |
| Custo mensal      | _~R$ ___ / US$ ___                                           |
| Renovação         | _dd/mm_                                                      |

---

## Infraestrutura de Autenticação

| Serviço             | Tipo                  | Custo       | Observações                              |
|---------------------|-----------------------|-------------|------------------------------------------|
| NextAuth v5         | Magic Link Auth       | R$ 0,00     | Open source · sem custo adicional        |
| Resend / WorkMail   | SMTP para magic link  | Ver acima   | Email de acesso ao portal                |
| AWS WorkMail        | Receção de emails     | Ver acima   | contato@quantumtechwld.com               |

---

## Custos Mensais Consolidados

| Item                     | Custo (R$)   | Custo (US$) | Frequência   |
|--------------------------|-------------|-------------|--------------|
| AWS EC2 t3.small         | ~87,00      | ~17,00      | Mensal       |
| AWS RDS db.t3.micro      | ~77,00      | ~15,00      | Mensal       |
| AWS WorkMail             | ~21,00      | ~4,00       | Mensal       |
| GoDaddy (domínio)        | ~5,57       | ~1,08       | Mensal (anual)|
| Resend (email transac.)  | 0,00        | 0,00        | _Free tier_  |
| Stripe                   | 0,00*       | 0,00*       | Pay-per-use  |
| Google Gemini            | 0,00        | 0,00        | _Free tier_  |
| n8n                      | ___         | ___         | Mensal       |
| GitHub                   | 0,00        | 0,00        | —            |
| AWS S3                   | ~0,50       | ~0,10       | Mensal       |
| GitHub Copilot           | ___         | ___         | Mensal       |
| **TOTAL (mín. estimado)**| **~194,00** | **~37,77**  |              |

> \* Stripe cobra por transação processada (sem mensalidade fixa).

---

## Histórico de Custos

| Mês/Ano    | Total (R$)  | Total (US$) | Notas                                          |
|------------|-------------|-------------|------------------------------------------------|
| Abr/2026   | ~194,00+    | ~37,77+     | Início do controle — infraestrutura ativa      |
|            |             |             |                                                |

---

## Plano de Escalabilidade (Referência de Custos Futuros)

### Servidor de Aplicação

| Opção              | Serviço              | Custo/mês    | RAM     | Observações                        |
|--------------------|----------------------|--------------|---------|------------------------------------|
| Atual              | EC2 t3.small         | ~US$ 17      | 2 GB    | 1–5 clientes simultâneos           |
| **Recomendado**    | **EC2 t3.medium**    | **~US$ 33**  | **4 GB**| **+10 clientes · headroom AI**     |
| Escalável          | EC2 t3.large         | ~US$ 67      | 8 GB    | Multi-tenant · carga pesada IA     |
| Managed            | ECS Fargate          | variável     | custom  | Auto-scale sem gerenciar SO        |

### Banco de Dados

| Opção              | Serviço              | Custo/mês    | RAM     | Observações                        |
|--------------------|----------------------|--------------|---------|------------------------------------|
| Atual              | RDS db.t3.micro      | ~US$ 15      | 1 GB    | Até ~50 clientes ativos            |
| Intermediário      | RDS db.t3.small      | ~US$ 28      | 2 GB    | Mais clientes + histórico longo    |
| Produção full      | RDS db.t3.medium     | ~US$ 56      | 4 GB    | +100 clientes · pgvector pesado    |

### Email Transacional (Resend)

| Tier             | Emails/mês  | Custo/mês   | Quando migrar                      |
|------------------|-------------|-------------|------------------------------------|
| Free             | 3.000       | US$ 0       | < 100 emails/dia                   |
| Pro              | 50.000      | US$ 20      | Ao ultrapassar limite free          |
| Business         | 100.000+    | US$ 90      | Uso intensivo / multi-cliente      |

### IA — Google Gemini (se ultrapassar free tier)

| Modelo             | Input (1M tok) | Output (1M tok) | Estimativa mensal                 |
|--------------------|----------------|-----------------|-----------------------------------|
| gemini-1.5-flash   | US$ 0,075      | US$ 0,30        | Leve: <US$ 5 · Intenso: ~US$ 30   |
| gemini-1.5-pro     | US$ 1,25       | US$ 5,00        | Leve: ~US$ 10 · Intenso: ~US$ 80  |

---

## Alertas e Revisões

- [ ] Verificar renovação do domínio GoDaddy em: _dd/mm/aaaa_
- [ ] Rotacionar GEMINI_API_KEY em: _dd/mm/aaaa_
- [ ] Verificar limite free do Resend (100 emails/dia) — migrar para Pro se necessário
- [ ] Atualizar Stripe de Test para Live antes de cobrar clientes reais
- [ ] Revisar custos AWS (EC2 + RDS + WorkMail) mensalmente no billing
- [ ] Revisar este documento mensalmente

---

_Última atualização: 01/04/2026 — Infraestrutura AWS ativa · EC2 + RDS + WorkMail_
