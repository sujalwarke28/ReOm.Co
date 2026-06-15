# Exam Prep: VIVA Questions & Answers

This document lists the critical questions an examiner might ask during your Project Viva/Defense, with precise answers based on the **RetailEdge Omnichannel Commerce Cloud (ReOm.Co)** project.

---

## 🌐 Section 1: Networking & VPC Architecture

### Q1: What is the VPC layout of your application?
- **Answer**: The application is deployed in a multi-tier VPC network (VPC CIDR `10.0.0.0/16`). It features:
  1. **Public Subnets**: Host the Application Load Balancer (ALB) and NAT Gateways.
  2. **Private Subnets**: Host the EC2 compute instance and the managed AWS RDS MySQL database.
  - This architecture isolates critical database assets from direct public routing, enforcing network security boundaries.

### Q2: Why did you place the database in a private subnet?
- **Answer**: For security. Databases hold business-critical, sensitive records. By placing the RDS instance in a private subnet, it lacks an internet-facing IP address and cannot be accessed directly from the public web. It is only accessible internally within the VPC by our EC2 application server.

### Q3: What is a NAT Gateway in AWS?
- **Answer**: A NAT (Network Address Translation) Gateway is a managed AWS networking service. It allows resources situated in private subnets (which lack public IPv4 addresses) to connect outbound to the internet (e.g. to download updates, call APIs, or fetch external packages) while preventing the external internet from initiating any inbound connections directly to those private instances.

### Q4: How do the EC2 instances in the private subnet download updates or pull Docker images if they don't have public IPs?
- **Answer**: Outbound-only internet access is achieved using a **NAT Gateway** located in the Public Subnet. The Route Table for the Private Subnet directs all egress traffic (`0.0.0.0/0`) to the NAT Gateway, which performs Network Address Translation to fetch updates and returns the packets to the EC2 instances.

### Q5: How did you configure Security Groups to restrict access?
- **Answer**: We applied the Principle of Least Privilege:
  - The **ALB Security Group** permits inbound HTTP (port 80) and HTTPS (port 443) from `0.0.0.0/0`.
  - The **EC2 Application Security Group** allows inbound ports 80/3000 *only* from the ALB Security Group, and port 22 (SSH) only from authorized admin IP blocks.
  - The **RDS Security Group** allows inbound MySQL connections (port 3306) *only* from the EC2 Security Group.

---

## 📦 Section 2: Docker & Containerization

### Q6: What is the benefit of Docker Compose in your project?
- **Answer**: Docker Compose allows us to define and manage our multi-container application stack (frontend and backend) as a single unit using a declarative YAML configuration file ([docker-compose.yml](file:///Users/sujalwarke/Desktop/sem4PROJECTS/docker-compose.yml)). It simplifies environment setup, container lifecycle management, port mapping, and establishes isolated internal networks (`reomco-network`) for container-to-container queries.

### Q7: What does `build: context` do in your Compose file?
- **Answer**: It defines the directory containing the `Dockerfile` used to build the image for that specific service. For example, `context: ./apps/frontend` tells Docker to look inside that folder for the frontend code and its respective build instructions.

### Q8: What is a Docker Multi-stage Build?
- **Answer**: It is a Docker build method that uses multiple `FROM` instructions in a single Dockerfile. The first stage (the build environment) compiles source code, installs development dependencies, and builds assets. The subsequent stage copies *only* the compiled static artifacts into a fresh, minimal production image, reducing image sizes and preventing dev source code leaks.

### Q9: Why do we use multi-stage builds in the Dockerfiles?
- **Answer**: We use multi-stage builds (using `AS builder` stage and a final production stage) to minimize final Docker image sizes. The first stage installs devDependencies, compiles TypeScript, and bundles assets. The final stage copies *only* the compiled assets (`/dist`) and production dependencies, keeping the deployed containers lightweight, fast, and secure.

---

## 🗄️ Section 3: Databases & ORM (RDS & Prisma)

### Q10: What database are you using, and how is it hosted?
- **Answer**: We are using **MySQL (version 8.0+)** hosted on **AWS RDS (Relational Database Service)**. Hosting it on RDS provides managed benefits like automatic patching, automated snapshots, high availability through Multi-AZ replication, and isolated networking inside our private VPC subnets.

### Q11: Why use Prisma ORM instead of raw SQL queries?
- **Answer**: Prisma ORM provides type-safe query building, auto-completion, and handles connection pooling out of the box. It defines our data models declaratively in `schema.prisma` and automatically generates migrations, reducing syntax errors and ensuring schema sync across development and production environments.

### Q12: What does `npx prisma db push` do?
- **Answer**: It synchronizes the database schema directly with your Prisma schema file (`schema.prisma`) without generating migration files. It is ideal for rapid prototyping or push deployments where the schema state is managed declaratively.

### Q13: How did you do the database migration from PostgreSQL to MySQL?
- **Answer**: 
  1. We modified `apps/backend/prisma/schema.prisma` to change the datasource provider from `postgresql` to `mysql`.
  2. We adjusted string IDs to utilize appropriate sizes and modified database schemas for MySQL compatibility.
  3. We ran `npx prisma generate` to rebuild the type-safe Prisma client.
  4. On the EC2 container, we ran `npx prisma db push` to push the mapped schema directly to our AWS RDS MySQL instance.

---

## 🔒 Section 4: Security & Access Control

### Q14: Explain how Role-Based Access Control (RBAC) is implemented.
- **Answer**: 
  - **Backend**: We created a middleware [auth.ts](file:///Users/sujalwarke/Desktop/sem4PROJECTS/apps/backend/src/middleware/auth.ts) that wraps Express endpoints. It reads the user's role from the decoded JWT payload and verifies it against allowed roles for that route.
  - **Frontend**: The React app checks the active user's role and conditionally renders navigational paths (e.g., hiding Admin controls from Operational Staff) and wraps pages in a `<ProtectedRoute>` component.

### Q15: What is a JSON Web Token (JWT)?
- **Answer**: A JWT is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information is verified and trusted because it is digitally signed. In our project, it contains the logged-in user's database ID and user role, permitting stateless session verification.

### Q16: How are user sessions managed securely?
- **Answer**: We use stateless **JSON Web Tokens (JWT)**. On successful login, the server generates a token signed with a secure HS256 algorithm containing the user's ID and role. The client stores this in `localStorage` and appends it to the `Authorization: Bearer <token>` header of every subsequent API request.

### Q17: How are passwords secured in the database?
- **Answer**: Passwords are never stored in plain text. We encrypt passwords using **bcrypt** with 10 salt rounds before saving them. On login, the server uses `bcrypt.compare()` to compare the hash of the login password against the stored database hash.

---

## ⚙️ Section 5: Linux Administration & Automation

### Q18: Explain the automation backup script you wrote.
- **Answer**: The backup script [backup.sh](file:///Users/sujalwarke/Desktop/sem4PROJECTS/scripts/backup.sh) runs daily. It:
  1. Parses credentials from the app's `.env` file.
  2. Runs `mysqldump` to export database tables.
  3. Compresses the dump into a `.tar.gz` archive.
  4. Syncs the archive to an **AWS S3 Bucket** (`retailedge-db-backups-bucket`) via the AWS CLI.
  5. Deletes local backups older than 7 days to conserve disk space.

### Q19: What are RPO and RTO? How does your backup strategy align with them?
- **Answer**:
  - **Recovery Point Objective (RPO)**: The maximum acceptable age of data that can be lost due to an incident. Our RPO is **24 Hours**, which we satisfy by running our automated backups daily.
  - **Recovery Time Objective (RTO)**: The maximum acceptable duration of downtime before service is restored. Our RTO is **2 Hours**, which is met by keeping pre-configured database restore scripts and server initialization templates on hand.

### Q20: How is the backup script scheduled to run automatically?
- **Answer**: We set up a **Linux Cron Job**. Running `crontab -e` on the EC2 host opens the scheduler, where we appended `0 2 * * * /home/ubuntu/reomco/scripts/backup.sh` to run the backup script every single day at 2:00 AM.

---

## 📊 Section 6: Monitoring, Pricing & Application Architecture

### Q21: What is PM2 Cluster Mode?
- **Answer**: PM2 is a production process manager for Node.js. **Cluster Mode** allows Node applications to run across multiple software instances across all available CPU cores of the server without any code changes. It acts as a local load balancer, distributing incoming HTTP requests across all worker threads to increase concurrency and request handling speed.

### Q22: What is Server-Sent Events (SSE)?
- **Answer**: SSE is a web standard that allows a web server to push real-time, unidirectional text events to a browser client over a single, persistent HTTP connection. Unlike WebSockets which are bidirectional and use a custom protocol, SSE runs over standard HTTP, making it simpler, lightweight, and compatible with corporate firewalls.

### Q23: How does your real-time notification system work?
- **Answer**: We use **Server-Sent Events (SSE)**. The frontend client opens a persistent stream connection at `/api/notifications/stream`. When a database event triggers (such as a task assignment or approval update), the backend pushes a text event containing the payload to the open socket. The React app catches the event and triggers a toast notification immediately.

### Q24: What is an IAM Instance Profile?
- **Answer**: An IAM Instance Profile is an AWS container for an IAM role that you can attach to an EC2 instance. This allows applications running on the EC2 instance to safely make API requests to other AWS resources (like Amazon S3 or CloudWatch) using temporary credentials automatically rotated by AWS, removing the need to embed secret keys in code.

### Q25: What monitoring is configured in your project?
- **Answer**: We monitor at two levels:
  1. **OS/Instance level**: The **AWS CloudWatch Agent** runs on the EC2 host, collecting and streaming memory utilization and disk space usage metrics up to CloudWatch metrics.
  2. **Application level**: We built a custom monitoring dashboard utilizing the `systeminformation` package on the node backend to fetch CPU load, free memory percentage, and alert thresholds dynamically.

### Q26: Explain the AWS cost optimization recommendations you presented.
- **Answer**: To reduce Total Cost of Ownership (TCO):
  - Use **Reserved Instances (RIs)** for baseline compute, yielding up to 35% savings over On-Demand.
  - Apply **S3 Lifecycle Policies** to transition older daily database backup files to S3 Glacier Deep Archive after 14 days.
  - Configure automated **Auto Scaling Schedules** to shut down non-production Dev/Test servers during off-hours (e.g., nights and weekends).

---

## 🔍 PART 7: Specific "Where is..." Questions

### Q27: Where is the database schema mapped in our files?
- **Answer**: The database schema mapping is stored at:
  - `[schema.prisma](file:///Users/sujalwarke/Desktop/sem4PROJECTS/apps/backend/prisma/schema.prisma)`
  - This file defines the tables (`User`, `Task`, `Approval`, `PricingRule`, `AuditLog`), their relations, field types, and the datasource provider, which is set to `mysql`.

### Q28: Where is the database credentials configuration stored?
- **Answer**: In local development, database credentials are saved in the environment file:
  - `[apps/backend/.env](file:///Users/sujalwarke/Desktop/sem4PROJECTS/apps/backend/.env)`
  - On the production EC2 host, the environment variable `DATABASE_URL` is injected into the container using the environment list inside:
  - `[docker-compose.yml](file:///Users/sujalwarke/Desktop/sem4PROJECTS/docker-compose.yml)`

### Q29: Where is the database backup script located?
- **Answer**: The backup script is located at:
  - `[scripts/backup.sh](file:///Users/sujalwarke/Desktop/sem4PROJECTS/scripts/backup.sh)`
  - This script uses `mysqldump` to create a locked-free copy of the database tables, compresses the dump file using `gzip`, and pushes it to your S3 bucket.

### Q30: Where is the Nginx configuration located?
- **Answer**: The configuration for the web server reverse proxy is located at:
  - `[apps/frontend/nginx.conf](file:///Users/sujalwarke/Desktop/sem4PROJECTS/apps/frontend/nginx.conf)`
  - It configures Nginx to serve static React index files for frontend routing and proxies `/api/*` endpoints to the backend container on port 3000.

### Q31: Where is the user role verification logic implemented on the backend?
- **Answer**: The backend RBAC validation logic is implemented in the authentication middleware file:
  - `[apps/backend/src/middleware/auth.ts](file:///Users/sujalwarke/Desktop/sem4PROJECTS/apps/backend/src/middleware/auth.ts)`
  - The function extracts the JWT, decodes the role, and compares it against allowed values.

---

## ⚙️ PART 8: Specific "How did you do..." Questions

### Q32: How did you do the light/dark mode theme toggling?
- **Answer**: 
  1. We created `ThemeContext.tsx` to track the theme state (`light` or `dark`) and save the user's preference in `localStorage`.
  2. The hook sets a `data-theme` attribute on the `document.documentElement` element (e.g. `<html data-theme="dark">`).
  3. In `index.css`, we defined design system color variables (backgrounds, texts, borders) for both `:root` (light) and `[data-theme="dark"]`. The browser automatically swaps styles when the attribute changes.

### Q33: How did you do the real-time push notification toasts?
- **Answer**: 
  1. The backend implements a `/api/notifications/stream` endpoint that returns a persistent Server-Sent Events stream.
  2. In `NotificationContext.tsx`, when a user logs in, the browser opens an `EventSource` connection to this stream.
  3. When an action occurs on the backend (like creating a task), the server broadcasts a message to the corresponding user's SSE socket.
  4. The client's React context catches the event and adds a toast item with a 5-second countdown progress bar to the toasts state list.

### Q34: How did you do the role-based access control filters on the frontend?
- **Answer**: 
  1. We wrapped page routes in `App.tsx` using a `<ProtectedRoute>` component. This component checks the user's authenticated role inside the `AuthContext` state.
  2. If the user's role is not listed in the route's `allowedRoles` array, they are redirected to `/unauthorized`.
  3. Side navigation links are rendered conditionally (e.g. `user.role === 'Admin' && <NavLink ... />`) to hide pages they cannot access.

### Q35: How did you do the custom select dropdown in tasks and approvals?
- **Answer**: 
  1. We replaced native `<select>` dropdown lists with a custom React component ([CustomSelect.tsx](file:///Users/sujalwarke/Desktop/sem4PROJECTS/apps/frontend/src/components/CustomSelect.tsx)).
  2. It renders as a togglable list container. When active, it displays users grouped by operational roles under distinct subheadings.
  3. Each user item displays a custom avatar with initials and color codes mapped to their roles, styled fully inside our dark/light theme popover templates.

### Q36: How did you do the CloudWatch monitoring configuration?
- **Answer**: 
  1. We created an IAM role `RetailEdge-EC2-Role` with `CloudWatchAgentServerPolicy` and attached it to the EC2 host.
  2. We SSH'd into the server, downloaded the Amazon CloudWatch Agent `.deb` package, and installed it.
  3. We ran the agent configuration wizard to generate `/opt/aws/amazon-cloudwatch-agent/bin/config.json`, monitoring host memory and disk utilization.
  4. We started the agent using `amazon-cloudwatch-agent-ctl`, which streams host metrics directly to AWS CloudWatch.

### Q37: How did you do the database seeding for evaluation users?
- **Answer**: 
  1. We wrote a TypeScript seed script at `apps/backend/prisma/seed.ts` that uses `prisma.user.upsert` to create four standard RBAC users (`sujal@admin.com`, `sujal@manager.com`, `sujal@ops.com`, `sujal@exec.com`).
  2. It encrypts their passwords to the standard evaluation hash `1234` using bcrypt.
  3. We compile this script to JavaScript and run it inside the docker container on the EC2 host (`node prisma/seed.js`).
