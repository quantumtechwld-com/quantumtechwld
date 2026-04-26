#!/bin/bash
# =============================================================================
# EC2 Ubuntu 24.04 — Setup Script (rodar como root via User Data ou manualmente)
# Instala: Node.js 20, PM2, Nginx, configura firewall e estrutura de diretórios
# =============================================================================
set -euo pipefail

APP_USER="ubuntu"
APP_DIR="/home/$APP_USER/quantum-agency"
NODE_VERSION="20"

echo ">>> [1/8] Atualizando sistema..."
apt-get update -y
apt-get upgrade -y

echo ">>> [2/8] Instalando dependências base..."
apt-get install -y curl git unzip nginx ufw

echo ">>> [3/8] Instalando Node.js $NODE_VERSION via NodeSource..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

echo ">>> Node: $(node -v)  NPM: $(npm -v)"

echo ">>> [4/8] Instalando PM2 globalmente..."
npm install -g pm2

echo ">>> [5/8] Configurando estrutura de diretórios..."
mkdir -p "$APP_DIR"
chown -R $APP_USER:$APP_USER "$APP_DIR"

echo ">>> [6/8] Criando arquivo .env de produção..."
# Editar manualmente após o setup!
cat > "$APP_DIR/.env.production.local" << 'EOF'
# ── Banco de dados ────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"

# ── NextAuth ──────────────────────────────────────────────────────────────────
NEXTAUTH_SECRET="GERE_COM: openssl rand -base64 32"
NEXTAUTH_URL="http://SEU_IP_EC2_AQUI:3000"

# ── E-mail (SMTP) ─────────────────────────────────────────────────────────────
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="seu@email.com"
EMAIL_SERVER_PASSWORD="sua_senha_smtp"
EMAIL_FROM="Quantum Agency <no-reply@example.com>"
EMAIL_ADMIN="admin@example.com"
ADMIN_EMAIL="admin@example.com"

# ── Stripe ────────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_MOCK="false"

# ── Gemini API ────────────────────────────────────────────────────────────────
GEMINI_API_KEY="AIza..."

# ── n8n ───────────────────────────────────────────────────────────────────────
N8N_WEBHOOK_URL="https://seu-n8n.com/webhook/..."

# ── Node ──────────────────────────────────────────────────────────────────────
NODE_ENV="production"
EOF
chmod 600 "$APP_DIR/.env.production.local"
chown $APP_USER:$APP_USER "$APP_DIR/.env.production.local"

echo ">>> [7/8] Configurando Nginx como reverse proxy..."
cat > /etc/nginx/sites-available/quantum-agency << 'NGINX'
server {
    listen 80;
    server_name quantumtechwld.com www.quantumtechwld.com;

    # Segurança básica
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Buffers para suportar JWT cookie do NextAuth v5 (request e response)
    large_client_header_buffers 8 32k;
    client_header_buffer_size   4k;

    # Logs
    access_log /var/log/nginx/quantum-agency.access.log;
    error_log  /var/log/nginx/quantum-agency.error.log;

    # Proxy para Next.js
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        # Buffers de resposta aumentados para headers grandes (ex: Set-Cookie JWT)
        proxy_buffer_size          128k;
        proxy_buffers              4 256k;
        proxy_busy_buffers_size    256k;
    }

    # Cache de assets estáticos do Next.js
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINX

# Ativa o site e desativa o default
ln -sf /etc/nginx/sites-available/quantum-agency /etc/nginx/sites-enabled/quantum-agency
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ">>> [8/8] Configurando firewall (UFW)..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
# Bloqueia acesso direto à porta 3000 (só via Nginx)
ufw deny 3000

echo ""
echo "================================================================"
echo "  Setup concluído!"
echo "================================================================"
echo ""
echo "  PRÓXIMOS PASSOS:"
echo "  1. Edite o arquivo de variáveis de ambiente:"
echo "     sudo nano $APP_DIR/.env.production.local"
echo ""
echo "  2. Configure os GitHub Secrets no repositório:"
echo "     EC2_HOST            → IP público desta instância"
echo "     EC2_SSH_KEY         → conteúdo da chave privada .pem"
echo "     DATABASE_URL        → string de conexão PostgreSQL"
echo "     NEXTAUTH_SECRET     → openssl rand -base64 32"
echo "     NEXTAUTH_URL        → http://IP_EC2 (sem barra no final)"
echo "     STRIPE_SECRET_KEY   → sk_live_..."
echo "     STRIPE_WEBHOOK_SECRET"
echo "     GEMINI_API_KEY"
echo "     EMAIL_SERVER_HOST, PORT, USER, PASSWORD"
echo "     EMAIL_FROM, EMAIL_ADMIN, ADMIN_EMAIL"
echo "     N8N_WEBHOOK_URL"
echo ""
echo "  3. Copie o ecosystem.config.cjs para o servidor:"
echo "     scp ecosystem.config.cjs ubuntu@IP:~/quantum-agency/"
echo ""
echo "  4. Faça o primeiro deploy manualmente ou via push para main."
echo "================================================================"
