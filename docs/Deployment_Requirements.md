# Live Deployment Requirements & Setup Guide

To successfully launch the ReOm.Co platform onto the live internet using the CI/CD pipeline we've built, I will need a few pieces of configuration from you. 

Since you already have an AWS account, we will skip the account creation and jump straight into provisioning the necessary resources.

---

## Requirement 1: Neon PostgreSQL Database Connection String
Our backend relies on a managed PostgreSQL database. Neon is a serverless Postgres provider that gives us a free tier perfect for this.

**Step-by-Step Instructions:**
1. Go to [Neon.tech](https://neon.tech/) and sign up or log in.
2. Click **Create a Project**.
3. Name your project (e.g., `reomco-db`), select a region close to your AWS region (e.g., `US East (N. Virginia)`), and click **Create**.
4. Once the database is created, you will see a **Connection Details** box on the dashboard.
5. Copy the connection string. It will look something like this:
   `postgresql://reomco_admin:mysecretpassword@ep-cold-smoke-123456.us-east-1.aws.neon.tech/reomco_db?sslmode=require`
6. **Save this string securely.** This is the `DATABASE_URL` we will need for the backend.

---

## Requirement 2: AWS EC2 Instance & SSH Key
We need a virtual server (EC2) to host our Docker containers, and an SSH key to allow our GitHub Actions CI/CD pipeline to deploy code to it securely.

**Step-by-Step Instructions:**
1. Log into your **AWS Management Console**.
2. Navigate to the **EC2 Dashboard**.
3. **Create a Key Pair:**
   - On the left sidebar, under "Network & Security", click **Key Pairs**.
   - Click **Create key pair**.
   - Name it `reomco-deploy-key`.
   - Select **RSA** and **.pem** format.
   - Click **Create key pair**. The `.pem` file will download to your computer. **Open this file in a text editor** and copy its entire contents (including `-----BEGIN RSA PRIVATE KEY-----`).
4. **Launch the EC2 Instance:**
   - Go back to the EC2 Dashboard and click **Launch Instance**.
   - **Name:** `ReOmCo-Production-Server`
   - **OS:** Select **Ubuntu Server 22.04 LTS** (or Amazon Linux 2023).
   - **Instance Type:** `t2.micro` or `t3.micro` (eligible for free tier).
   - **Key Pair:** Select the `reomco-deploy-key` you just created.
   - **Network Settings:** Check the boxes for **Allow SSH traffic from Anywhere**, **Allow HTTP traffic from the internet**, and **Allow HTTPS traffic from the internet**.
   - Click **Launch Instance**.
5. Once the instance is running, click on its Instance ID. Look for the **Public IPv4 address**. **Save this IP address**.

---

## Requirement 3: Configure GitHub Actions Secrets
Now that you have the Database URL and the Server credentials, we need to pass them to GitHub so our automated deployment pipeline (`.github/workflows/deploy.yml`) can use them.

**Step-by-Step Instructions:**
1. Go to your GitHub repository: [https://github.com/sujalwarke28/ReOm.Co](https://github.com/sujalwarke28/ReOm.Co)
2. Click on the **Settings** tab at the top.
3. On the left sidebar, scroll down to **Secrets and variables** and click on **Actions**.
4. You will add **three** New Repository Secrets by clicking the green **New repository secret** button for each:

   * **Secret 1:**
     - Name: `EC2_HOST`
     - Secret: Paste the **Public IPv4 address** of your EC2 instance from Requirement 2.
   
   * **Secret 2:**
     - Name: `EC2_USERNAME`
     - Secret: Enter `ubuntu` (if you chose Ubuntu OS) or `ec2-user` (if you chose Amazon Linux).
   
   * **Secret 3:**
     - Name: `EC2_SSH_KEY`
     - Secret: Paste the *entire contents* of the `.pem` file you downloaded in Requirement 2.

---

## What Happens Next?
Once you have completed these steps, your environment is ready.

1. **Provide me the `DATABASE_URL`:** I will update our backend's `.env` configuration.
2. **Push to GitHub:** I will make a final commit.
3. **Automatic Deployment:** The moment the code hits GitHub, GitHub Actions will securely log into your new EC2 server, install Docker, pull the codebase, and launch the ReOm.Co platform live onto the internet!
