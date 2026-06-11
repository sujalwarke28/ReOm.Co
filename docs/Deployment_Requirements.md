# Live Deployment: Step-by-Step Server Setup Guide

To deploy the **ReOm.Co** application live onto the internet, we need to spin up a virtual server on AWS, install the necessary software (Docker), and link it to our automated GitHub deployment pipeline.

This guide is highly detailed. Follow each step precisely. 

---

## What I Need From You
To make the automated deployment work, our GitHub repository needs to securely log into your server. I need you to retrieve **three specific values** from AWS and save them inside **GitHub Secrets**.

I need:
1. **The Server IP Address** (To know where the server is)
2. **The Server Username** (To log in)
3. **The Server SSH Key** (The password to get in)

Here is exactly how to get them:

---

## Step 1: Create the AWS EC2 Server
We are going to rent a small, free-tier virtual computer from Amazon to run our application.

1. **Log in to AWS**: Go to [aws.amazon.com](https://aws.amazon.com/) and log into your Console.
2. **Go to EC2**: In the top search bar, type `EC2` and click the **EC2 (Virtual Servers in the Cloud)** service.
3. **Launch Instance**: Click the bright orange **Launch instance** button.

### 1.1 Configure the Server Details
Now you are on the "Launch an instance" page. Fill it out exactly like this:
* **Name and tags**: Type `ReOmCo-Production-Server` in the Name box.
* **Application and OS Images (Amazon Machine Image)**: 
  * Click on the **Ubuntu** logo.
  * Ensure "Ubuntu Server 22.04 LTS (HVM)" or "24.04 LTS" is selected in the dropdown. (It should say "Free tier eligible" underneath).
* **Instance type**: Leave it as `t2.micro` or `t3.micro` (Free tier eligible).

### 1.2 Create the SSH Key (CRITICAL STEP)
This is the "password" for the server. 
* Scroll down to **Key pair (login)**.
* Click **Create new key pair**.
* A popup will appear:
  * **Key pair name**: Type `reomco-key`
  * **Key pair type**: Select **RSA**
  * **Private key file format**: Select **.pem**
* Click **Create key pair**.
* 🚨 **IMPORTANT:** A `.pem` file will instantly download to your computer (e.g., `reomco-key.pem`). Do not lose this file. **This file is the "EC2_SSH_KEY" I need.**

### 1.3 Configure the Firewall (Network Settings)
We need to open the server to the internet so people can visit the website.
* Scroll down to **Network settings**.
* Look for the checkboxes under "Firewall (security groups)":
  * ✅ Check **Allow SSH traffic from** and set the dropdown to **Anywhere 0.0.0.0/0**.
  * ✅ Check **Allow HTTPS traffic from the internet**.
  * ✅ Check **Allow HTTP traffic from the internet**.

### 1.4 Launch
* Scroll to the very bottom right and click the orange **Launch instance** button.
* Wait a few seconds for the success screen, then click on the blue **Instance ID** link (it looks like `i-0abcdef123456`).

---

## Step 2: Gather the Required Values
You now have a running server! Let's collect the 3 values I need.

1. **EC2_HOST (The IP Address)**:
   * On the EC2 Instances page, click the checkbox next to your new `ReOmCo-Production-Server`.
   * Look at the bottom half of the screen in the "Details" tab.
   * Find **Public IPv4 address** (e.g., `54.123.45.67`).
   * **Copy this IP address and save it.**

2. **EC2_USERNAME (The Login Name)**:
   * Because you selected Ubuntu, the username is always exactly: `ubuntu`. 
   * **Save this word.**

3. **EC2_SSH_KEY (The Password File)**:
   * Find the `reomco-key.pem` file you downloaded in Step 1.2.
   * Open this file using a plain text editor (like Notepad on Windows, or TextEdit on Mac).
   * You will see a giant block of scrambled text starting with `-----BEGIN RSA PRIVATE KEY-----` and ending with `-----END RSA PRIVATE KEY-----`.
   * **Copy everything inside this file, including the BEGIN and END lines.**

---

## Step 3: Put the Values into GitHub
Now we feed these values into our automated pipeline so it can deploy the code for us.

1. Go to your GitHub repository: `https://github.com/sujalwarke28/ReOm.Co`
2. Click the **Settings** tab near the top right.
3. On the left menu, scroll down, click **Secrets and variables**, then click **Actions**.
4. Click the green **New repository secret** button. You will do this three times:

   * **First Secret:**
     * **Name**: `EC2_HOST`
     * **Secret**: *Paste the Public IPv4 address here* (e.g., 54.123.45.67)
     * Click **Add secret**.

   * **Second Secret:**
     * **Name**: `EC2_USERNAME`
     * **Secret**: `ubuntu`
     * Click **Add secret**.

   * **Third Secret:**
     * **Name**: `EC2_SSH_KEY`
     * **Secret**: *Paste the entire contents of the .pem file here*
     * Click **Add secret**.

---

## Step 4: Prepare the Server (One-Time Setup)
Your server is blank right now. It needs Docker installed before we can deploy. You need to connect to it once and run a setup script.

1. Go back to your AWS EC2 Console, select your instance, and click the **Connect** button at the top of the screen.
2. Select the **EC2 Instance Connect** tab and click the orange **Connect** button at the bottom. A black terminal window will open in your browser.
3. **Copy and paste the following commands into that black window, one line at a time, hitting Enter after each:**

```bash
# 1. Update the server software
sudo apt-get update -y

# 2. Install Git
sudo apt-get install git -y

# 3. Install Docker
sudo apt install docker.io -y

# 4. Install Docker Compose
sudo apt install docker-compose -y

# 5. Give our user permission to run Docker without sudo
sudo usermod -aG docker ubuntu

# 6. Set up the application folder
sudo mkdir -p /opt/reomco
sudo chown -R ubuntu:ubuntu /opt/reomco

# 7. Clone the repository into the folder
git clone https://github.com/sujalwarke28/ReOm.Co.git /opt/reomco
```

**Note:** After running command #5, you might need to close the terminal window and click "Connect" again for the permissions to apply.

---

## Step 5: You Are Done!
That's it! 

Once you have done all of the above:
1. I have already integrated the **Neon Database Connection String** you provided me directly into the `docker-compose.yml` file.
2. Tell me you are ready.
3. I will push a small update to GitHub. 
4. The GitHub Actions pipeline will see the update, grab your 3 secrets, log into the server, and automatically spin up the website using Docker!
