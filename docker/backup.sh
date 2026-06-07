#!/bin/sh
# pg_dump backup with rotation. Invoked by cron (see docker-compose backup service).
set -e

TS=$(date +%Y%m%d-%H%M%S)
OUT="/backups/${POSTGRES_DB}-${TS}.sql.gz"

echo "[$(date)] Dumping ${POSTGRES_DB} -> ${OUT}"
pg_dump -h "${PGHOST:-db}" -U "${POSTGRES_USER}" "${POSTGRES_DB}" | gzip > "${OUT}"

# Rotate: delete dumps older than BACKUP_KEEP_DAYS.
KEEP=${BACKUP_KEEP_DAYS:-14}
find /backups -name "${POSTGRES_DB}-*.sql.gz" -type f -mtime +"${KEEP}" -delete
echo "[$(date)] Done. Kept last ${KEEP} days."
