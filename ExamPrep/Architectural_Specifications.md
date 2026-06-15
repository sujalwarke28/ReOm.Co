# Exam Prep: Architectural Specifications

This document outlines the detailed specifications of the system components, networking layers, compute instances, and storage profiles built for the **RetailEdge Omnichannel Commerce Cloud (ReOm.Co)** platform.

---

## 💻 1. Compute & Virtual Machines (EC2)

| Parameter | Specification | Purpose / Rationale |
|---|---|---|
| **Instance Type** | `t3.micro` (Dev/Test) / `t3.medium` (Production) | Fits AWS Free Tier for testing; cluster mode scales to medium dual-cores in production. |
| **Operating System** | Ubuntu Server 22.04 LTS (HVM) | Standardized, secure Linux server kernel with built-in systemd process managers. |
| **Virtual Cores (vCPUs)** | 2 vCPUs (`t3.medium`) | Supports Node.js PM2 process clustering across multiple execution cores. |
| **System Memory (RAM)** | 4 GiB (`t3.medium`) | Prevents out-of-memory errors during Docker build stages. |
| **EBS Storage Volume** | 30 GB gp3 SSD (3000 IOPS, 125 MB/s) | High-speed root partition for fast container builds and logs. |
| **Process Manager** | PM2 (v7.0+) Run in Cluster Mode | Automates server load balancing across active CPU threads. |

---

## 🗄️ 2. Database Services (RDS MySQL)

| Parameter | Specification | Purpose / Rationale |
|---|---|---|
| **Database Engine** | MySQL Community Edition 8.0.42 | Relational engine that supports transaction isolation levels and foreign keys. |
| **DB Instance Class** | `db.t3.medium` (Production) | Allocation of dedicated RAM and CPU threads. |
| **Multi-AZ Deployment** | Enabled (Active-Passive replication) | Automates failover to a different Availability Zone (AZ) during server outages. |
| **EBS Storage** | 20 GB General Purpose SSD (gp3) | SSD backing storage for transactional logs. |
| **Connection Pooling** | Managed via Prisma client | Prevents database exhaustion by reusing active connections. |
| **Access Control** | Restricted Subnets Group | Completely locked inside private subnets; unreachable from the public internet. |

---

## 📂 3. Storage Profile (S3)

| Parameter | Specification | Purpose / Rationale |
|---|---|---|
| **Storage Class** | Amazon S3 Standard / S3 Glacier | Low latency retrieval for recent backups; transitions to cold archive for legacy logs. |
| **Bucket Policy** | Private Access Only | Blocks public read access; strictly enforces SSL transport. |
| **IAM Authentication** | IAM Instance Profile | The EC2 host communicates using temporary AWS security credentials instead of hardcoded keys. |
| **Backup Compression** | `.tar.gz` (gzip level 9) | Optimizes bandwidth during backups. |

---

## 🌐 4. Networking & VPC Topology

| Parameter | Specification | Purpose / Rationale |
|---|---|---|
| **VPC CIDR Block** | `10.0.0.0/16` (65,536 private IP space) | Creates a logically isolated private network. |
| **Subnet Partitioning** | 2x Public (`/24`), 2x Private App (`/24`), 2x Private DB (`/24`) | Strict physical partitioning of resources based on public accessibility. |
| **Internet Gateway (IGW)** | Attached to VPC | Connects the VPC public subnet routing tables to the internet. |
| **NAT Gateway** | Provisioned in Public Subnet | Safely routes outbound internet queries from private subnets. |
| **Application Load Balancer** | Layer 7 AWS ALB | Distributes user requests and terminates SSL/TLS (HTTPS to HTTP). |

---

## 🔒 5. Security & Authentication

| Parameter | Specification | Purpose / Rationale |
|---|---|---|
| **Token Authentication** | JSON Web Token (JWT) with HS256 | Stateless API routing; cryptographically signed session tokens. |
| **Password Encryption** | `bcrypt` hashing with salt (10 rounds) | Secure crypt-hashes that resist rainbow table and brute-force attacks. |
| **Access Guard** | Express Middleware & Protected Routes | Role-based gatekeeping limiting API payloads according to RBAC values. |
| **Session Lifetime** | 8 Hours | Limits token hijacking vulnerability windows. |
