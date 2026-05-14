#!/bin/bash
# =============================================================================
# vps-domain-setup.sh — Configurar domínio + HTTPS (Let's Encrypt / Certbot)
# Domínio: quantumtechwld.com
# VPS:     69.6.243.198 (HostGator)
#
# PRÉ-REQUISITO: DNS já propagado (A record apontando para 69.6.243.198)
# Verificar:  nslookup quantumtechwld.com 8.8.8.8
# Executar:   ssh -p 22022 root@69.6.243.198
#             bash vps-domain-setup.sh
# =============================================================================
set -euo pipefail

DOMAIN="quantumtechwld.com"
WWW_DOMAIN="www.quantumtechwld.com"
EMAIL_CERTBOT="contato@quantumtechwld.com"
NGINX_CONF="/etc/nginx/sites-available/quantum-agency"

echo ">>> [1/4] Instalando Certbot + plugin Nginx..."
apt-get update -y
apt-get install -y certbot python3-certbot-nginx

echo ">>> [2/4] Configurando Nginx (HTTP simples — certbot adicionará HTTPS)..."
cat > "$NGINX_CONF" << NGINX
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;

    access_log /var/log/nginx/quantum-agency.access.log;
    error_log  /var/log/nginx/quantum-agency.error.log;

    large_client_header_buffers 8 32k;
    client_header_buffer_size   4k;

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
        proxy_buffer_size          128k;
        proxy_buffers              4 256k;
        proxy_busy_buffers_size    256k;
    }

    # Assets estáticos servidos direto do disco (retorna 404, não 500, para chunks obsoletos)
    location /_next/static/ {
        alias /home/deploy/quantum-agency/.next/static/;
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }
}
NGINX

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

# Adicionar headers de segurança ao bloco HTTPS
if ! grep -q "Strict-Transport-Security" "$NGINX_CONF"; then
    sed -i '/listen 443 ssl;/a\    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;\n    add_header X-Frame-Options "SAMEORIGIN" always;\n    add_header X-Content-Type-Options "nosniff" always;\n    add_header Referrer-Policy "strict-origin-when-cross-origin" always;' "$NGINX_CONF"
    nginx -t && systemctl reload nginx
fi

echo ">>> [4/4] Verificando renovação automática do certificado..."
systemctl enable certbot.timer
systemctl start certbot.timer
certbot renew --dry-run

echo ""
echo "================================================================"
echo "  SSL configurado com sucesso!"
echo "  Domínio: https://$DOMAIN"
echo ""
echo "  PRÓXIMOS PASSOS:"
echo "  1. Atualizar AUTH_URL no GitHub Secrets:"
echo "     AUTH_URL=https://quantumtechwld.com"
echo "  2. Atualizar webhook Stripe para:"
echo "     https://quantumtechwld.com/api/webhooks/stripe"
echo "  3. Fazer push para disparar deploy com nova AUTH_URL"
echo "  4. Desligar EC2 AWS (aguardar 7 dias de validação antes)"
echo "================================================================"
