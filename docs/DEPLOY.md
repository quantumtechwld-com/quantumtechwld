# Guia de Deploy — Quantum Technology Agency

Deploy automático via GitHub Actions para AWS EC2 a cada push na branch `main`.

---

## Infraestrutura de produção

| Recurso | Valor |
|---|---|
| **Servidor** | AWS EC2 `t3.small`, Ubuntu 24.04, `sa-east-1` |
| **IP público** | `15.228.226.69` |
| **Banco de dados** | AWS RDS PostgreSQL 16.6, `db.t3.micro`, `sa-east-1` |
| **Runtime** | Node.js 20, PM2 (cluster mode), Nginx (reverse proxy) |
| **URL de produção** | `https://quantumtechwld.com` (HTTPS) |
| **Certificado SSL** | Let's Encrypt, válido até 22/Jun/2026, renovação automática |

---

## Como funciona o pipeline

O arquivo `.github/workflows/deploy.yml` é disparado automaticamente a cada push em `main` e executa os seguintes passos:

```
1. Checkout do código
2. Setup Node.js 20
3. npm ci (instala dependências)
4. npx prisma generate (gera o Prisma Client com os tipos do schema)
5. npm run build (build Next.js com variáveis de produção)
6. tar (empacota .next, public, package.json, prisma, prisma.config.ts)
7. scp (envia o pacote para a EC2)
8. ssh → escreve .env.production.local + extrai build + npm ci + prisma migrate deploy + PM2 reload
```

---

## Pré-requisitos para um novo ambiente

### 1. GitHub Secrets obrigatórios

Acesse `Settings → Secrets and variables → Actions` no repositório e configure:

| Secret | Descrição |
|---|---|
| `EC2_HOST` | IP público da EC2 (ex: `15.228.226.69`) |
| `EC2_SSH_KEY` | Conteúdo completo do arquivo `.pem` da EC2 |
| `DATABASE_URL` | URL completa do PostgreSQL (ex: `postgresql://user:pass@host:5432/db`) |
| `AUTH_SECRET` | String aleatória ≥ 32 chars (NextAuth v5) |
| `AUTH_URL` | URL pública do site (ex: `https://seudominio.com`) |
| `ADMIN_EMAIL` | E-mail do administrador |
| `EMAIL_SERVER_HOST` | Host SMTP (ex: `smtp.gmail.com`) |
| `EMAIL_SERVER_PORT` | Porta SMTP (ex: `465`) |
| `EMAIL_SERVER_USER` | Usuário SMTP |
| `EMAIL_SERVER_PASSWORD` | Senha de app SMTP |
| `EMAIL_FROM` | Remetente (ex: `Quantum Technology <email@dominio.com>`) |
| `EMAIL_ADMIN` | E-mail admin para notificações |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe (`sk_live_...` ou `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret Stripe (`whsec_...`) |
| `STRIPE_MOCK` | `true` para ambiente de testes, `false` para produção real |
| `GEMINI_API_KEY` | Chave da API Google Gemini |
| `N8N_WEBHOOK_URL` | URL do webhook n8n para notificações |

### 2. Provisionamento da EC2

A EC2 precisa ter instalado (executar `infra/ec2-setup.sh` uma única vez):

```bash
# Na máquina local com o .pem disponível:
ssh -i quantum-agency-key.pem ubuntu@<IP_EC2>

# Na EC2:
curl -fsSL https://raw.githubusercontent.com/quantumtechwld-com/quantumtechwld/main/infra/ec2-setup.sh | bash
```

O script instala: Node.js 20, PM2, Nginx, UFW (portas 80 e 443 apenas).

### 3. ecosystem.config.cjs na EC2

O PM2 precisa do arquivo de configuração em `/home/ubuntu/quantum-agency/ecosystem.config.cjs`. Copie uma única vez:

```bash
scp -i quantum-agency-key.pem ecosystem.config.cjs ubuntu@<IP_EC2>:/home/ubuntu/quantum-agency/
```

---

## Configurar domínio real + HTTPS

### 1. DNS no cPanel HostGator

O domínio `quantumtechwld.com` usa `dns3.hostgator.com.br` / `dns4.hostgator.com.br`.
Acesse o cPanel da HostGator → **Zone Editor** → **Manage** (domínio) e adicione:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | `quantumtechwld.com` | `15.228.226.69` | 14400 |
| A | `www` | `15.228.226.69` | 14400 |

> Propagação: 5 min a 4h. Verificar com `nslookup quantumtechwld.com`

### 2. Nginx + SSL na EC2

Após o DNS propagar, execute na EC2:

```bash
ssh -i quantum-agency-key.pem ubuntu@15.228.226.69
sudo bash ~/quantum-agency/infra/domain-setup.sh
```

Ou envie e execute diretamente:

```bash
scp -i quantum-agency-key.pem infra/domain-setup.sh ubuntu@15.228.226.69:~/
ssh -i quantum-agency-key.pem ubuntu@15.228.226.69 "sudo bash ~/domain-setup.sh"
```

O script instala Certbot, configura HTTPS gratuito (Let's Encrypt) e renova automaticamente.

### 3. Atualizar GitHub Secret AUTH_URL

Após o SSL emitido, vá em `Settings → Secrets → Actions` do repositório e atualize:

| Secret | Novo valor |
|--------|------------|
| `AUTH_URL` | `https://quantumtechwld.com` |

Depois dispare um deploy:

```bash
git commit --allow-empty -m "chore: activate production domain"
git push origin main
```

---

## Disparar deploy manualmente

Qualquer push em `main` dispara o deploy. Para forçar sem alterações de código:

```bash
git commit --allow-empty -m "chore: trigger deploy"
git push origin main
```

---

## Monitorar o deploy

1. Acesse `https://github.com/quantumtechwld-com/quantumtechwld/actions`
2. Clique no run mais recente para ver os logs em tempo real
3. Após o verde, acesse `http://15.228.226.69` para confirmar

---

## Verificar estado da aplicação na EC2

```bash
ssh -i quantum-agency-key.pem ubuntu@15.228.226.69

# Status dos processos PM2
pm2 list
pm2 logs quantum-agency --lines 50

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar .env.production.local gerado
cat /home/ubuntu/quantum-agency/.env.production.local
```

---

## Rollback manual

```bash
ssh -i quantum-agency-key.pem ubuntu@15.228.226.69
cd /home/ubuntu/quantum-agency

# Listar commits anteriores (se mantiver backups de .next)
pm2 stop quantum-agency
# Restaurar build anterior e reiniciar
pm2 start ecosystem.config.cjs
```

> Para rollback confiável, faça um `git revert` do commit problemático e deixe o pipeline executar normalmente.

---

## Acesso à EC2 (Session Manager — sem SSH)

> A porta 22 está **fechada** no Security Group. O acesso é feito via AWS Systems Manager Session Manager, sem necessidade de chave PEM.

```bash
# Via AWS CLI (requer aws-session-manager-plugin instalado)
aws ssm start-session --target i-0551c166546ff66e7 --region sa-east-1
```

Ou pelo console AWS:
`EC2 → Instâncias → i-0551c166546ff66e7 → Conectar → Session Manager`

### Acesso de emergência temporário via SSH

Se necessário, abra a porta 22 apenas para seu IP e feche logo após:

```powershell
# Descobrir seu IP público
nslookup -type=A myip.opendns.com 208.67.222.222

# Abrir para seu IP
aws ec2 authorize-security-group-ingress --group-id sg-09b8f87ce9293ff71 `
  --protocol tcp --port 22 --cidr <SEU_IP>/32 --region sa-east-1

# Conectar
ssh -i quantum-agency-key.pem ubuntu@15.228.226.69

# FECHAR IMEDIATAMENTE após uso
aws ec2 revoke-security-group-ingress --group-id sg-09b8f87ce9293ff71 `
  --protocol tcp --port 22 --cidr <SEU_IP>/32 --region sa-east-1
```

A chave `.pem` está salva em:
- Local: `./quantum-agency-key.pem` (gitignored)

---

## Variáveis de ambiente — comportamento por ambiente

| Arquivo | Onde é lido | Usado por |
|---|---|---|
| `.env.local` | Desenvolvimento local | `next dev`, `prisma migrate` |
| `.env.production.local` | EC2 (gerado pelo pipeline) | PM2 / Next.js em produção |
| GitHub Secrets | CI/CD (GitHub Actions) | Build + escrita do `.env.production.local` |

> O `prisma.config.ts` carrega automaticamente `.env.production.local` na EC2 e `.env.local` localmente.

---

## Segurança da infraestrutura

Estado atual das camadas de segurança (aplicadas em 24/Mar/2026):

### Security Group — `sg-09b8f87ce9293ff71`

| Porta | Protocolo | Fonte | Status |
|-------|-----------|-------|--------|
| 80 | TCP | `0.0.0.0/0` | ✅ Aberta (redirect HTTP→HTTPS) |
| 443 | TCP | `0.0.0.0/0` | ✅ Aberta (HTTPS) |
| 22 | TCP | — | ✅ **Fechada** (acesso via SSM) |

### Acesso à instância

- **Modo padrão:** AWS SSM Session Manager (sem porta 22, sem chave PEM)
- **IAM Role:** `QuantumEC2SSMRole` com `AmazonSSMManagedInstanceCore`
- **Instance Profile:** `QuantumEC2SSMProfile` (associado à instância `i-0551c166546ff66e7`)

### Banco de dados — RDS

- `PubliclyAccessible: false` — sem acesso externo à internet
- Acessível apenas via Security Group interno da VPC

### SSL/TLS

- Certificado Let's Encrypt (ECDSA, CN=`quantumtechwld.com`)
- Validade: 24/Mar/2026 → 22/Jun/2026
- Renovação automática via `certbot.timer` (systemd)

### GuardDuty

- **Pendente:** ativar pelo console AWS (credenciais root não permitem via CLI)
- Caminho: `AWS Console → GuardDuty → Get started → Enable GuardDuty`
- Trial gratuito de 30 dias; monitoramento de VPC Flow Logs, DNS e CloudTrail
