#!/bin/bash
# =============================================================================
# domain-setup.sh — Configurar domínio real + HTTPS (Let's Encrypt / Certbot)
# Domínio: quantumtechwld.com
# EC2:     15.228.226.69
#
# PRÉ-REQUISITO: DNS já propagado (registro A apontando para 15.228.226.69)
# Executar na EC2 como root:  sudo bash domain-setup.sh
# =============================================================================
set -euo pipefail

DOMAIN="quantumtechwld.com"
WWW_DOMAIN="www.quantumtechwld.com"
EMAIL_CERTBOT="admin@quantumtechwld.com"   # e-mail para alertas de renovação
NGINX_CONF="/etc/nginx/sites-available/quantum-agency"

echo ">>> [1/4] Instalando Certbot + plugin Nginx..."
apt-get update -y
apt-get install -y certbot python3-certbot-nginx

echo ">>> [2/4] Configurando Nginx (HTTP simples — certbot adicionará SSL)..."
cat > "$NGINX_CONF" << NGINX
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;

    # Logs
    access_log /var/log/nginx/quantum-agency.access.log;
    error_log  /var/log/nginx/quantum-agency.error.log;

    # Proxy para Next.js
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }

    # Cache de assets estáticos
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINX

# Garantir symlink ativo
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/quantum-agency
nginx -t && systemctl reload nginx
echo "    Nginx HTTP configurado."

echo ">>> [3/4] Emitindo certificado SSL com Certbot..."
certbot --nginx \
    -d "$DOMAIN" \
    -d "$WWW_DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL_CERTBOT" \
    --redirect

# Adicionar headers de segurança ao bloco HTTPS gerado pelo certbot
HTTPS_CONF="/etc/nginx/sites-available/quantum-agency"
if ! grep -q "Strict-Transport-Security" "$HTTPS_CONF"; then
    sed -i '/listen 443 ssl;/a\    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;\n    add_header X-Frame-Options "SAMEORIGIN" always;\n    add_header X-Content-Type-Options "nosniff" always;\n    add_header Referrer-Policy "strict-origin-when-cross-origin" always;' "$HTTPS_CONF"
    nginx -t && systemctl reload nginx
fi

echo ">>> [4/4] Verificando renovação automática..."
systemctl enable certbot.timer
systemctl start certbot.timer
certbot renew --dry-run

echo ""
echo "================================================================"
echo "  Domínio configurado com sucesso!"
echo "================================================================"
echo "  https://$DOMAIN"
echo "  https://$WWW_DOMAIN"
echo ""
echo "  PRÓXIMOS PASSOS:"
echo "  1. Atualize o GitHub Secret AUTH_URL para:"
echo "     https://$DOMAIN"
echo "  2. Acione novo deploy (push vazio) para aplicar:"
echo "     git commit --allow-empty -m 'chore: update AUTH_URL to domain'"
echo "     git push origin main"
echo "================================================================"
