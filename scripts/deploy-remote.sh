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

echo "==> Corrigindo permissões (arquivos criados por root em restarts de emergência)..."
sudo chown -R ubuntu:ubuntu "$APP_DIR" 2>/dev/null || true

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
# Remove node_modules completamente para instalação limpa
rm -rf node_modules
# ─────────────────────────────────────────────────────────────────────────────
# ⚠️  ATENÇÃO — POR QUE --omit=dev ESTÁ CORRETO AQUI:
#
#  O .next/ já foi compilado no GitHub Actions (camada 2 do pipeline).
#  Este script apenas instala as dependências de RUNTIME para rodar o servidor.
#  devDependencies (postcss, tailwind, autoprefixer, etc.) NÃO são necessárias
#  nesta etapa.
#
# ⛔ NUNCA use --omit=dev em um rebuild manual na EC2 (git pull + npm run build):
#  O Next.js precisa de postcss/tailwind/autoprefixer (devDeps) para compilar.
#  Se usar --omit=dev antes de 'npm run build', o build FALHA silenciosamente,
#  o pm2 recarrega com .next/ quebrado, e o site retorna 502 Bad Gateway.
#
#  ✅ REBUILD DE EMERGÊNCIA CORRETO (quando precisar recompilar na EC2):
#     Ver secção "Rebuild de emergência na EC2" em docs/DEPLOY.md
# ─────────────────────────────────────────────────────────────────────────────
NODE_OPTIONS="--max-old-space-size=384" npm install --omit=dev --prefer-offline

echo "==> Gerando Prisma Client..."
# Necessário após npm ci --omit=dev porque o prisma CLI fica em devDependencies
# Sem este passo o PrismaAdapter falha e o magic link não funciona
npx prisma generate

echo "==> Resolvendo migrations com falha (se houver)..."
DATABASE_URL=$(grep '^DATABASE_URL=' "$APP_DIR/.env.production.local" | cut -d= -f2-)
export DATABASE_URL
# Se a migration 20260426100000_remove_owner_orgrole ficou marcada como falha (P3018),
# marcar como rolled-back para que o migrate deploy possa reaplicar com o SQL corrigido.
npx prisma migrate resolve --rolled-back 20260426100000_remove_owner_orgrole 2>/dev/null || true

echo "==> Executando migrações do banco..."
npx prisma migrate deploy

echo "==> Reiniciando PM2..."
pm2 restart ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
pm2 save

echo "==> Deploy concluído com sucesso!"
