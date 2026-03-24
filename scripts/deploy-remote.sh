#!/usr/bin/env bash
# deploy-remote.sh — executado na EC2 via SSM como usuário ubuntu (su - ubuntu)
# Uso: bash /tmp/deploy-remote.sh <S3_BUCKET>
set -euo pipefail

# Garante que nvm/npm/pm2 estejam acessíveis mesmo sem shell interativo
export NVM_DIR="${HOME:-/home/ubuntu}/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

BUCKET="$1"
APP_DIR="${HOME:-/home/ubuntu}/quantum-agency"
STAGING="${HOME:-/home/ubuntu}/app-deploy"

echo "==> Ambiente: HOME=$HOME, PATH=$PATH"
echo "==> Verificando ferramentas..."
command -v aws  || { echo "ERRO: aws CLI não encontrado em PATH=$PATH"; exit 1; }
command -v npm  || { echo "ERRO: npm não encontrado"; exit 1; }
command -v pm2  || { echo "ERRO: pm2 não encontrado"; exit 1; }

echo "==> Preparando diretórios..."
mkdir -p "$APP_DIR" "$STAGING"

echo "==> Baixando artefatos do S3..."
aws s3 cp "s3://$BUCKET/deploy.tar.gz"          "$STAGING/deploy.tar.gz"
aws s3 cp "s3://$BUCKET/env.production.local"   "$APP_DIR/.env.production.local"
chmod 600 "$APP_DIR/.env.production.local"

echo "==> Extraindo aplicação..."
tar -xzf "$STAGING/deploy.tar.gz" -C "$APP_DIR"
rm "$STAGING/deploy.tar.gz"

echo "==> Instalando dependências de produção..."
cd "$APP_DIR"
npm ci --omit=dev

echo "==> Executando migrações do banco..."
DATABASE_URL=$(grep '^DATABASE_URL=' "$APP_DIR/.env.production.local" | cut -d= -f2-)
export DATABASE_URL
npx prisma migrate deploy

echo "==> Recarregando PM2..."
pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
pm2 save

echo "==> Deploy concluído com sucesso!"
