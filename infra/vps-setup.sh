#!/bin/bash
# =============================================================================
# vps-setup.sh — HostGator VPS Ubuntu 22.04 — Setup completo de produção
#
# Instala: Node.js 20, PM2, Nginx, PostgreSQL 15, UFW, fail2ban
# Cria:    usuário 'deploy' (sem root), estrutura de diretórios
#
# Executar como root no VPS:
#   ssh -p 22022 root@69.6.243.198
#   bash vps-setup.sh
#
# Ou remotamente (após colocar o script no repositório):
#   ssh -p 22022 root@69.6.243.198 "bash <(curl -fsSL URL_DO_SCRIPT)"
# =============================================================================
set -euo pipefail

APP_USER="deploy"
APP_DIR="/home/$APP_USER/quantum-agency"
LOGS_DIR="/home/$APP_USER/logs"
NODE_VERSION="20"

echo ""
echo "================================================================"
echo "  HostGator VPS — Quantum Technology Agency — Setup"
echo "================================================================"
echo ""

# =============================================================================
echo ">>> [1/9] Atualizando sistema..."
# =============================================================================
apt-get update -y
apt-get upgrade -y

# =============================================================================
echo ">>> [2/9] Instalando dependências base..."
# =============================================================================
apt-get install -y curl git unzip nginx ufw fail2ban

# =============================================================================
echo ">>> [3/9] Instalando Node.js $NODE_VERSION via NodeSource..."
# =============================================================================
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

echo "    Node: $(node -v)  NPM: $(npm -v)"

# =============================================================================
echo ">>> [4/9] Instalando PM2 globalmente..."
# =============================================================================
npm install -g pm2

# =============================================================================
echo ">>> [5/9] Instalando PostgreSQL 15..."
# =============================================================================
apt-get install -y postgresql postgresql-contrib postgresql-client

# Iniciar e habilitar na boot
systemctl enable postgresql
systemctl start postgresql

# Aguardar PostgreSQL estar pronto
sleep 3
echo "    PostgreSQL: $(psql --version)"

# Criar banco e usuário (senha deve ser alterada após o setup)
PLACEHOLDER_PW="ALTERAR_ESTA_SENHA_$(openssl rand -hex 8)"
sudo -u postgres psql << SQL
CREATE DATABASE quantumagency;
CREATE USER quantum WITH ENCRYPTED PASSWORD '${PLACEHOLDER_PW}';
GRANT ALL PRIVILEGES ON DATABASE quantumagency TO quantum;
ALTER DATABASE quantumagency OWNER TO quantum;
SQL

echo ""
echo "    ⚠️  BANCO CRIADO COM SENHA TEMPORÁRIA: ${PLACEHOLDER_PW}"
echo "    ⚠️  Altere com: sudo -u postgres psql -c \"ALTER USER quantum PASSWORD 'NOVA_SENHA';\""
echo ""

# =============================================================================
echo ">>> [6/9] Criando utilizador operacional '${APP_USER}'..."
# =============================================================================
if ! id "$APP_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$APP_USER"
  echo "    Utilizador '${APP_USER}' criado."
else
  echo "    Utilizador '${APP_USER}' já existe — pulando."
fi

# Criar diretório .ssh para chave de deploy (GitHub Actions)
mkdir -p "/home/$APP_USER/.ssh"
chmod 700 "/home/$APP_USER/.ssh"
touch "/home/$APP_USER/.ssh/authorized_keys"
chmod 600 "/home/$APP_USER/.ssh/authorized_keys"
chown -R "$APP_USER:$APP_USER" "/home/$APP_USER/.ssh"

# Criar estrutura de diretórios da aplicação
mkdir -p "$APP_DIR" "$LOGS_DIR"
chown -R "$APP_USER:$APP_USER" "/home/$APP_USER"

# Permitir que 'deploy' reinicie PM2 sem senha (necessário no deploy automático)
if ! grep -q "deploy.*pm2" /etc/sudoers 2>/dev/null; then
  echo "$APP_USER ALL=(ALL) NOPASSWD: /usr/bin/pm2, /usr/local/bin/pm2" >> /etc/sudoers
fi

# =============================================================================
echo ">>> [7/9] Configurando Nginx como reverse proxy..."
# =============================================================================
cat > /etc/nginx/sites-available/quantum-agency << 'NGINX'
server {
    listen 80;
    server_name quantumtechwld.com www.quantumtechwld.com;

    # Segurança básica
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Buffers para suportar JWT cookie do NextAuth v5
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
        proxy_buffer_size          128k;
        proxy_buffers              4 256k;
        proxy_busy_buffers_size    256k;
    }

    # Cache de assets estáticos do Next.js
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINX

# Ativar site e desativar default
ln -sf /etc/nginx/sites-available/quantum-agency /etc/nginx/sites-enabled/quantum-agency
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "    Nginx configurado."

# =============================================================================
echo ">>> [8/9] Configurando firewall (UFW)..."
# =============================================================================
ufw --force enable
ufw allow 22022/tcp   comment "SSH HostGator"
ufw allow 22/tcp      comment "SSH padrão"
ufw allow 80/tcp      comment "HTTP"
ufw allow 443/tcp     comment "HTTPS"
ufw deny 3000/tcp     comment "Bloquear porta Next.js direta"
ufw status

# =============================================================================
echo ">>> [9/9] Configurando fail2ban..."
# =============================================================================
cat > /etc/fail2ban/jail.local << 'FAIL2BAN'
[sshd]
enabled = true
port = 22022,22
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600
findtime = 600

[nginx-http-auth]
enabled = true
FAIL2BAN

systemctl enable fail2ban
systemctl restart fail2ban

# =============================================================================
echo ""
echo "================================================================"
echo "  Setup concluído!"
echo "================================================================"
echo ""
echo "  BANCO DE DADOS:"
echo "  • Database: quantumagency"
echo "  • Usuário:  quantum"
echo "  • Senha temporária: ${PLACEHOLDER_PW}"
echo "  • ALTERE ANTES DE CONTINUAR!"
echo ""
echo "  PRÓXIMOS PASSOS:"
echo ""
echo "  1. Adicionar chave SSH pública do GitHub Actions ao deploy:"
echo "     echo 'CHAVE_PUBLICA' >> /home/deploy/.ssh/authorized_keys"
echo ""
echo "  2. Fazer dump do RDS e restaurar:"
echo "     pg_restore -U quantum -d quantumagency -h localhost /tmp/backup.dump"
echo ""
echo "  3. Criar /home/deploy/quantum-agency/.env.production.local"
echo "     com DATABASE_URL=postgresql://quantum:SENHA@localhost:5432/quantumagency"
echo ""
echo "  4. Configurar GitHub Secrets:"
echo "     VPS_HOST=69.6.243.198"
echo "     VPS_PORT=22022"
echo "     VPS_USER=deploy"
echo "     VPS_SSH_KEY=<conteúdo da chave privada>"
echo "     DATABASE_URL=postgresql://quantum:SENHA@localhost:5432/quantumagency"
echo ""
echo "  5. Push para main → pipeline SSH deploy automático"
echo ""
echo "  6. Validar por IP: http://69.6.243.198/"
echo "     Depois executar: bash infra/vps-domain-setup.sh"
echo "     E cortar DNS no GoDaddy para 69.6.243.198"
echo "================================================================"
