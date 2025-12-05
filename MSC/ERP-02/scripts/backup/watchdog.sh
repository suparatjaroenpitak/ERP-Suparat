#!/usr/bin/env bash
set -euo pipefail

# Simple loop that runs the backup script once per day.
SCRIPT_DIR=$(dirname "$0")
BACKUP_SH="$SCRIPT_DIR/backup.sh"

if [ ! -x "$BACKUP_SH" ]; then
  chmod +x "$BACKUP_SH" || true
fi

echo "[watchdog] Starting backup loop (runs every 24h)"
while true; do
  echo "[watchdog] Running backup at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  "$BACKUP_SH" || echo "[watchdog] Backup failed at $(date)"
  # Sleep 24 hours (86400s)
  sleep 86400
done
