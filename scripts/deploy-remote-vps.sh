#!/usr/bin/env bash
# =============================================================================
# deploy-remote-vps.sh — executado no VPS HostGator pelo GitHub Actions via SSH
# Recebe o deploy.tar.gz via scp (já está em /tmp/ quando este script roda)
# =============================================================================
set -euo pipefail

APP_USER="deploy"
APP_DIR="/home/$APP_USER/quantum-agency"
STAGING="/home/$APP_USER/app-staging"
ENV_FILE="$APP_DIR/.env.production.local"

echo "==> Verificando ferramentas..."
command -v node || { echo "ERRO: node não encontrado"; exit 1; }
command -v npm  || { echo "ERRO: npm não encontrado"; exit 1; }
command -v pm2  || { echo "ERRO: pm2 não encontrado"; exit 1; }

echo "==> Preparando diretórios..."
mkdir -p "$APP_DIR" "$STAGING"

echo "==> Corrigindo permissões..."
chown -R "$APP_USER:$APP_USER" "$APP_DIR" 2>/dev/null || true

echo "==> Extraindo artefato de deploy..."
tar -xzf "$STAGING/app.tar.gz" -C "$APP_DIR" --no-same-permissions --no-same-owner
rm -f "$STAGING/app.tar.gz"

echo "==> Instalando dependências de produção..."
cd "$APP_DIR"
rm -rf node_modules

# O .next/ já foi compilado no GitHub Actions. Aqui instala apenas runtime deps.
NODE_OPTIONS="--max-old-space-size=384" npm install --omit=dev --prefer-offline

echo "==> Gerando Prisma Client..."
npx prisma generate

echo "==> Executando migrações do banco..."
# DATABASE_URL lida do .env.production.local já presente no servidor
DATABASE_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)
export DATABASE_URL
npx prisma migrate deploy

echo "==> Reiniciando PM2..."
pm2 reload ecosystem.config.cjs --update-env 2>/dev/null || pm2 start ecosystem.config.cjs
pm2 save

echo "==> Deploy concluído com sucesso!"
pm2 list
