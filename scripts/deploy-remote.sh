#!/usr/bin/env bash
# deploy-remote.sh — executado na EC2 via SSM como usuário ubuntu (su - ubuntu)
# Uso: bash /tmp/deploy-remote.sh <DEPLOY_URL> <ENV_URL>
# Os URLs são pre-signed S3 URLs gerados pelo GitHub runner (sem precisar de aws CLI aqui)
set -euo pipefail

# Node/npm/pm2 instalados globalmente via apt em /usr/bin — sem NVM neste servidor

DEPLOY_URL="$1"
ENV_URL="$2"
APP_DIR="${HOME:-/home/ubuntu}/quantum-agency"
STAGING="${HOME:-/home/ubuntu}/app-deploy"

echo "==> Ambiente: HOME=$HOME, PATH=$PATH"
echo "==> Verificando ferramentas..."
command -v curl || { echo "ERRO: curl não encontrado"; exit 1; }
command -v npm  || { echo "ERRO: npm não encontrado (nvm: $NVM_DIR)"; exit 1; }
command -v pm2  || { echo "ERRO: pm2 não encontrado"; exit 1; }

echo "==> Preparando diretórios..."
mkdir -p "$APP_DIR" "$STAGING"

echo "==> Baixando artefatos via pre-signed URL..."
curl -fsSL "$DEPLOY_URL" -o "$STAGING/deploy.tar.gz"
curl -fsSL "$ENV_URL"    -o "$APP_DIR/.env.production.local"
chmod 600 "$APP_DIR/.env.production.local"

echo "==> Limpando build anterior..."
rm -rf "$APP_DIR/.next" "$APP_DIR/public" "$APP_DIR/prisma"

echo "==> Extraindo aplicação..."
tar -xzf "$STAGING/deploy.tar.gz" -C "$APP_DIR" --no-same-permissions --no-same-owner
rm "$STAGING/deploy.tar.gz"

echo "==> Instalando dependências de produção..."
cd "$APP_DIR"
# Corrige permissões de arquivos criados como root em deploys anteriores
sudo chown -R ubuntu:ubuntu "$APP_DIR" 2>/dev/null || true
# Remove node_modules completamente para instalação limpa
rm -rf node_modules
NODE_OPTIONS="--max-old-space-size=384" npm ci --omit=dev --prefer-offline

echo "==> Gerando Prisma Client..."
# Necessário após npm ci --omit=dev porque o prisma CLI fica em devDependencies
# Sem este passo o PrismaAdapter falha e o magic link não funciona
npx prisma generate

echo "==> Executando migrações do banco..."
DATABASE_URL=$(grep '^DATABASE_URL=' "$APP_DIR/.env.production.local" | cut -d= -f2-)
export DATABASE_URL
npx prisma migrate deploy

echo "==> Recarregando PM2..."
pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
pm2 save

echo "==> Deploy concluído com sucesso!"
