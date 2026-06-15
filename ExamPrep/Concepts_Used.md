# Exam Prep: Core Concepts Explained

This document details the architectural, networking, systems, and database concepts utilized to build and deploy the **RetailEdge Omnichannel Commerce Cloud (ReOm.Co)** platform.

---

## 1. Cloud Infrastructure & Networking Concepts

### Virtual Private Cloud (VPC)
- **Concept**: A logically isolated virtual network dedicated to your AWS account. It mimics a traditional physical network but with cloud-native scalability.
- **In Our Project**: The application resides in a VPC with the CIDR block `10.0.0.0/16`. This isolation prevents direct, unmonitored external access to our application components.

### Subnets (Public vs. Private)
- **Public Subnet**: Subnets associated with a Route Table that contains an entry routing outbound traffic directly to an **Internet Gateway (IGW)**. Used for load balancers (ALBs) or public Nginx jump hosts.
- **Private Subnet**: Subnets whose Route Tables do *not* contain a route to the IGW. Traffic can only leave the subnet using a **NAT Gateway**.
- **In Our Project**:
  - The Application Load Balancer resides in public subnets (`10.0.1.0/24` and `10.0.2.0/24`) to accept user requests.
  - The database (RDS MySQL) is sequestered in private subnets (`10.0.5.0/24` and `10.0.6.0/24`) to safeguard customer records from direct web exploits.

### Application Load Balancer (ALB)
- **Concept**: Routes incoming traffic across multiple targets (e.g., EC2 instances) in multiple Availability Zones based on application-level content (Layer 7 of the OSI model). It handles SSL termination.
- **In Our Project**: The ALB receives public HTTPS traffic (port 443), decrypts it, and forwards it to the Nginx containers on port 80.

### SSL/TLS Termination
- **Concept**: Decrypting encrypted SSL traffic at the perimeter load balancer (ALB) instead of carrying the encryption workload down to the application host.
- **In Our Project**: The ALB terminates incoming HTTPS connections and proxies raw HTTP requests to the Nginx host.

### NAT Gateway
- **Concept**: Network Address Translation Gateway allows resources in private subnets to initiate outbound connections to the internet (e.g., for system updates or external APIs) while preventing the internet from initiating connections to them.
- **In Our Project**: The EC2 hosts in the private subnet query the database APIs and download package updates through the NAT Gateway.

### Security Groups
- **Concept**: Statefully inspect and filter inbound and outbound traffic at the virtual network interface (NIC) level (acting as a host-level firewall).
- **In Our Project**:
  - **App-SG** allows inbound HTTP traffic only from the ALB.
  - **RDS-SG** allows inbound traffic on port 3306 (MySQL) only from the EC2 instance's security group.

---

## 2. Containerization Concepts

### Docker & Containerization
- **Concept**: OS-level virtualization that packages an application and all its dependencies (system libraries, configuration files) into a single, standardized, lightweight unit called a **container**. It solves the "it works on my machine" problem.
- **In Our Project**: The frontend (served by Nginx) and backend (run by Node.js/PM2) are fully containerized using lightweight alpine base images (`node:22-alpine` and `nginx:alpine`).

### Multi-Container Orchestration (Docker Compose)
- **Concept**: A tool for defining and running multi-container Docker applications. It uses a YAML file to configure application services, networks, and volumes.
- **In Our Project**: [docker-compose.yml](file:///Users/sujalwarke/Desktop/sem4PROJECTS/docker-compose.yml) orchestrates both the `backend` and `frontend` containers in a custom bridge network (`reomco-network`), allowing them to communicate securely using container hostnames.

---

## 3. Systems, Process, & Proxy Management Concepts

### Nginx as a Reverse Proxy & Web Server
- **Concept**: An intermediate server that receives inbound web requests, serves static HTML/JS/CSS assets directly, and reverse-proxies API calls down to the node backend daemon.
- **In Our Project**: Nginx is configured inside `nginx.conf` to serve our React single-page app and securely forward all traffic hitting `/api/*` to the Node.js API container.

### Process Manager (PM2)
- **Concept**: A production-grade Node.js process manager with a built-in load balancer. It keeps applications alive forever, reloads them without downtime, and manages application logs.
- **In Our Project**: The backend utilizes PM2 in **Cluster Mode** (via `ecosystem.config.js`). It automatically scales the Node.js API across all available CPU cores of the EC2 instance, maximizing request throughput and ensuring high availability.

### Systemd / Service Managers
- **Concept**: The init system and service manager used in Linux distributions to bootstrap user space and manage system processes.
- **In Our Project**: The CloudWatch agent and Docker daemons are managed via `systemctl` commands (e.g., `sudo systemctl start docker`) to ensure they automatically start on server reboot.

---

## 4. Database & ORM Concepts

### Relational Database Service (RDS MySQL)
- **Concept**: A managed relational database service that automates database administrative tasks such as provisioning, patching, backing up, and scaling.
- **In Our Project**: We migrated our database storage layer from PostgreSQL/Neon to AWS RDS MySQL. It is configured in a Private Subnet Group with Multi-AZ replication to ensure absolute zero data loss and automated failovers.

### Object-Relational Mapping (ORM) & Prisma
- **Concept**: A programming technique that lets developers query and manipulate database records using an object-oriented paradigm instead of writing raw SQL.
- **In Our Project**: Prisma ORM maps database tables to TypeScript interfaces. The schema defined in [schema.prisma](file:///Users/sujalwarke/Desktop/sem4PROJECTS/apps/backend/prisma/schema.prisma) compiles into a type-safe client that handles connection pooling and query optimization automatically.

### Database Integrity & Constraints
- **Concept**: Safeguarding data consistency using foreign keys, unique indices, and database transaction scopes.
- **In Our Project**:
  - `User.email` and `User.username` enforce unique index constraints.
  - Foreign key relations map tasks and approvals back to valid user rows, preventing database pollution.

---

## 5. Security, Authentication, & Access Concepts

### Role-Based Access Control (RBAC)
- **Concept**: Restricting system access to authorized users based on their specific organizational role (`Admin`, `Manager`, `OperationalStaff`, `Executive`).
- **In Our Project**: 
  - **Backend**: Middleware [auth.ts](file:///Users/sujalwarke/Desktop/sem4PROJECTS/apps/backend/src/middleware/auth.ts) intercepts API queries, extracts the user's role, and returns 403 Forbidden errors if permissions are insufficient.
  - **Frontend**: Protected routes and conditional UI components restrict page views and action buttons based on user permissions.

### JSON Web Tokens (JWT) & bcrypt Hashing
- **Concept**: 
  - **bcrypt**: A password-hashing function incorporating a salt to protect against dictionary and rainbow table attacks.
  - **JWT**: A compact, URL-safe means of representing claims to be transferred between two parties. The claims are signed using a cryptographic secret.
- **In Our Project**: User passwords are encrypted on signup/seed using bcrypt. Upon login, the server issues a signed JWT containing the user's ID and role, which the browser stores in `localStorage` for stateless API authentication.

### Cross-Origin Resource Sharing (CORS)
- **Concept**: A security mechanism defined by browser vendors that permits resource requests from a domain distinct from the domain where the API is hosted.
- **In Our Project**: The Express server uses the `cors` package to allow standard browser HTTP header handshakes from the frontend server layout.

---

## 6. Automation, Monitoring, & Event-Driven Flows

### Cron Daemon & Automation Scripts
- **Concept**: A time-based job scheduler in Unix-like operating systems. It executes commands or shell scripts at specified intervals.
- **In Our Project**: A shell script [backup.sh](file:///Users/sujalwarke/Desktop/sem4PROJECTS/scripts/backup.sh) runs a locked-free `mysqldump` of the RDS instance, compresses the file, and syncs it to Amazon S3. The Linux `crontab` automates this script to run daily at 2:00 AM.

### Server-Sent Events (SSE)
- **Concept**: A server push technology enabling an HTTP client to receive real-time, unidirectional stream updates from a server over a single, persistent HTTP connection.
- **In Our Project**: Real-time push notifications are handled via SSE in [NotificationContext.tsx](file:///Users/sujalwarke/Desktop/sem4PROJECTS/apps/frontend/src/contexts/NotificationContext.tsx). When a manager assigns a task or submits an approval, the backend pushes an event to the assigned user's open session, showing a sliding toast instantly.

### Cloud Monitoring & Agent Telemetry
- **Concept**: Running diagnostic collection agents at the system layer to stream system state parameters up to cloud dashboard collectors.
- **In Our Project**: AWS CloudWatch Agent logs CPU, disk, and memory loads, while the backend utilizes the `systeminformation` package to expose CPU/memory telemetry inside our UI.
