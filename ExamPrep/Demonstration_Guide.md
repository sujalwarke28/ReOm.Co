# Exam Prep: Step-by-Step Demonstration Guide

This guide details the exact steps to follow during your project presentation to demonstrate all implemented features of the **RetailEdge Omnichannel Commerce Cloud (ReOm.Co)** platform to the examiner.

---

## 🚀 Step 1: Landing Page & Dual Themes
- **Action**: Open a web browser and navigate to `http://13.201.230.63`.
- **What to say**: *"This is our custom, story-driven landing page. It clearly outlines the core business value of ReOm.Co: Smart Task Workflows, Hierarchical Approvals, and Live Analytics. At the top, we have a theme toggle. Watch as we switch between Light and Dark modes. The entire page transition is smooth and uses persisted CSS variables."*
- **Interaction**: Toggle the **Light/Dark** button in the header. Click the blue **Get Started** button.

---

## 🔒 Step 2: Real-Time Signup & Admin Approvals
- **Action**: Open an incognito browser window, navigate to `http://13.201.230.63/signup`.
- **What to say**: *"Let's demonstrate our real-time signup approval workflow. We will register a new user. Unlike generic systems, new accounts do not automatically get platform access—they default to a Pending state and must be approved by an Admin."*
- **Action**: Fill in Username: `presentation_user`, Email: `demo_user@example.com`, Password: `password123`, select role `Operational Staff`, and click **Create account →**.
- **What to say**: *"Upon clicking register, the screen instantly changes to a 'Waiting for Admin Approval' dashboard. This is a real-time listening state connected via Server-Sent Events (SSE). Let's approve them in our Admin panel."*
- **Action**: In your main browser window (logged in as Admin `sujal@admin.com`), click on **Users** in the sidebar.
- **What to say**: *"Notice that a new registration request alert appeared instantly on the Admin's User Management dashboard. We see the user listed in our 'Pending Registrations' panel. Let's click Approve."*
- **Action**: Click the green **Approve** button next to `demo_user@example.com` on the Admin dashboard.
- **What to say**: *"Watch the incognito window on the left. The moment we click Approve on the Admin panel, the user's screen instantly updates in real-time, displaying a success state, and automatically redirects them to the Sign In screen!"*

---

## 🛡️ Step 3: Authentication & RBAC (Role-Based Access Control)
- **Action**: Sign in using `sujal@ops.com` (password: `1234`).
- **What to say**: *"We are logging in as an Operational Staff member. Notice the bottom-right success toast appearing. The sidebar links dynamically filter. Since we are Ops Staff, we cannot see the Admin links (Pricing, Monitoring, Audit Logs, Users) or the Executive Portal. The platform enforces strict visual and endpoint access control."*
- **Action**: Log out and sign in using `sujal@admin.com` (password: `1234`).
- **What to say**: *"Now we are logging in as an Admin. Notice that all links in the sidebar are now available: pricing strategy, monitoring dashboard, audit logs, and user management."*

---

## 👤 Step 4: Profile Management & Avatars
- **Action**: Click on the **Profile** link in the sidebar.
- **What to say**: *"This is the Profile page. The system dynamically generates a colored initials avatar based on the user's role color. Account details like email and role are read-only to preserve security compliance. However, users can edit their display names."*
- **Action**: Click **Edit Name**, change it to `AdminSujal`, and click **Save**.
- **What to say**: *"Notice that saving triggers a success notification toast, and the username update is reflected immediately in the sidebar footer."*

---

## 📋 Step 5: Tasks Creation & Real-Time Push Notifications (SSE)
- **Action**: Open another browser window (or incognito tab), navigate to the site, and sign in as `sujal@ops.com` (Ops Staff). Place this window side-by-side with your Admin window.
- **Action**: In the **Admin** window, click **Tasks** -> **Create Task**.
- **What to say**: *"When assigning a task, we do not use ugly native browser select elements. We built a custom dropdown component featuring initials avatars and role titles. Let's assign a task to our Ops user."*
- **Action**: Fill in Title: `Q3 Sales Audit`, select `ops_user` (Ops Staff), and click **Create Task**.
- **What to say**: *"Watch the Operational Staff browser window on the right. Instantly, without any page refreshing or manual polling, a blue notification toast slides in from the bottom right informing the user about the new task assignment. This uses Server-Sent Events (SSE)."*

---

## ✅ Step 6: Approval Workflows
- **Action**: In the **Ops Staff** window, go to **Approvals** -> **Submit Request**.
- **What to say**: *"Operational staff can initiate approval workflows. Let's submit a budget request to the Manager."*
- **Action**: Request: `Requesting $500 for local transport`, select `manager_user` (Manager), and click **Submit Request**.
- **What to say**: *"The request is added immediately. Let's sign in as the Manager to action this approval."*
- **Action**: Sign in as `sujal@manager.com` (password: `1234`). Go to **Approvals**.
- **What to say**: *"As a Manager, I can see the pending request. I will click Approve. Notice that a green success toast fires immediately, and the status changes to Approved."*

---

## 📊 Step 7: Live Analytics, Monitoring, & Audits
- **Action**: Go to **Analytics**.
- **What to say**: *"This is our reporting page. The graphs dynamically adapt to the active theme. In light mode, grids and legends resolve to dark gray. In dark mode, they change to light gray, maintaining high legibility."*
- **Action**: Go to **Monitoring** (as Admin).
- **What to say**: *"This dashboard aggregates real-time hardware status from our EC2 host, including CPU usage, memory load, and disk partitions, alongside custom threshold alerts."*
- **Action**: Go to **Audit Logs** (as Admin).
- **What to say**: *"To maintain compliance standards, every system action is logged into an immutable database log list for forensic analysis."*

---

## 💲 Step 8: Pricing Strategy Estimates
- **Action**: Go to **Pricing Strategy**.
- **What to say**: *"The Pricing page contains two tabs. The first tab manages omnichannel product rules. The second tab displays our AWS Cloud Infrastructure Estimates. It provides exact monthly costs for compute (EC2), database (RDS), networking (NAT/ALB), backup space, SLA-based monitoring tiers, multi-region failover replication, and optimization recommendations (Reserved Instances, Glacier transitions)."*
- **Action**: Click on **AWS Infrastructure Estimates** tab.

---

## 💾 Step 9: Automation & Backups verification
- **Action**: Open the terminal or explain the configuration files.
- **What to say**: *"For data integrity, we wrote a shell script `backup.sh` located in our repository's `scripts/` directory. It uses `mysqldump` to export RDS MySQL data, compresses it, and syncs it to our AWS S3 bucket (`retailedge-db-backups-bucket`). A cron job runs this script every day at 2:00 AM. We also established an IAM Instance Profile on our EC2 instance to permit secure, keyless S3 uploads."*
