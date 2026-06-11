# Solution Architecture Document

## Overview
RetailEdge Omnichannel Commerce Cloud (ReOm.Co) is an enterprise-grade web application designed to manage operational workflows, reporting, role-based access, and system monitoring.

## System Components

### 1. Frontend
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Styling**: Bootstrap 5
- **Data Fetching**: TanStack Query
- **Charting**: Chart.js

### 2. Backend
- **Platform**: Node.js
- **Framework**: Express.js with TypeScript
- **Process Manager**: PM2 (Cluster Mode for native load balancing)
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT & bcrypt

### 3. Database
- **Engine**: PostgreSQL
- **Hosting**: Neon
- **Features**: Relational data modeling for users, tasks, approvals, reporting, and auditing.

### 4. Infrastructure & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server/Reverse Proxy**: Nginx
- **Cloud Provider**: AWS
- **Key AWS Services**: EC2 (Compute), S3 (Backups), IAM (Security), CloudWatch (Monitoring), VPC (Networking)

## High-Level Architecture Flow
1. **Client** (Browser) accesses the frontend via **Nginx** acting as a reverse proxy.
2. The **Frontend** authenticates and interacts with the **Backend REST API**.
3. The **Backend** processes requests, enforces RBAC, and communicates with the **PostgreSQL (Neon)** database via Prisma ORM.
4. The entire stack (except the hosted Neon database) is containerized via **Docker** and deployed on **AWS EC2** within a secure **VPC**.
5. Automated scripts handle backups (to **AWS S3**) and deployments.
6. **AWS CloudWatch** aggregates logs and monitors system metrics.
