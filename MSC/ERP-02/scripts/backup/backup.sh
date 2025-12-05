#!/usr/bin/env bash
set -euo pipefail

# Simple SQL Server backup script using sqlcmd client
# Environment variables expected:
#   SA_PASSWORD - SA password for SQL Server
#   MSSQL_HOST - hostname of SQL Server (default: sqlserver)
#   MSSQL_PORT - port (default: 1433)
#   DB_NAME - database name to backup (default: erpdb)
#   BACKUP_PATH - path on SQL Server container where backups will be written (default: /var/opt/mssql/backups)

SA_PASSWORD=${SA_PASSWORD:-"Your_password123"}
MSSQL_HOST=${MSSQL_HOST:-"sqlserver"}
MSSQL_PORT=${MSSQL_PORT:-1433}
DB_NAME=${DB_NAME:-"erpdb"}
BACKUP_PATH=${BACKUP_PATH:-/var/opt/mssql/backups}

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${DB_NAME}__${TIMESTAMP}.bak"
REMOTE_PATH="${BACKUP_PATH}/${FILENAME}"

echo "[backup] Starting backup for database '${DB_NAME}' to '${REMOTE_PATH}'"

if ! command -v sqlcmd >/dev/null 2>&1; then
  echo "sqlcmd not found in PATH" >&2
  exit 2
fi

# Run BACKUP DATABASE command on the SQL Server instance. The path must be accessible by the SQL Server process.
SQL="BACKUP DATABASE [${DB_NAME}] TO DISK = N'${REMOTE_PATH}' WITH FORMAT, INIT, NAME = N'Full backup ${DB_NAME}';"

/opt/mssql-tools/bin/sqlcmd -S ${MSSQL_HOST},${MSSQL_PORT} -U SA -P "${SA_PASSWORD}" -Q "${SQL}"

rc=$?
if [ $rc -ne 0 ]; then
  echo "[backup] Backup command failed with exit code $rc" >&2
  exit $rc
fi

echo "[backup] Backup finished successfully: ${FILENAME}"
