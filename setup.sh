#!/bin/bash
# Hermenius — Настройка VPS
# Запуск: sudo bash setup.sh hermenius.kozochka.org

set -e

DOMAIN=${1:-"hermenius.kozochka.org"}
EMAIL=${2:-""}

if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите через sudo"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_CONF="$SCRIPT_DIR/nginx.conf"

echo "========================================"
echo "  Hermenius — Настройка VPS"
echo "  Домен: $DOMAIN"
echo "  Папка: $SCRIPT_DIR"
echo "========================================"

# 1. Система
echo ""
echo "  [1/6] Обновление системы..."
apt-get update -y && apt-get upgrade -y

# 2. Docker
echo ""
echo "  [2/6] Установка Docker..."
if ! command -v docker &> /dev/null; then
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
echo "  Docker: $(docker --version)"
echo "  Compose: $(docker compose version)"

# 3. Nginx
echo ""
echo "  [3/6] Установка Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
fi

# Копируем конфиг
if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" /etc/nginx/sites-available/hermenius
    echo "  Конфиг скопирован из $NGINX_CONF"
elif [ -f "$SCRIPT_DIR/deploy/nginx.conf" ]; then
    cp "$SCRIPT_DIR/deploy/nginx.conf" /etc/nginx/sites-available/hermenius
    echo "  Конфиг скопирован из deploy/nginx.conf"
else
    echo "  nginx.conf не найден! Поместите его рядом с setup.sh"
    exit 1
fi

ln -sf /etc/nginx/sites-available/hermenius /etc/nginx/sites-enabled/hermenius
rm -f /etc/nginx/sites-enabled/default
mkdir -p /var/www/certbot
systemctl enable nginx
echo "  Nginx настроен"

# 4. Фаервол
echo ""
echo "  [4/6] Фаервол..."
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    echo "  Порты: 22, 80, 443"
else
    echo "  UFW не найден"
fi

# 5. SSL
echo ""
echo "  [5/6] SSL сертификат..."

systemctl stop nginx 2>/dev/null || true

if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
fi

CERTBOT_ARGS="certonly --standalone -d $DOMAIN --agree-tos --non-interactive"
if [ -n "$EMAIL" ]; then
    CERTBOT_ARGS="$CERTBOT_ARGS -m $EMAIL"
else
    CERTBOT_ARGS="$CERTBOT_ARGS --register-unsafely-without-email"
fi

certbot $CERTBOT_ARGS || true

CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
if [ -f "$CERT_PATH" ]; then
    echo "  Сертификат получен!"
else
    echo "  Сертификат не получен"
    echo "  Проверьте:"
    echo "  - DNS A-запись $DOMAIN → $(curl -s ifconfig.me)"
    echo "  - Потом запустите: sudo certbot certonly --nginx -d $DOMAIN"
fi

# 6. Финал
echo ""
echo "  [6/6] Финал..."
systemctl start nginx
systemctl enable nginx

echo ""
echo "========================================"
echo "  Готово!"
echo "========================================"
echo ""
echo "  1. Заполните .env:"
echo "     cd $SCRIPT_DIR && nano .env"
echo ""
echo "  2. Запустите:"
echo "     docker compose up -d --build"
echo ""
echo "  3. Проверьте:"
echo "     curl -k https://$DOMAIN"
echo ""
echo "  4. Включите автообновление SSL:"
echo "     echo '0 3 * * * certbot renew --quiet && systemctl reload nginx' | sudo tee /etc/cron.d/certbot-renew"
