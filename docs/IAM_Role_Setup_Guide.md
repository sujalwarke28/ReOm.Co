# AWS IAM Setup Guide for EC2

Yes! You are completely right. To make your server fully secure and compliant with our architecture, we need to go into the **IAM Console** and create the `ReOmCo-App-Role`, then attach it to the EC2 instance you just created.

This ensures your server is securely authorized to talk to other AWS services (like CloudWatch for logs) without needing to store hardcoded API keys on the server.

Follow these step-by-step instructions.

---

## Step 1: Create the IAM Role

1. **Log in to AWS**: Go to the AWS Management Console.
2. **Go to IAM**: In the top search bar, type `IAM` and click on the **IAM** service.
3. **Navigate to Roles**: On the left-hand sidebar, click on **Roles**.
4. **Create Role**: Click the orange **Create role** button on the top right.

### 1.1 Select Trusted Entity

1. **Trusted entity type**: Select **AWS service**.
2. **Use case**: Under "Common use cases", select **EC2**.
3. Click the orange **Next** button.

### 1.2 Add Permissions Policies

Now we are going to attach standard AWS policies to give our application the exact permissions it needs.

1. In the search bar on this page, type: `CloudWatchAgentServerPolicy`.
2. **Check the box** next to it in the list.
3. Clear the search bar and type: `AmazonSSMManagedInstanceCore`.
   _(This allows secure terminal access via AWS Systems Manager without needing SSH keys in the future!)_
4. **Check the box** next to it.
5. Click the orange **Next** button.

### 1.3 Name and Save the Role

1. **Role name**: Type exactly `ReOmCo-App-Role`.
2. Scroll to the bottom and click the orange **Create role** button.
3. Wait for the green success banner. You have successfully created the IAM Role!

---

## Step 2: Attach the Role to Your EC2 Instance

Now we must tell your specific server (`ReOmCo-Production-Server`) to "wear" this new IAM Role like a badge.

1. **Go back to EC2**: In the top search bar, type `EC2` and click the **EC2** service.
2. **Navigate to Instances**: On the left sidebar, click **Instances**.
3. **Select your Server**: Check the box next to your `ReOmCo-Production-Server` (the one with IP `13.201.230.63`).
4. **Modify IAM Role**:
   - Click the **Actions** dropdown menu at the top.
   - Hover over **Security**.
   - Click **Modify IAM role**.
5. **Attach it**:
   - In the dropdown menu, select the `ReOmCo-App-Role` you just created.
   - Click the orange **Update IAM role** button.

---

## 🎉 You're Done!

Your EC2 instance is now enterprise-grade secure. It will automatically rotate its own temporary credentials in the background to securely interact with AWS. No hardcoded AWS access keys are ever needed!
