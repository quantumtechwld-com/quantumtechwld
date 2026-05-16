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
mkdir -p "$APP_DIR" "$STAGING/unpack"

echo "==> Corrigindo permissões (inclui arquivos root-owned de deploys manuais)..."
chown -R "$APP_USER:$APP_USER" "$APP_DIR" 2>/dev/null \
  || sudo chown -R "$APP_USER:$APP_USER" "$APP_DIR" 2>/dev/null \
  || echo "AVISO: chown falhou — continuando"

echo "==> Extraindo artefato para área de staging..."
# Extrai para staging/unpack — PM2 ainda serve a versão antiga sem interrupção
tar -xzf "$STAGING/app.tar.gz" -C "$STAGING/unpack" --no-same-permissions --no-same-owner
rm -f "$STAGING/app.tar.gz"

echo "==> Instalando dependências de produção..."
cd "$STAGING/unpack"
# node_modules é atualizado no staging primeiro; APP_DIR nunca fica sem módulos
NODE_OPTIONS="--max-old-space-size=384" npm install --omit=dev

echo "==> Swap atômico de .next/ (zero-downtime)..."
# 1. Renomear o .next antigo para .next-old (operação rápida no mesmo FS)
# 2. Mover o novo .next para $APP_DIR (igualmente rápida, mesmo FS)
# O processo PM2 em execução continua servindo de $APP_DIR/.next até pm2 reload
rm -rf "$APP_DIR/.next-old" 2>/dev/null || true
[ -d "$APP_DIR/.next" ] && mv "$APP_DIR/.next" "$APP_DIR/.next-old"
mv "$STAGING/unpack/.next" "$APP_DIR/.next"

echo "==> Atualizando artefatos de configuração..."
# Arquivos leves — sobrescrever diretamente (ms de indisponibilidade irrelevante)
for f in package.json package-lock.json next.config.ts next.config.js prisma.config.ts ecosystem.config.cjs; do
  [ -f "$STAGING/unpack/$f" ] && mv -f "$STAGING/unpack/$f" "$APP_DIR/$f"
done

echo "==> Atualizando prisma e public..."
rm -rf "$APP_DIR/prisma" 2>/dev/null || sudo rm -rf "$APP_DIR/prisma"
rm -rf "$APP_DIR/public"  2>/dev/null || sudo rm -rf "$APP_DIR/public"
[ -d "$STAGING/unpack/prisma" ] && mv "$STAGING/unpack/prisma" "$APP_DIR/prisma"
[ -d "$STAGING/unpack/public" ] && mv "$STAGING/unpack/public" "$APP_DIR/public"

echo "==> Movendo node_modules do staging para APP_DIR..."
rm -rf "$APP_DIR/node_modules" 2>/dev/null || sudo rm -rf "$APP_DIR/node_modules"
mv "$STAGING/unpack/node_modules" "$APP_DIR/node_modules"

# Limpa staging
rm -rf "$STAGING/unpack"

cd "$APP_DIR"

echo "==> Gerando Prisma Client..."
npx prisma generate

echo "==> Executando migrações do banco..."
# DATABASE_URL lida do .env.production.local já presente no servidor
DATABASE_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)
export DATABASE_URL
npx prisma migrate deploy

echo "==> Reiniciando PM2..."
# PM2 pode estar rodando sob root — tenta sem sudo primeiro, fallback para sudo
if pm2 list 2>/dev/null | grep -q "quantum-agency"; then
  pm2 reload ecosystem.config.cjs --update-env \
    || sudo pm2 reload ecosystem.config.cjs --update-env
elif sudo pm2 list 2>/dev/null | grep -q "quantum-agency"; then
  sudo pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs \
    || sudo pm2 start ecosystem.config.cjs
fi
pm2 save 2>/dev/null || sudo pm2 save

# Garante que www-data (Nginx) pode atravessar /home/deploy para servir estáticos do disco
chmod 751 /home/deploy

echo "==> Deploy concluído com sucesso!"
pm2 list
