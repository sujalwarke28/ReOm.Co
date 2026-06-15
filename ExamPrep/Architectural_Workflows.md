# Exam Prep: Architectural Workflows

This document visualizes and describes the step-by-step logic workflows that occur inside the **RetailEdge Omnichannel Commerce Cloud (ReOm.Co)** platform.

---

## 1. User Request Routing Workflow

This flow shows how a web browser accesses the dashboard and retrieves data from the private database.

```mermaid
sequenceDiagram
    autonumber
    actor User as Web Browser
    participant ALB as Application Load Balancer (Public)
    participant Nginx as Frontend Nginx Container (Private)
    participant Express as Backend Node/PM2 Cluster (Private)
    participant Prisma as Prisma Client
    participant RDS as RDS MySQL Database (Private Subnet)

    User->>ALB: HTTP/HTTPS Request (e.g., GET /dashboard)
    ALB->>Nginx: Route request to EC2 target group (Port 80)
    Nginx->>User: Serve static React files (index.html, js, css)
    Note over User, Nginx: React loads, user requests API data
    User->>ALB: GET /api/dashboard/kpis (Authorization: Bearer <token>)
    ALB->>Express: Forward request to PM2 Cluster (Port 3000)
    Express->>Prisma: Invoke query builder (prisma.task.count)
    Prisma->>RDS: SQL queries over Private subnet connection (Port 3306)
    RDS-->>Prisma: Return query results
    Prisma-->>Express: Map SQL columns to TypeScript objects
    Express-->>ALB: Return JSON response
    ALB-->>User: Deliver API payload to client
```

---

## 2. Authentication & RBAC Guard Workflow

This workflow represents the request lifecycle checking for token signature and role-based permissions.

```mermaid
flowchart TD
    A[Client Request] --> B{JWT Token present in header?}
    B -- No --> C[Return 401 Unauthorized]
    B -- Yes --> D[Extract Authorization: Bearer token]
    D --> E{Verify signature using JWT_SECRET?}
    E -- Invalid / Expired Signature --> F[Return 401 Session Expired]
    E -- Valid Signature --> G[Decode Payload: user_id & role]
    G --> H{Does user role match required route role?}
    H -- No --> I[Return 403 Forbidden]
    H -- Yes --> J[Execute API Endpoint & return DB record]
```

---

## 3. Real-Time Push Notification Workflow (SSE)

This diagram shows how Server-Sent Events allow real-time UI updates (like new tasks) without continuous HTTP polling.

```mermaid
sequenceDiagram
    autonumber
    actor Assignee as Assignee (Ops Staff)
    actor Creator as Creator (Manager)
    participant Server as Backend Express Server
    participant DB as RDS Database

    Assignee->>Server: Establish persistent stream (GET /api/notifications/stream)
    Note over Assignee, Server: SSE channel remains open
    Creator->>Server: Create Task (POST /api/tasks, assigned_to: ops_user)
    Server->>DB: Save new task record
    DB-->>Server: Confirm write successful
    Server->>Server: Fetch active SSE socket for ops_user
    Server-->>Assignee: Stream event: { type: 'TASK', message: 'New task assigned' }
    Note over Assignee: React Toast pops up instantly with slide-in animation!
```

---

## 4. Automated S3 Database Backup Workflow

This flow shows how the automated shell script securely copies database dumps into off-site Amazon S3 storage.

```mermaid
flowchart LR
    A[Cron Daemon] -- Trigger daily at 2:00 AM --> B[Execute backup.sh]
    B --> C[Read credentials from apps/backend/.env]
    C --> D[Run mysqldump locked-free against RDS]
    D --> E[Save local backup.sql]
    E --> F[Compress to backup.sql.tar.gz via gzip]
    F --> G[Upload to S3 Bucket via AWS CLI]
    G --> H[Prune local backup files older than 7 days]
```
