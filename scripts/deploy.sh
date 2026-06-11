#!/bin/bash

# ==============================================================================
# ReOm.Co Automated Deployment Script
# This script is intended to be executed on the production Linux server.
# It pulls the latest code, rebuilds Docker containers, and restarts services.
# ==============================================================================

set -e

APP_DIR="/opt/reomco"

echo "======================================"
echo " Starting ReOm.Co Deployment Sequence "
echo " Date: $(date)                        "
echo "======================================"

# Ensure script is run from the correct directory
cd "$APP_DIR" || { echo "Directory $APP_DIR not found. Exiting."; exit 1; }

# 1. Rebuild the containers (frontend and backend) without cache
echo "[1/4] Rebuilding Docker containers..."
docker-compose build --no-cache

# 2. Restart the application stack (Docker Compose handles graceful recreation)
echo "[2/4] Restarting the application stack..."
docker-compose up -d

# 3. Prune dangling Docker images to free up disk space
echo "[3/4] Cleaning up old Docker images..."
docker image prune -f

# 4. Check status of running containers
echo "[4/4] Verifying service status..."
docker-compose ps

echo "======================================"
echo " Deployment Sequence Completed.       "
echo "======================================"
