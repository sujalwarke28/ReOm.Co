# AWS IAM Security Model

This document outlines the strict Least Privilege IAM architecture designed for the ReOm.Co cloud environment. These policies must be provisioned via Terraform or the AWS Console prior to migrating the application to production.

## 1. Application Role (`ReOmCo-App-Role`)
This role is attached to the EC2 instances (via an Instance Profile) running the Node.js backend. It grants *only* the permissions required for the application to function.

**Purpose**: Allow automated backups to S3 and application logs to CloudWatch.
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowS3Backups",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::reomco-db-backups-prod/postgres/*"
        },
        {
            "Sid": "AllowCloudWatchLogging",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:log-group:/reomco/backend/*"
        }
    ]
}
```

## 2. Continuous Deployment User (`ReOmCo-Deployer`)
This policy is attached to an IAM User whose Access Keys are stored securely in GitHub Actions (or another CI/CD tool).

**Purpose**: Restrict the CI/CD pipeline so that if secrets are leaked, the attacker cannot delete infrastructure or access data.
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowS3FrontendDeployment",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::reomco-frontend-prod",
                "arn:aws:s3:::reomco-frontend-prod/*"
            ]
        },
        {
            "Sid": "AllowECSRestart",
            "Effect": "Allow",
            "Action": [
                "ecs:UpdateService"
            ],
            "Resource": "arn:aws:ecs:*:*:service/reomco-cluster/reomco-backend-service"
        }
    ]
}
```

## 3. Human Administrator Group (`ReOmCo-Admins`)
Attached to human DevOps and Cloud Engineers.

**Purpose**: Grants full administrative access, but **strictly requires** an active Multi-Factor Authentication (MFA) session. If MFA is not present, all actions are denied.
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowAllActionsIfMFA",
            "Effect": "Allow",
            "Action": "*",
            "Resource": "*",
            "Condition": {
                "BoolIfExists": {
                    "aws:MultiFactorAuthPresent": "true"
                }
            }
        },
        {
            "Sid": "DenyAllActionsIfNotMFA",
            "Effect": "Deny",
            "NotAction": [
                "iam:CreateVirtualMFADevice",
                "iam:EnableMFADevice",
                "iam:ListMFADevices",
                "iam:ListUsers",
                "iam:ListVirtualMFADevices",
                "iam:ResyncMFADevice",
                "sts:GetSessionToken"
            ],
            "Resource": "*",
            "Condition": {
                "BoolIfExists": {
                    "aws:MultiFactorAuthPresent": "false"
                }
            }
        }
    ]
}
```
