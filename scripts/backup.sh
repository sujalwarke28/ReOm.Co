#!/bin/bash

# ==============================================================================
# ReOm.Co Database Backup Script
# This script creates a compressed SQL dump of the PostgreSQL database,
# prunes local backups older than 7 days, and prepares an AWS S3 upload.
# ==============================================================================

# Exit immediately if a command exits with a non-zero status.
set -e

# Configuration variables
BACKUP_DIR="/var/backups/reomco/db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="reomco_db"
DB_USER="reomco_admin"
DB_HOST="localhost"
BACKUP_FILE="${BACKUP_DIR}/reomco_backup_${TIMESTAMP}.sql"
TAR_FILE="${BACKUP_FILE}.tar.gz"
S3_BUCKET="s3://reomco-db-backups-prod/postgres/"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup for database: $DB_NAME"

# 1. Dump the database
# Note: PGPASSWORD should be set in the environment or cron job
pg_dump -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -F p -f "$BACKUP_FILE"

echo "[$(date)] Backup file created at $BACKUP_FILE"

# 2. Compress the dump
tar -czvf "$TAR_FILE" -C "$BACKUP_DIR" $(basename "$BACKUP_FILE")
rm "$BACKUP_FILE" # Remove the uncompressed .sql file

echo "[$(date)] Backup compressed to $TAR_FILE"

# 3. Clean up old backups (older than 7 days)
echo "[$(date)] Pruning backups older than 7 days..."
find "$BACKUP_DIR" -type f -name "reomco_backup_*.tar.gz" -mtime +7 -exec rm {} \;

# 4. Upload to AWS S3 (Uncomment when IAM role is attached)
# echo "[$(date)] Uploading to AWS S3..."
# aws s3 cp "$TAR_FILE" "$S3_BUCKET"

echo "[$(date)] Backup process completed successfully."
