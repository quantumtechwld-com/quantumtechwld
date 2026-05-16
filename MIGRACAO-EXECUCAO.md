# Execução — Migração AWS → HostGator VPS

**Projeto:** Quantum Technology Agency  
**Criado em:** 2026-05-06  
**Para executar na próxima sessão — todos os comandos prontos para copiar e colar**

> ⚠️ Este documento contém credenciais reais. Não versionar no Git.  
> Arquivo deve permanecer apenas local (está no .gitignore via Acesso.txt pattern).

---

## Credenciais de referência rápida

| Recurso | Acesso |
|---|---|
| VPS SSH | `ssh -p 22022 root@69.6.243.198` · senha: `GZU}%W7e` |
| GitHub | https://github.com/quantumtechwld-com · login Google |
| GoDaddy DNS | https://godaddy.com · login Google |
| AWS Console | https://console.aws.amazon.com · `quantumtechwld@gmail.com` · `161803Phi@` |
| Stripe | https://dashboard.stripe.com |

---

## FASE 1 — Provisionar o VPS

**Onde executar:** terminal local (Windows PowerShell ou WSL)  
**Duração:** 20–40 min  
**Impacto no site:** zero

### 1.1 Conectar ao VPS

```bash
ssh -p 22022 root@69.6.243.198
# Senha: GZU}%W7e
```

### 1.2 Rodar o script de setup

```bash
# Dentro do VPS como root — baixa e executa o script do repositório
bash <(curl -fsSL https://raw.githubusercontent.com/quantumtechwld-com/quantumtechwld/main/infra/vps-setup.sh)
```

> Se o script ainda não estiver no repositório remoto, copiar o conteúdo de `infra/vps-setup.sh` e colar diretamente no terminal do VPS.

### 1.3 Anotar a senha do PostgreSQL gerada

O script imprime no final:
```
⚠️  BANCO CRIADO COM SENHA TEMPORÁRIA: ALTERAR_ESTA_SENHA_XXXXXXXX
```

**Copiar esta senha** — será usada em todas as etapas seguintes como `DB_PASS`.

### 1.4 Verificar instalação

```bash
node -v          # deve mostrar v20.x
npm -v           # deve mostrar 10.x
pm2 -v           # deve mostrar versão
nginx -v         # deve mostrar nginx/1.x
psql --version   # deve mostrar PostgreSQL 15.x
ufw status       # deve mostrar portas 22022, 80, 443 abertas
```

---

## FASE 2 — Gerar chave SSH para o deploy automático

**Onde executar:** terminal local  
**Duração:** 2 min  
**Impacto no site:** zero

### 2.1 Gerar o par de chaves

```bash
# No terminal local (Windows PowerShell):
ssh-keygen -t ed25519 -C "github-actions-quantum-vps" -f "$env:USERPROFILE\.ssh\quantum-vps-deploy"
# Pressionar Enter duas vezes (sem passphrase)
```

### 2.2 Ver e copiar a chave pública

```bash
Get-Content "$env:USERPROFILE\.ssh\quantum-vps-deploy.pub"
```

### 2.3 Adicionar chave pública ao VPS

```bash
# Conectar no VPS
ssh -p 22022 root@69.6.243.198

# Adicionar chave ao usuário deploy
echo "COLAR_AQUI_O_CONTEUDO_DE_quantum-vps-deploy.pub" >> /home/deploy/.ssh/authorized_keys

# Verificar
cat /home/deploy/.ssh/authorized_keys
```

### 2.4 Testar conexão SSH como deploy

```bash
# No terminal local:
ssh -i "$env:USERPROFILE\.ssh\quantum-vps-deploy" -p 22022 deploy@69.6.243.198
# Deve entrar sem pedir senha
```

### 2.5 Ver chave privada (para o GitHub Secret)

```bash
Get-Content "$env:USERPROFILE\.ssh\quantum-vps-deploy"
# Copiar TODO o conteúdo incluindo as linhas -----BEGIN/END-----
```

---

## FASE 3 — Dump do banco de dados RDS

**Onde executar:** terminal local  
**Duração:** 5–15 min  
**Impacto no site:** zero

> Pré-requisito: `pg_dump` instalado localmente (vem com PostgreSQL client).  
> Se não instalado: `winget install PostgreSQL.PostgreSQL` ou usar WSL.

### 3.1 Obter credenciais do RDS

Acessar GitHub → Settings → Secrets → Actions do repositório e copiar o valor de `DATABASE_URL`.

Formato esperado: `postgresql://USUARIO:SENHA@quantum-agency-db.cbkaa6ma6nx6.sa-east-1.rds.amazonaws.com:5432/BANCO`

### 3.2 Fazer o dump

```bash
# Substituir os valores reais de RDS_USER, RDS_PASS, RDS_DB
$env:PGPASSWORD = "RDS_PASS"

pg_dump `
  -h quantum-agency-db.cbkaa6ma6nx6.sa-east-1.rds.amazonaws.com `
  -U RDS_USER `
  -d RDS_DB `
  -p 5432 `
  --no-owner `
  --no-acl `
  -Fc `
  -f "backup-quantum-$(Get-Date -Format 'yyyyMMdd-HHmm').dump"

# Verificar que o arquivo foi criado e não está vazio
Get-ChildItem backup-quantum-*.dump
```

### 3.3 Verificar contagem de registros (antes do restore)

```bash
$env:PGPASSWORD = "RDS_PASS"

psql `
  -h quantum-agency-db.cbkaa6ma6nx6.sa-east-1.rds.amazonaws.com `
  -U RDS_USER `
  -d RDS_DB `
  -c "SELECT 'users' as tabela, COUNT(*) FROM \"User\" UNION ALL SELECT 'orders', COUNT(*) FROM \"Order\" UNION ALL SELECT 'briefings', COUNT(*) FROM \"Briefing\";"
```

**Anotar os números** — serão comparados após o restore.

---

## FASE 4 — Restaurar banco no VPS

**Onde executar:** terminal local (scp) + VPS (pg_restore)  
**Duração:** 5–10 min  
**Impacto no site:** zero

### 4.1 Enviar dump para o VPS

```bash
# No terminal local:
scp -P 22022 backup-quantum-*.dump root@69.6.243.198:/tmp/
```

### 4.2 Alterar senha do PostgreSQL no VPS

```bash
# Conectar no VPS
ssh -p 22022 root@69.6.243.198

# Definir uma senha forte e memorável (substituir NOVA_SENHA_FORTE)
sudo -u postgres psql -c "ALTER USER quantum PASSWORD 'NOVA_SENHA_FORTE';"
```

> **Anotar a nova senha** — vai para `DATABASE_URL` no `.env.production.local` e no GitHub Secret.

### 4.3 Restaurar o dump

```bash
# Ainda no VPS:
pg_restore \
  -U quantum \
  -d quantumagency \
  -h localhost \
  -W \
  --no-owner \
  /tmp/backup-quantum-*.dump
# Vai pedir senha: NOVA_SENHA_FORTE
```

### 4.4 Verificar contagem pós-restore

```bash
sudo -u postgres psql -d quantumagency -c "
SELECT 'users' as tabela, COUNT(*) FROM \"User\"
UNION ALL SELECT 'orders', COUNT(*) FROM \"Order\"
UNION ALL SELECT 'briefings', COUNT(*) FROM \"Briefing\";
"
```

Os números devem bater com os da Fase 3.3.

---

## FASE 5 — Configurar variáveis de ambiente no VPS

**Onde executar:** VPS  
**Duração:** 10 min  
**Impacto no site:** zero

### 5.1 Criar o arquivo .env.production.local

```bash
# No VPS como root:
cat > /home/deploy/quantum-agency/.env.production.local << 'EOF'
NODE_ENV=production

# Banco local do VPS (substituir NOVA_SENHA_FORTE pela senha definida na Fase 4.2)
DATABASE_URL=postgresql://quantum:NOVA_SENHA_FORTE@localhost:5432/quantumagency

# Auth — copiar do GitHub Secret AUTH_SECRET
AUTH_SECRET=COPIAR_DO_GITHUB_SECRET

AUTH_URL=https://quantumtechwld.com

# Email Resend
EMAIL_BASE_URL=https://quantumtechwld.com
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=COPIAR_DO_GITHUB_SECRET
EMAIL_FROM=Quantum Technology <noreply@quantumtechwld.com>
EMAIL_ADMIN=ricardo8leandro@gmail.com
ADMIN_EMAIL=ricardo8leandro@gmail.com

# Gemini AI
GEMINI_API_KEY=COPIAR_DO_GITHUB_SECRET

# Stripe — copiar os valores reais do GitHub Secrets (são os de produção, não os de teste)
STRIPE_SECRET_KEY=COPIAR_DO_GITHUB_SECRET
STRIPE_WEBHOOK_SECRET=COPIAR_DO_GITHUB_SECRET
STRIPE_MOCK=false

# n8n
N8N_WEBHOOK_URL=https://quantumtechnology.app.n8n.cloud/webhook/lead-capture

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://5a1e6c17533d96676c0841be52e72e04@o4511237754978304.ingest.us.sentry.io/4511237758320640

# PIX — copiar do GitHub Secrets
NEXT_PUBLIC_PIX_KEY=COPIAR_DO_GITHUB_SECRET
NEXT_PUBLIC_PIX_OWNER=COPIAR_DO_GITHUB_SECRET
NEXT_PUBLIC_PIX_BANK=COPIAR_DO_GITHUB_SECRET
EOF

chmod 600 /home/deploy/quantum-agency/.env.production.local
chown deploy:deploy /home/deploy/quantum-agency/.env.production.local
```

---

## FASE 6 — Adicionar secrets VPS no GitHub

**Onde executar:** navegador  
**Duração:** 5 min  
**Impacto no site:** zero

### 6.1 Acessar settings de secrets

```
https://github.com/quantumtechwld-com/quantumtechwld/settings/secrets/actions
```

### 6.2 Adicionar os 4 secrets novos

| Secret | Valor |
|---|---|
| `VPS_HOST` | `69.6.243.198` |
| `VPS_PORT` | `22022` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Conteúdo completo do arquivo `~/.ssh/quantum-vps-deploy` (chave privada) |

### 6.3 Atualizar DATABASE_URL

Editar o secret `DATABASE_URL` existente para:
```
postgresql://quantum:NOVA_SENHA_FORTE@localhost:5432/quantumagency
```

---

## FASE 7 — Primeiro deploy no VPS (validação por IP)

**Onde executar:** GitHub Actions (dispatch manual) + navegador  
**Duração:** 20–30 min  
**Impacto no site:** zero (AWS continua rodando)

### 7.1 Disparar o deploy manualmente

```
https://github.com/quantumtechwld-com/quantumtechwld/actions/workflows/deploy-vps.yml
```

Clicar em **"Run workflow"** → **"Run workflow"** (branch main).

### 7.2 Acompanhar os logs

Aguardar as 3 camadas: Quality Gate → Build → Deploy VPS.

### 7.3 Validar a aplicação acessando por IP direto

Abrir no navegador (sem HTTPS ainda):

| URL | Resultado esperado |
|---|---|
| `http://69.6.243.198/` | Landing page carrega |
| `http://69.6.243.198/api/health` | `{"status":"ok"}` |
| `http://69.6.243.198/portal/login` | Tela de login carrega |

### 7.4 Verificar PM2 no VPS

```bash
ssh -i "$env:USERPROFILE\.ssh\quantum-vps-deploy" -p 22022 deploy@69.6.243.198
pm2 list
pm2 logs quantum-agency --lines 30
```

---

## FASE 8 — Preparar DNS (24h antes do corte)

**Onde executar:** GoDaddy  
**Duração:** 5 min

### 8.1 Reduzir TTL no GoDaddy

```
https://dcc.godaddy.com/control/portfolio/quantumtechwld.com/settings
→ DNS → Gerenciar
→ Registro A "quantumtechwld.com" → Editar → TTL: 600 segundos (10 min)
→ Registro A "www" → Editar → TTL: 600 segundos
```

Aguardar pelo menos 30 min para o TTL reduzido propagar antes do corte.

---

## FASE 9 — SSL no VPS

**Onde executar:** VPS (só após DNS apontar para 69.6.243.198)  
**Duração:** 5–10 min

### 9.1 Verificar DNS antes

```bash
# No terminal local:
nslookup quantumtechwld.com 8.8.8.8
# Deve retornar 69.6.243.198 para prosseguir
```

### 9.2 Rodar o script de SSL

```bash
ssh -p 22022 root@69.6.243.198
bash /home/deploy/vps-domain-setup.sh
```

> Ou copiar o conteúdo de `infra/vps-domain-setup.sh` e colar diretamente.

---

## FASE 10 — Corte de DNS ⚠️

**Onde executar:** GoDaddy  
**Duração:** 5 min de ação + propagação  
**Impacto:** site brevemente inacessível durante propagação

### 10.1 Alterar o A record

```
GoDaddy → DNS → Gerenciar → quantumtechwld.com:
  A   @     →  69.6.243.198   (substituir 15.228.226.69)
  A   www   →  69.6.243.198   (substituir 15.228.226.69)
```

### 10.2 Monitorar propagação

```bash
# Repetir até retornar 69.6.243.198:
nslookup quantumtechwld.com 8.8.8.8
nslookup quantumtechwld.com 1.1.1.1
```

---

## FASE 11 — Ativar pipeline VPS como padrão

**Onde executar:** VS Code  
**Duração:** 5 min

### 11.1 Atualizar deploy-vps.yml (trocar trigger)

No arquivo `.github/workflows/deploy-vps.yml`, substituir:

```yaml
on:
  workflow_dispatch:
  # push:
  #   branches: [main]
```

por:

```yaml
on:
  push:
    branches: [main]
```

### 11.2 Desativar deploy.yml antigo

Renomear `.github/workflows/deploy.yml` para `.github/workflows/deploy-aws.yml.disabled`  
(ou apagar se a migração for confirmada).

### 11.3 Atualizar AUTH_URL no GitHub Secrets

Confirmar que `AUTH_URL` = `https://quantumtechwld.com`

### 11.4 Atualizar webhook Stripe

```
https://dashboard.stripe.com/webhooks
→ Editar endpoint existente → URL: https://quantumtechwld.com/api/webhooks/stripe
```

---

## FASE 12 — Validação final completa

Checklist obrigatório **antes** de desligar a AWS:

- [ ] `https://quantumtechwld.com` carrega com cadeado verde
- [ ] Magic link chega no e-mail e faz login
- [ ] Portal do cliente acessível
- [ ] Criação de pedido funciona
- [ ] Proposta funciona
- [ ] Webhook Stripe respondendo
- [ ] `npm run test:e2e:smoke` verde

---

## FASE 13 — Desligar AWS *(somente após 7 dias de validação)*

### 13.1 Parar EC2 (não terminar ainda)

```
AWS Console → EC2 → Instâncias → i-0551c166546ff66e7 → Ações → Parar instância
```

### 13.2 Snapshot final do RDS

```
AWS Console → RDS → Bancos de dados → quantum-agency-db → Ações → Tirar snapshot
Nome: quantum-agency-final-backup-YYYYMMDD
```

### 13.3 Após 7 dias — deletar RDS

```
AWS Console → RDS → Bancos de dados → Excluir → NÃO criar snapshot final (já foi feito)
```

### 13.4 Terminar EC2

```
AWS Console → EC2 → Instâncias → Ações → Encerrar instância
```

### 13.5 Deletar S3 bucket de deploy

```
AWS Console → S3 → quantumtechwld-deploy → Esvaziar → Excluir
```

### 13.6 Revogar IAM user

```
AWS Console → IAM → Usuários → quantum-github-actions → Excluir
```

### 13.7 Limpar GitHub Secrets obsoletos

Remover do repositório:
- `EC2_INSTANCE_ID`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `DEPLOY_BUCKET`

### 13.8 Avaliar WorkMail (~R$ 21/mês)

Opções:
- Manter WorkMail (mais simples)
- Migrar para Zoho Mail gratuito (1 caixa free)
- Migrar para Gmail Workspace (~R$ 30/mês — mais caro)

---

## Resumo da ordem de execução

```
FASE  1 → Provisionar VPS                      → SSH no VPS
FASE  2 → Gerar chave SSH de deploy             → Terminal local
FASE  3 → Dump do RDS                           → Terminal local
FASE  4 → Restore banco no VPS                  → scp + SSH no VPS
FASE  5 → Variáveis de ambiente no VPS          → SSH no VPS
FASE  6 → Secrets VPS no GitHub                 → Navegador
FASE  7 → Primeiro deploy + validação por IP    → GitHub Actions
FASE  8 → Reduzir TTL DNS (24h antes do corte)  → GoDaddy
FASE  9 → SSL no VPS                            → SSH no VPS (após DNS)
FASE 10 → Corte de DNS ⚠️                       → GoDaddy
FASE 11 → Ativar pipeline SSH como padrão       → VS Code + GitHub
FASE 12 → Validação final                       → Navegador + testes
FASE 13 → Desligar AWS (após 7 dias) ⚠️         → AWS Console
```

---

## O que JÁ está pronto (não precisa criar na próxima sessão)

| Artefato | Arquivo |
|---|---|
| Script de provisionamento VPS | `infra/vps-setup.sh` |
| Script de SSL no VPS | `infra/vps-domain-setup.sh` |
| Script de deploy remoto VPS | `scripts/deploy-remote-vps.sh` |
| Pipeline GitHub Actions SSH | `.github/workflows/deploy-vps.yml` |
| Plano de migração detalhado | `docs/MIGRATION-AWS-TO-HOSTGATOR.md` |

---

_Criado em 2026-05-06_
