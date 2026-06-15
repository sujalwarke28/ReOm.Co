#!/bin/bash
# RetailEdge Omnichannel Commerce Cloud - Automated Backup Script
# This script extracts credentials from the Prisma DATABASE_URL, dumps the MySQL database, and uploads it to S3.

# Navigate to the directory where this script resides, then go to the backend to find the .env
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ENV_FILE="$SCRIPT_DIR/../apps/backend/.env"

if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set in $ENV_FILE"
  exit 1
fi

# The user must configure their S3 bucket name here
S3_BUCKET="s3://retailedge-db-backups-bucket/daily/"

# Parse the MySQL connection string (mysql://user:password@host:port/dbname)
DB_USER=$(echo "$DATABASE_URL" | sed -e 's,^mysql://\([^:]*\).*,\1,')
DB_PASS=$(echo "$DATABASE_URL" | sed -e 's,^mysql://[^:]*:\([^@]*\).*,\1,')
DB_HOST=$(echo "$DATABASE_URL" | sed -e 's,^mysql://[^@]*@\([^:/]*\).*,\1,')
DB_PORT=$(echo "$DATABASE_URL" | sed -e 's,^mysql://[^@]*@[^:]*:\([^/]*\).*,\1,')
DB_NAME=$(echo "$DATABASE_URL" | sed -e 's,^mysql://[^/]*/\([^?]*\).*,\1,')

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="/tmp/retailedge_db_$TIMESTAMP.sql.gz"

echo "Starting database backup for $DB_NAME at $DB_HOST..."

# Dump the database and compress it
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" --single-transaction --quick --lock-tables=false "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup successfully created: $BACKUP_FILE"
  echo "Uploading to S3 bucket: $S3_BUCKET..."
  
  # Requires AWS CLI to be configured or an IAM Role attached to the EC2 instance
  aws s3 cp "$BACKUP_FILE" "$S3_BUCKET"
  
  if [ $? -eq 0 ]; then
    echo "Upload successful! Cleaning up local file..."
    rm "$BACKUP_FILE"
  else
    echo "ERROR: Failed to upload to S3. Is the IAM Role attached?"
    exit 2
  fi
else
  echo "ERROR: mysqldump failed. Check credentials and database connectivity."
  exit 1
fi
