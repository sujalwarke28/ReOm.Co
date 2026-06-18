# Deployment Architecture

## Overview
The deployment process uses Docker containerization and Nginx as a reverse proxy, preparing the application for Linux administration and cloud scaling.

## Containerization Strategy
- **Frontend Container**: Builds the React application and serves static assets.
- **Backend Container**: Runs the Node.js Express server.
- **Network**: A custom Docker bridge network connects the backend and frontend.

## Nginx Configuration
Nginx acts as the primary entry point:
- Listens on port 80 (HTTP) or 443 (HTTPS in production).
- Routes `/api/*` traffic to the Backend Node.js container.
- Serves the Frontend React static build for all other routes.

## Deployment Automation
Shell scripts will manage lifecycle tasks:
- `deploy.sh`: Pulls latest code, builds Docker images, and restarts containers via `docker-compose`.
- `healthcheck.sh`: Verifies that containers and endpoints are responding correctly.
- `backup.sh`: Dumps the database and pushes the archive to AWS S3.

## Environment Variables
A centralized `.env` file will manage:
- Database connection strings (AWS RDS).
- JWT Secrets.
- Port configurations.
- Cloud provider credentials (AWS Access Keys).
