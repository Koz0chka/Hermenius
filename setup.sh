#!/bin/bash
# Hermenius — Быстрый запуск
# Запуск: sudo bash setup.sh [domain] [email]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/deploy/setup.sh" ]; then
    exec bash "$SCRIPT_DIR/deploy/setup.sh" "$@"
else
    echo "deploy/setup.sh не найден. Запусти напрямую:"
    echo "  sudo bash deploy/setup.sh hermenius.kozochka.org"
    exit 1
fi
