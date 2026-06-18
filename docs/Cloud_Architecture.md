# Cloud Networking & AWS Architecture

This document defines the physical infrastructure topology required to securely host the ReOm.Co enterprise application in a production AWS environment.

## 1. Virtual Private Cloud (VPC)
The application will reside within a custom, logically isolated VPC to maintain strict control over inbound and outbound network traffic.
- **VPC CIDR Block**: `10.0.0.0/16`
- **Region**: `us-east-1` (or equivalent production region)

## 2. Subnet Layout & Traffic Flow

The architecture utilizes a multi-tier subnet strategy across two Availability Zones (AZs) for high availability.

### Tier 1: Public Subnets (DMZ)
- **CIDR**: `10.0.1.0/24` and `10.0.2.0/24`
- **Resources**: AWS Application Load Balancer (ALB), NAT Gateways.
- **Routing**: Internet Gateway attached.
- **Function**: The ALB receives public HTTP/HTTPS traffic from users and securely proxies it down to the private tier.

### Tier 2: Private Application Subnets
- **CIDR**: `10.0.3.0/24` and `10.0.4.0/24`
- **Resources**: EC2 Instances running the Docker Compose stack (Frontend Nginx, Backend PM2 Cluster).
- **Routing**: NO direct internet access. Outbound traffic is routed through the NAT Gateway in the Public Subnet (required for Docker pulls and AWS RDS DB connections).

## 3. Security Groups (Firewall Rules)

To enforce the Principle of Least Privilege at the network layer, Security Groups are configured as follows:

### ALB Security Group (`sg-reomco-alb`)
| Direction | Protocol | Port | Source | Description |
|-----------|----------|------|--------|-------------|
| Inbound   | TCP      | 80   | 0.0.0.0/0 | Allow HTTP web traffic |
| Inbound   | TCP      | 443  | 0.0.0.0/0 | Allow HTTPS web traffic |
| Outbound  | TCP      | 80   | sg-reomco-app | Allow forwarding to EC2 |

### EC2 Application Security Group (`sg-reomco-app`)
| Direction | Protocol | Port | Source | Description |
|-----------|----------|------|--------|-------------|
| Inbound   | TCP      | 80   | sg-reomco-alb | Allow Nginx frontend traffic *only* from ALB |
| Inbound   | TCP      | 3000 | sg-reomco-alb | Allow Node API traffic *only* from ALB |
| Inbound   | TCP      | 22   | Corporate IP | Allow SSH access for Admins |
| Outbound  | TCP      | 443  | 0.0.0.0/0 | Allow outbound HTTPS (for AWS RDS, AWS APIs) |
| Outbound  | TCP      | 3306 | 0.0.0.0/0 | Allow outbound MySQL connection to AWS RDS |

## 4. Database Connectivity (AWS RDS)
Because AWS RDS is a managed MySQL provider, the EC2 instances connect to it securely.
- Connection strings must use `sslmode=require` if applicable.
- AWS RDS security groups should be configured to whitelist *only* the Elastic IP of the NAT Gateway, preventing any other IPs from attempting to authenticate to the database.
