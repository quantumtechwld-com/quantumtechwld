#!/usr/bin/env bash
# =============================================================================
# deploy-remote-staging.sh — executado no VPS pelo GitHub Actions (branch staging)
#
# Diferenças em relação ao deploy-remote-vps.sh de produção:
#  - APP_DIR: /home/deploy/quantum-agency-staging  (pasta isolada)
#  - Env file: .env.production.local dentro da pasta staging
#  - Porta: 3001  (configurada no ecosystem.staging.config.cjs)
#  - PM2: usa ecosystem.staging.config.cjs  →  app "quantum-agency-staging"
#  - 1 instância fork (não cluster) para economizar RAM
#
# Requerimentos no VPS (executar 1 vez via infra/vps-staging-setup.sh):
#  - Banco quantumagency_staging criado no PostgreSQL local
#  - Nginx configurado para staging.quantumtechwld.com → localhost:3001
# =============================================================================
set -euo pipefail

APP_USER="deploy"
APP_DIR="/home/$APP_USER/quantum-agency-staging"
STAGING="/home/$APP_USER/app-staging-pkg"
ENV_FILE="$APP_DIR/.env.production.local"
ECOSYSTEM="ecosystem.staging.config.cjs"

echo "==> Verificando ferramentas..."
command -v node || { echo "ERRO: node não encontrado"; exit 1; }
command -v npm  || { echo "ERRO: npm não encontrado"; exit 1; }
command -v pm2  || { echo "ERRO: pm2 não encontrado"; exit 1; }

echo "==> Preparando diretórios..."
mkdir -p "$APP_DIR" "$STAGING"

echo "==> Corrigindo permissões..."
chown -R "$APP_USER:$APP_USER" "$APP_DIR" 2>/dev/null || true

echo "==> Limpando build anterior..."
rm -rf \
  "$APP_DIR/.next" \
  "$APP_DIR/prisma" \
  "$APP_DIR/public" \
  "$APP_DIR/package.json" \
  "$APP_DIR/package-lock.json" \
  "$APP_DIR/next.config.ts" \
  "$APP_DIR/next.config.js" \
  "$APP_DIR/prisma.config.ts" \
  "$APP_DIR/ecosystem.staging.config.cjs"

echo "==> Extraindo artefato de deploy..."
tar -xzf "$STAGING/app.tar.gz" -C "$APP_DIR" --no-same-permissions --no-same-owner
rm -f "$STAGING/app.tar.gz"

echo "==> Instalando dependências de produção..."
cd "$APP_DIR"
rm -rf node_modules

NODE_OPTIONS="--max-old-space-size=384" npm install --omit=dev --prefer-offline

echo "==> Gerando Prisma Client..."
npx prisma generate

echo "==> Executando migrações no banco de staging..."
DATABASE_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)
export DATABASE_URL
npx prisma migrate deploy

echo "==> Reiniciando PM2 (staging)..."
pm2 reload "$APP_DIR/$ECOSYSTEM" --update-env 2>/dev/null || pm2 start "$APP_DIR/$ECOSYSTEM"
pm2 save

# Garante que Nginx pode atravessar /home/deploy para servir estáticos
chmod 751 /home/deploy

echo "==> Deploy de staging concluído com sucesso!"
pm2 list
