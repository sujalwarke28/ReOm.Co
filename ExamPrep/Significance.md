# Exam Prep: Technical Significance & Architecture Rationale

This document explains **why** we chose these specific technologies, architectures, and strategies to build **RetailEdge Omnichannel Commerce Cloud (ReOm.Co)**, outlining the industrial significance of each choice.

---

## 1. Significance of Network Isolation (VPC Public/Private Subnets)
- **Challenge**: Storing transactional sales records and employee logins in a database open to the public internet invites brute-force attempts and database server exploits.
- **Significance**: By separating our AWS infrastructure into public subnets (DMZ) and private subnets, we shield our primary storage layer.
  - The **Application Load Balancer (ALB)** stands in the public gateway as the *only* entry point, shielding the web servers.
  - The **RDS MySQL Database** sits in a private subnet group with zero public routing. It is accessible *only* by security group rules mapping to our compute instance, eliminating 99% of external networking exploit vectors.

---

## 2. Significance of Containerization (Docker & Compose)
- **Challenge**: Deploying complex full-stack apps natively on virtual servers often leads to "dependency hell" (version mismatches, package library conflicts, system state pollution).
- **Significance**: Containerizing our frontend and backend packages guarantees environmental consistency:
  - The exact same code container that builds and passes on a local laptop runs identically on the AWS Ubuntu EC2 host.
  - **Docker Compose** orchestrates port forwarding, environment injections, and sets up isolated virtual networks, allowing quick horizontal clustering and simple cleanup without leaving residues on the host server.

---

## 3. Significance of Node.js PM2 Process Clustering
- **Challenge**: Node.js operates on a single-threaded event loop. If a virtual machine has 4 CPU cores, running `node index.js` natively uses only 1 CPU core, leaving 75% of processing power idle.
- **Significance**: We configured **PM2 in Cluster Mode** to launch multiple API application instances mapping to the available cores.
  - It handles native load balancing across processes.
  - It guarantees zero-downtime reloads.
  - If one backend worker process crashes due to an unhandled exception, PM2 instantly spawns a new instance, keeping the store live.

---

## 4. Significance of Relational Database Migration (RDS MySQL)
- **Challenge**: Hosting databases locally on the application server (e.g. SQLite or host-installed MySQL) competes with the API server for RAM and disk IOPS, and creates a single point of failure (if the server crashes, database data can corrupt).
- **Significance**: Moving to **AWS RDS MySQL** separates compute from storage.
  - **Multi-AZ Availability**: Automatically mirrors transactions to another datacenter region, ensuring instant failover with no downtime.
  - **Managed Backups**: Automates point-in-time recovery and handles server patching.

---

## 5. Significance of Type-Safe Database Mapping (Prisma ORM)
- **Challenge**: Writing SQL queries as text strings in application code makes it prone to syntax mistakes, missing table references, or SQL injection attacks.
- **Significance**: **Prisma ORM** creates a type-safe database client based on the schemas.
  - It catches errors during compilation rather than runtime.
  - It automatically formats queries to prevent SQL injection.
  - Features connection pooling to reuse active database connections, preventing thread exhaustion under heavy traffic.

---

## 6. Significance of Server-Sent Events (SSE)
- **Challenge**: Real-time push updates (like order requests or task assignments) are often implemented using resource-intensive AJAX polling, which hammers the server with thousands of empty HTTP requests every minute.
- **Significance**: We implemented unidirectional **Server-Sent Events (SSE)**.
  - The client keeps one open HTTP connection.
  - The backend pushes notifications instantly when database status changes.
  - This reduces network overhead, conserves battery/resources, and provides standard real-time user experiences.

---

## 7. Significance of Automated Off-Site Backups
- **Challenge**: Local backups (saving dumps on the host server disk) are useless if the server hardware dies or suffers ransomware encryption.
- **Significance**: The [backup.sh](file:///Users/sujalwarke/Desktop/sem4PROJECTS/scripts/backup.sh) script coupled with Linux **cron** automates off-site synchronization.
  - Copying compressed archives to an isolated **S3 Bucket** ensures that even if the host EC2 instance is completely destroyed, we can spin up a new server and restore transactions from S3 within our 2-hour RTO (Recovery Time Objective).

---

## 8. Significance of Dual-Theme Premium UI
- **Challenge**: orthodox UI templates look generic and hurt user adoption, while dark-only styles are hard to read in bright outdoor environments (e.g. field retail staff).
- **Significance**: We styled ReOm.Co with a premium, theme-toggled, human-centric design system:
  - Enforces accessibility compliance through theme state contrast updates.
  - The light theme offers optimal legibility during day operations, while the dark theme is designed to reduce eye strain in warehouse or night-shift workspaces.
