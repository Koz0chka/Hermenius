#!/bin/bash

set -e

DOMAIN=${1:-"hermenius.kozochka.org"}
EMAIL=${2:-""}

if [ "$EUID" -ne 0 ]; then
    echo "Запусти через sudo: sudo bash deploy/setup.sh $DOMAIN"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "  Hermenius — Настройка VPS"
echo "  Домен: $DOMAIN"
echo "  Папка проекта: $PROJECT_DIR"
echo "========================================"

# ===================== 1. СИСТЕМА =====================
echo ""
echo "[1/6] Обновление системы..."
apt-get update -y && apt-get upgrade -y

# ===================== 2. DOCKER =====================
echo ""
echo "[2/6] Установка Docker..."

if ! command -v docker &> /dev/null; then
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
    echo "   Docker уже установлен: $(docker --version)"
fi

if ! docker compose version &> /dev/null; then
    apt-get install -y docker-compose-plugin
fi

echo "   Docker: $(docker --version)"
echo "   Compose: $(docker compose version)"

# ===================== 3. NGINX =====================
echo ""
echo "[3/6] Установка Nginx..."

if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
else
    echo "   Nginx уже установлен"
fi

if [ -f "$SCRIPT_DIR/nginx.conf" ]; then
    cp "$SCRIPT_DIR/nginx.conf" /etc/nginx/sites-available/hermenius
    ln -sf /etc/nginx/sites-available/hermenius /etc/nginx/sites-enabled/hermenius
    rm -f /etc/nginx/sites-enabled/default
    mkdir -p /var/www/certbot
    echo "   Конфиг установлен"
else
    echo "   ОШИБКА: deploy/nginx.conf не найден!"
    exit 1
fi

# ===================== 4. ФАЕРВОЛ =====================
echo ""
echo "[4/6] Настройка фаервола (UFW)..."

if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    echo "   Порты: 22 (SSH), 80 (HTTP), 443 (HTTPS)"
else
    echo "   UFW не найден, пропускаем"
fi

# ===================== 5. SSL =====================
echo ""
echo "[5/6] SSL сертификат (Let's Encrypt)..."

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
    echo "   Сертификат получен!"
else
    echo "   Сертификат не получен. Проверь:"
    echo "   - DNS A-запись $DOMAIN → $(curl -s ifconfig.me 2>/dev/null || echo '?')"
    echo "   - Потом запусти: sudo certbot certonly --nginx -d $DOMAIN"
fi

# ===================== 6. ЗАПУСК =====================
echo ""
echo "[6/6] Финал..."

systemctl start nginx
systemctl enable nginx

echo ""
echo "========================================"
echo "  Настройка завершена!"
echo "========================================"
echo ""
echo "  1. Создайте .env:"
echo "     cd $PROJECT_DIR"
echo "     cp .env.example .env"
echo "     nano .env  # OPENROUTER_API_KEY"
echo ""
echo "  2. Запустите:"
echo "     docker compose up -d --build"
echo ""
echo "  3. Логи:"
echo "     docker compose logs -f"
echo ""
echo "  4. Проверьте:"
echo "     curl https://$DOMAIN"
echo ""
echo "  5. Автообновление SSL (cron):"
echo "     echo '0 3 * * * certbot renew --quiet && systemctl reload nginx' | sudo tee /etc/cron.d/certbot-renew"
echo ""
