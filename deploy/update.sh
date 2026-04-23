#!/usr/bin/env bash

set -euo pipefail

REPO_DIR="/home/kozochka/Hermenius"
REPO_URL="https://github.com/Kozochka/Hermenius.git"
BRANCH="master"
LOCK_FILE="/tmp/hermenius-update.lock"
STATE_FILE="/home/kozochka/Hermenius/.update-state"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE" 2>/dev/null)
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
        log "Already running (PID $PID), exiting."
        exit 0
    fi
    log "Stale lock file found (PID $PID not running), removing."
    rm -f "$LOCK_FILE"
fi
echo $$ > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

cd "$REPO_DIR" || { log "ERROR: Cannot cd to $REPO_DIR"; exit 1; }

BEFORE=$(git rev-parse HEAD)

log "Fetching from $REPO_URL ($BRANCH)..."
git fetch origin "$BRANCH" --quiet 2>/dev/null || {
    log "ERROR: git fetch failed"
    exit 1
}

LOCAL=$(git rev-parse "$BRANCH")
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
    log "Already up-to-date ($BEFORE)"
    exit 0
fi

NEW_COMMITS=$(git log --oneline "${BEFORE}..origin/${BRANCH}" 2>/dev/null | wc -l)
log "Found $NEW_COMMITS new commit(s). Updating..."

git reset --hard "origin/$BRANCH" --quiet

AFTER=$(git rev-parse HEAD)
log "Updated: ${BEFORE:0:8} -> ${AFTER:0:8}"

log "Rebuilding containers..."
docker compose build --quiet 2>&1 || {
    log "ERROR: docker compose build failed"
    exit 1
}

log "Restarting containers..."
docker compose up -d --quiet 2>&1 || {
    log "ERROR: docker compose up failed"
    exit 1
}

echo "$AFTER" > "$STATE_FILE"
log "Update complete. App is running on ${AFTER:0:8}"
