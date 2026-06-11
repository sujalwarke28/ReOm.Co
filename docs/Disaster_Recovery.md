# Disaster Recovery & Backup Procedures

This document outlines the backup automation and disaster recovery procedures for the ReOm.Co platform.

## 1. Automated Backups

The system uses a shell script (`scripts/backup.sh`) to automate database dumps. This script creates a full `.sql` dump using `pg_dump`, compresses it, and prunes local files older than 7 days.

### Setting up the Cron Job

A Linux Administrator must configure this script to run nightly during off-peak hours (e.g., 2:00 AM UTC).

1. Make the script executable:
   ```bash
   chmod +x /path/to/reomco/scripts/backup.sh
   ```

2. Open the crontab for the database user (or root):
   ```bash
   crontab -e
   ```

3. Add the following entry to execute the backup every day at 2:00 AM. Ensure the `PGPASSWORD` variable is set if `~/.pgpass` is not configured.
   ```bash
   0 2 * * * PGPASSWORD="your_secure_password" /path/to/reomco/scripts/backup.sh >> /var/log/reomco_backup.log 2>&1
   ```

## 2. Cloud Off-site Backups (AWS S3)

To protect against total instance failure, backups must be pushed off-site. The `backup.sh` script includes a commented-out AWS CLI command.

### Enabling S3 Uploads
1. Attach an **IAM Role** to the EC2 instance with `s3:PutObject` permissions for the target bucket.
2. Uncomment the following lines in `scripts/backup.sh`:
   ```bash
   aws s3 cp "$TAR_FILE" "$S3_BUCKET"
   ```

## 3. Disaster Recovery (Restore Procedure)

If a catastrophic database failure occurs, follow these steps to restore from the latest backup.

### Step 1: Retrieve the Backup
If the instance is lost, retrieve the latest backup from S3 to a newly provisioned server:
```bash
aws s3 cp s3://reomco-db-backups-prod/postgres/reomco_backup_YYYYMMDD_HHMMSS.sql.tar.gz .
```

### Step 2: Extract the Backup
```bash
tar -xzvf reomco_backup_YYYYMMDD_HHMMSS.sql.tar.gz
```

### Step 3: Recreate the Database
```bash
dropdb -U reomco_admin -h localhost reomco_db
createdb -U reomco_admin -h localhost reomco_db
```

### Step 4: Restore the Data
Use `psql` to import the `.sql` dump into the fresh database:
```bash
psql -U reomco_admin -h localhost -d reomco_db -f reomco_backup_YYYYMMDD_HHMMSS.sql
```

Verify that the application backend successfully reconnects and functions properly.
