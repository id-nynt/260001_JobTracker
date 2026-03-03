# Production Deployment Guide - Beginner Edition

**Complete step-by-step guide to deploy the Job Tracker application to AWS using Terraform, Docker, and CI/CD pipeline.**

This guide is written for beginners. We'll explain every concept and walk through each step carefully.

## Quick Navigation

1. [Choose Your Deployment Path](#choose-your-deployment-path) ⭐ **START HERE**
2. [Before You Start - Important Concepts](#before-you-start)
3. [Prerequisites Checklist](#prerequisites-checklist)
4. [Setting Up Your Local Environment](#setting-up-your-local-environment)
5. [Understanding the Architecture](#understanding-the-architecture)
6. [Step-by-Step AWS Setup](#step-by-step-aws-setup)
7. [Docker - Containerizing Your Application](#docker-containerizing-your-application)
8. [Terraform - Infrastructure as Code](#terraform-infrastructure-as-code)
9. [GitHub Actions - Automated Deployment](#github-actions-automated-deployment)
10. [Complete Deployment Walkthrough](#complete-deployment-walkthrough)
11. [Free Deployment (Railway)](#free-deployment-railway-recommended-for-portfolio)
12. [AWS Cleanup & Cost Management](#aws-cleanup--cost-management)
13. [Monitoring Your Application](#monitoring-your-application)
14. [Troubleshooting Guide](#troubleshooting-guide)
15. [FAQ for Beginners](#faq-for-beginners)

---

## Choose Your Deployment Path

**⚠️ IMPORTANT: Read this first before starting!**

You have **TWO PATHS** to deploy your Job Tracker:

### Path A: Professional AWS Deployment 🏢

**Best for:**

- Learning enterprise deployment
- Production apps with real users
- Practicing cloud infrastructure
- Resume/Portfolio showing advanced skills

**Cost:** $70-100/month (after free tier ends)

**Pros:**

- ✅ Professional, production-grade
- ✅ Auto-scaling for many users
- ✅ Enterprise features (monitoring, backups, security)
- ✅ Great for resume
- ✅ Complete control

**Cons:**

- ❌ Expensive if you forget to delete resources
- ❌ Complex setup (Terraform, IAM, etc.)
- ❌ Takes 15-25 minutes to deploy
- ⚠️ If you leave it running unused, costs continue

### Path B: Free Deployment (Railway) 🚀

**Best for:**

- Portfolio projects
- Practice & learning
- Quick demos
- Budget-conscious students

**Cost:** Completely FREE (or $5-10 if you exceed free tier)

**Pros:**

- ✅ 100% FREE
- ✅ Super quick setup (5 minutes!)
- ✅ Auto-deploy on GitHub push
- ✅ Looks professional on portfolio
- ✅ No server management
- ✅ Includes free database
- ✅ Easy to delete (no leftover costs)

**Cons:**

- ❌ Free tier has limits
- ❌ Apps sleep after inactivity (30 sec wake-up)
- ❌ Less control over infrastructure

### Decision Matrix

| Question                | Use AWS   | Use Railway       |
| ----------------------- | --------- | ----------------- |
| Is this for learning?   | Yes       | **Better choice** |
| Do I have budget?       | Yes       | Not needed        |
| Is this production?     | Yes       | No                |
| Want quick setup?       | No        | **Yes**           |
| How long to deploy?     | 15-25 min | **5 minutes**     |
| Cost if you forget it?  | **HIGH**  | Free              |
| Show enterprise skills? | **Yes**   | Basic             |

### My Recommendation

🎯 **For you (portfolio + practice): Use Railway!**

- ✅ Deploy in 5 minutes
- ✅ Completely free
- ✅ Still looks great on resume
- ✅ No risk of surprise costs
- ✅ Easy to delete

**Use AWS only if:** You want to practice enterprise deployment and have a budget.

---

## IMPORTANT: AWS Idle Cost Warning ⚠️

**If you set up AWS and then leave it running without using it:**

| Resource         | Idle Cost      | If Left 1 Month |
| ---------------- | -------------- | --------------- |
| RDS Database     | $30/month      | $30 wasted      |
| ECS (running)    | $14/month      | $14 wasted      |
| Load Balancer    | $16/month      | $16 wasted      |
| Data storage     | $1/month       | $1 wasted       |
| **TOTAL UNUSED** | **~$61/month** | **$61 wasted!** |

**YES, it's expensive if you don't use it!**

**Solution:** Follow the "AWS Cleanup Guide" below (takes 5 minutes) to delete everything when done.

---

## Before You Start - Important Concepts

### What Does "Production" Mean?

**Production** means your application is live and real users are using it. Unlike your local computer (development), where failures only affect you, production failures affect real users. That's why we use professional tools and cloud providers.

### What is AWS?

**AWS (Amazon Web Services)** is a cloud platform where you can rent computers and storage from Amazon instead of buying your own servers. You only pay for what you use.

### What is Docker?

**Docker** packages your entire application into a container (like a box) that includes everything it needs to run:

- Your code
- Libraries and dependencies
- Configuration settings

This ensures your app runs the same way everywhere (local computer, team member's computer, production server).

### What is Terraform?

**Terraform** is an "Infrastructure as Code" tool. Instead of clicking buttons in AWS Console to create servers, you write code that describes what you want. Terraform then creates it for you automatically.

### What is GitHub Actions?

**GitHub Actions** automatically runs tasks when you push code to GitHub:

1. Build your application (check for errors)
2. Create Docker containers
3. Upload to cloud
4. Deploy to AWS

It's like having a robot that does your deployment work for you!

### The Simple Deployment Flow

```
You write code → Push to GitHub → GitHub Actions runs automatically →
Builds Docker containers → Uploads to AWS → Your app is live!
```

---

## Understanding the Architecture

### Deployment Pipeline Diagram

Here's how your code flows from your computer to production:

```
┌─────────────────────────┐
│   Your Local Computer   │ (Your machine)
│  Edit code, test app    │
└──────────┬──────────────┘
           │
      (git push)
           │
           ▼
┌─────────────────────────┐
│   GitHub Repository     │ (Cloud storage)
│   Your code backup      │
└──────────┬──────────────┘
           │
    (push triggers)
           │
           ▼
┌─────────────────────────────────────┐
│   GitHub Actions (CI/CD Robot)      │
├─────────────────────────────────────┤
│  1. Checkout your code              │
│  2. Build Docker Images             │
│  3. Run tests (optional)            │
│  4. Push images to AWS ECR          │
│  5. Run Terraform                   │
└──────────┬──────────────────────────┘
           │
    (deploys to)
           │
           ▼
┌─────────────────────────────────────┐
│   AWS Cloud Infrastructure          │
├─────────────────────────────────────┤
│  - ECS (Runs your app)              │
│  - RDS (Database)                   │
│  - ALB (Load Balancer)              │
│  - CloudFront (CDN)                 │
│  - Route 53 (DNS)                   │
│  - S3 (Storage)                     │
└──────────┬──────────────────────────┘
           │
           ▼
    ✅ Your app is LIVE!
    Users can access it
```

**What happens when you push code:**

1. You edit code on your computer
2. `git push` sends it to GitHub
3. GitHub automatically triggers GitHub Actions
4. Actions builds everything & deploys to AWS (takes 15-25 minutes)
5. Your updated app is live! 🚀

### System Diagram (Runtime Architecture)

Here's what your production infrastructure looks like when running:

```
┌──────────────────────────────────────────────────────────────┐
│                      Users on the Internet                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
                    (requests & responses)
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  CloudFront & Route 53                │
        │  (Fast delivery & DNS)                │
        │  Figures out where to send users      │
        └───────────────┬───────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  Application Load Balancer (ALB)      │
        │  Distributes traffic evenly           │
        │  Directs /api/* to backend            │
        │  Directs /* to frontend               │
        └───────┬──────────────────────┬────────┘
                │                      │
        ┌───────▼──────┐        ┌──────▼────────┐
        │  Frontend    │        │  Backend      │
        │  (React)     │        │  (.NET Core)  │
        │  3000        │        │  5000         │
        │  Served via  │        │  Web API      │
        │  ECS Fargate │        │  ECS Fargate  │
        └──────┬───────┘        └──────┬────────┘
               │                       │
               │                       │
               │        ┌──────────────▼──────────────┐
               │        │  PostgreSQL Database        │
               │        │  (RDS)                      │
               │        │  Stores all your data       │
               └────────┴─────────────────────────────┘
```

### What Each Component Does

**In Plain English:**

- **Users** access your website through the internet
- **Route 53 (DNS)** figures out the IP address (like a phonebook for websites)
- **CloudFront (CDN)** delivers it fast from servers around the world
- **ALB (Load Balancer)** splits traffic fairly:
  - Frontend requests go to React app running in ECS
  - API requests (`/api/*`) go to .NET backend in ECS
- **Frontend & Backend** both can talk to the PostgreSQL database
- **Everything auto-scales** if many users come at once

### Why This Architecture?

**Benefits:**

- ✅ **Fast**: CloudFront caches content globally
- ✅ **Reliable**: If one server fails, others handle traffic
- ✅ **Scalable**: Auto-scaling handles 10x traffic spikes
- ✅ **Secure**: Database is hidden, only accessed by backend
- ✅ **Managed**: AWS handles backups and patches
- ✅ **Cost-effective**: Pay only for what you use

---

## Prerequisites Checklist

---

## Step-by-Step AWS Setup

### Step 1: Create an AWS Account

1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Enter your email and create a password
4. Complete your contact information
5. Add a payment method (AWS is free for first year, then you pay for what you use)
6. Verify your identity via email/phone
7. Choose a support plan (Basic - Free is fine for now)

### Step 2: Understanding IAM (Identity and Access Management)

**What is IAM?** It's like giving someone specific keys to your house:

- You don't give them the master key (your main AWS account)
- Instead, you create a special "user" with only the permissions they need
- If something goes wrong, you can deactivate just that user, not your whole account

### Step 3: Create an IAM User for Terraform

**Why do this?** Never use your main AWS account credentials. Always create specific users with limited permissions.

**Steps:**

1. Log into AWS Console: https://console.aws.amazon.com
2. Search for "IAM" in the search box
3. Click "IAM" from results
4. In the left menu, click "Users"
5. Click "Create user" button
6. **Set user details:**
   - User name: `terraform-deployer`
   - Uncheck "Provide user access to AWS Management Console"
   - Click "Next"

7. **Attach permissions:**
   - Click "Attach policies directly"
   - Search for and select these policies:
     - `AmazonEC2FullAccess` (for servers)
     - `AmazonECS_FullAccess` (for containers)
     - `AmazonRDSFullAccess` (for database)
     - `ElasticLoadBalancingFullAccess` (for load balancer)
     - `AmazonS3FullAccess` (for storage)
     - `AmazonEC2ContainerRegistryFullAccess` (for Docker images)
   - Click "Next", then "Create user"

8. **Create access keys:**
   - Click on the user you just created
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Choose "Command Line Interface (CLI)"
   - Check checkbox "I understand..."
   - Click "Create access key"
   - **SAVE these somewhere safe:**
     - Access Key ID
     - Secret Access Key
   - Click "Done"

**⚠️ IMPORTANT:** Treat these keys like passwords. Never commit them to GitHub or share them!

### Step 4: Create S3 Bucket for Terraform State

Terraform needs to remember what it created. S3 is cloud storage.

**From your local terminal:**

```bash
# Set your AWS credentials
aws configure
# It will ask for:
# AWS Access Key ID: [paste from Step 3]
# AWS Secret Access Key: [paste from Step 3]
# Default region: us-east-1
# Default output format: json

# Create the bucket
aws s3api create-bucket \
  --bucket job-tracker-terraform-state-12345 \
  --region us-east-1

# The bucket name MUST be globally unique, so add numbers to make it unique!
```

**What happened?** You created a storage bucket in the cloud that Terraform will use.

### Step 5: Create ECR Repositories

ECR (Elastic Container Registry) stores your Docker images.

```bash
# Create repository for backend Docker image
aws ecr create-repository \
  --repository-name job-tracker-backend \
  --region us-east-1

# Create repository for frontend Docker image
aws ecr create-repository \
  --repository-name job-tracker-frontend \
  --region us-east-1
```

**What happened?** You created two storage locations in the cloud for your Docker images.

### Step 6: Prepare Your Local Machine

---

## Setting Up Your Local Environment

### Prerequisites for Windows

You need to install these tools on your computer:

#### 1. **AWS CLI v2** (for managing AWS from terminal)

1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer
3. Click "Next" through the wizard, then "Install"
4. Click "Finish"
5. Open PowerShell and verify:
   ```bash
   aws --version
   # Should output something like: aws-cli/2.x.x
   ```

#### 2. **Terraform** (for creating cloud infrastructure)

1. Download: https://www.terraform.io/downloads
2. Choose "Windows" and your processor type
3. Extract the ZIP file to a folder (e.g., `C:\terraform`)
4. Add to PATH:
   - Open "Environment Variables" (search in Start menu)
   - Click "Edit the system environment variables"
   - Click "Environment Variables" button
   - Under "System variables", click "Path", then "Edit"
   - Click "New"
   - Enter: `C:\terraform` (or wherever you extracted it)
   - Click "OK" three times
5. Open a **new** PowerShell and verify:
   ```bash
   terraform --version
   # Should output: Terraform v1.x.x ...
   ```

#### 3. **Docker Desktop** (for building containers)

1. Download: https://www.docker.com/products/docker-desktop
2. Run the installer
3. Accept the agreement and install
4. Restart your computer when prompted
5. Open PowerShell and verify:
   ```bash
   docker --version
   # Should output something like: Docker version 25.x.x
   ```

#### 4. **Git** (you probably have this)

1. Download: https://git-scm.com/download/win
2. Run installer, accept defaults
3. Open PowerShell and verify:
   ```bash
   git --version
   # Should output: git version 2.x.x
   ```

### Verify Everything is Installed

```bash
# Run this in PowerShell
aws --version
docker --version
terraform --version
git --version

# All four commands should show version numbers
```

---

## Understanding the Architecture

### Directory Structure

```
terraform/
├── main.tf              # Main configuration
├── variables.tf         # Input variables
├── outputs.tf          # Output values
├── backend.tf          # S3 backend config
├── vpc.tf              # VPC, Subnets, Security Groups
├── ecs.tf              # ECS Cluster, Services, Tasks
├── rds.tf              # RDS Database
├── alb.tf              # Application Load Balancer
├── cloudfront.tf       # CloudFront Distribution
├── route53.tf          # DNS Records
└── terraform.tfvars    # Variable values (gitignored)
```

### What is Terraform Code?

Terraform code describes cloud resources in plain language:

```hcl
# This means: "Create an AWS VPC with this configuration"
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  # ... more settings
}
```

Instead of clicking AWS Console buttons, terraform automates it!

### Create Terraform Directory Structure

In your project root:

```bash
mkdir terraform
cd terraform
```

Create these files in the `terraform` folder:

#### 1. `backend.tf`

```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket  = "job-tracker-terraform-state"
    key     = "prod/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
}
```

#### 2. `variables.tf`

```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "job-tracker"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "container_port" {
  description = "Container port for backend"
  type        = number
  default     = 5000
}

variable "container_cpu" {
  description = "Container CPU units (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "container_memory" {
  description = "Container memory in MB"
  type        = number
  default     = 512
}

variable "db_engine_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "14.7"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "jobtracker"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Domain name for Route 53"
  type        = string
}
```

#### 3. `vpc.tf`

```hcl
# Create VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.app_name}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.app_name}-public-subnet-1"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.app_name}-public-subnet-2"
  }
}

# Private Subnets
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "${var.app_name}-private-subnet-1"
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "${var.app_name}-private-subnet-2"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.app_name}-public-rt"
  }
}

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

# Security Groups
resource "aws_security_group" "alb" {
  name   = "${var.app_name}-alb-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-alb-sg"
  }
}

resource "aws_security_group" "ecs" {
  name   = "${var.app_name}-ecs-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-ecs-sg"
  }
}

resource "aws_security_group" "rds" {
  name   = "${var.app_name}-rds-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-rds-sg"
  }
}
```

#### 4. `rds.tf`

```hcl
# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "${var.app_name}-db-subnet-group"
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier            = "${var.app_name}-db"
  engine               = "postgres"
  engine_version       = var.db_engine_version
  instance_class       = var.db_instance_class
  allocated_storage    = 20
  db_name              = var.db_name
  username             = var.db_username
  password             = var.db_password
  publicly_accessible  = false
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.app_name}-final-snapshot"
  backup_retention_period   = 7

  tags = {
    Name = "${var.app_name}-db"
  }
}

output "rds_endpoint" {
  value = aws_db_instance.main.endpoint
}
```

#### 5. `ecs.tf`

```hcl
# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.app_name}-backend"
  retention_in_days = 7

  tags = {
    Name = "${var.app_name}-backend-logs"
  }
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.app_name}-frontend"
  retention_in_days = 7

  tags = {
    Name = "${var.app_name}-frontend-logs"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.app_name}-cluster"
  }
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.app_name}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Backend Task Definition
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.app_name}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.container_cpu
  memory                   = var.container_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([{
    name      = "${var.app_name}-backend"
    image     = "${aws_ecr_repository.backend.repository_url}:latest"
    essential = true
    portMappings = [{
      containerPort = var.container_port
      hostPort      = var.container_port
      protocol      = "tcp"
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
    environment = [
      {
        name  = "ASPNETCORE_ENVIRONMENT"
        value = var.environment
      },
      {
        name  = "ASPNETCORE_URLS"
        value = "http://0.0.0.0:${var.container_port}"
      }
    ]
    secrets = [
      {
        name      = "SQLSERVER_CONNECTION_STRING"
        valueFrom = "${aws_secretsmanager_secret.db_connection.arn}:password::"
      }
    ]
  }])
}

# Frontend Task Definition
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.app_name}-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.container_cpu
  memory                   = var.container_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([{
    name      = "${var.app_name}-frontend"
    image     = "${aws_ecr_repository.frontend.repository_url}:latest"
    essential = true
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
      protocol      = "tcp"
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

# Backend Service
resource "aws_ecs_service" "backend" {
  name            = "${var.app_name}-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "${var.app_name}-backend"
    container_port   = var.container_port
  }

  depends_on = [aws_lb_listener.main]
}

# Frontend Service
resource "aws_ecs_service" "frontend" {
  name            = "${var.app_name}-frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "${var.app_name}-frontend"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.main]
}

# ECR Repositories
resource "aws_ecr_repository" "backend" {
  name                 = "${var.app_name}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.app_name}-backend-repo"
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "${var.app_name}-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.app_name}-frontend-repo"
  }
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  value = aws_ecr_repository.frontend.repository_url
}
```

#### 6. `alb.tf`

```hcl
# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.app_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  enable_deletion_protection = true

  tags = {
    Name = "${var.app_name}-alb"
  }
}

# Backend Target Group
resource "aws_lb_target_group" "backend" {
  name        = "${var.app_name}-backend-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    interval            = 30
    path                = "/api/auth/test"
    matcher             = "200"
  }

  tags = {
    Name = "${var.app_name}-backend-tg"
  }
}

# Frontend Target Group
resource "aws_lb_target_group" "frontend" {
  name        = "${var.app_name}-frontend-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    interval            = 30
    path                = "/"
    matcher             = "200"
  }

  tags = {
    Name = "${var.app_name}-frontend-tg"
  }
}

# ALB Listener
resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# API routing
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}
```

#### 7. `terraform.tfvars`

```hcl
aws_region     = "us-east-1"
app_name       = "job-tracker"
environment    = "production"
domain_name    = "jobtracker.com"
db_username    = "admin"
db_password    = "YourSecurePassword123!"  # Change this!
```

---

## Docker - Containerizing Your Application

### What is a Docker Container?

**Think of it like a shipping container:**

- Traditional shipping: Put stuff in a box, but it might get damaged or broken
- Shipping Container: Everything is sealed in a standardized container, arrives safely the same way

**Docker container:**

- Your code + dependencies sealed together
- Runs the same on your laptop, team member's laptop, and AWS
- Prevents "works on my machine" problems

### Dockerfile for Backend

Create file: `260001_be/Dockerfile`

```dockerfile
# Start with .NET 8 SDK (includes everything to build)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project file
COPY ["JobTracker.Api.csproj", "./"]
# Download dependencies (packages)
RUN dotnet restore "JobTracker.Api.csproj"

# Copy all source code
COPY . .
# Build the project (compile)
RUN dotnet build "JobTracker.Api.csproj" -c Release -o /app/build

# Publish for production
FROM build AS publish
RUN dotnet publish "JobTracker.Api.csproj" -c Release -o /app/publish

# Final stage - only runtime, not build tools (smaller image)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
# Copy only what we need from build
COPY --from=publish /app/publish .

# Backend runs on port 5000
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

# When container starts, run the application
ENTRYPOINT ["dotnet", "JobTracker.Api.dll"]
```

**What happens when you build this:**

1. Download .NET SDK
2. Copy your code
3. Download all dependencies (packages)
4. Compile your code
5. Create a smaller runtime image
6. When container starts, automatically run your API

### Dockerfile for Frontend

Create file: `260001_fe/Dockerfile`

```dockerfile
# Build stage - install dependencies and build React
FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm ci

# Copy all source code
COPY . .
# Build for production (creates optimized /dist folder)
RUN npm run build

# Production stage - serve the built files
FROM node:18-alpine
WORKDIR /app

# Install 'serve' to serve static files
RUN npm install -g serve

# Copy only the built files from build stage
COPY --from=build /app/dist ./dist

# Frontend runs on port 3000
EXPOSE 3000

# When container starts, serve the built files
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**What happens when you build this:**

1. Download Node.js
2. Copy source code
3. Run `npm run build` (creates production-optimized files)
4. Create a minimal runtime image
5. When container starts, serve the built frontend

### Testing Locally with Docker Compose

Create file: `docker-compose.yml` in your project root

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: testpassword
      POSTGRES_DB: jobtracker
    ports:
      - "5432:5432" # Your PC's port 5432 -> Container's 5432
    volumes:
      - postgres_data:/var/lib/postgresql/data # Save data even if container dies

  # Backend API
  backend:
    build: ./260001_be # Build from Dockerfile in be folder
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      # Connection string to PostgreSQL
      ConnectionStrings__DefaultConnection: "Server=postgres;Port=5432;Database=jobtracker;User Id=admin;Password=testpassword;"
    ports:
      - "5000:5000"
    depends_on:
      - postgres # Wait for database to start first

  # Frontend React
  frontend:
    build: ./260001_fe # Build from Dockerfile in fe folder
    ports:
      - "3000:3000"
    environment:
      # Tell frontend where the API is
      VITE_API_URL: http://localhost:5000/api
    depends_on:
      - backend # Wait for backend to start first

# Persistent storage for database
volumes:
  postgres_data:
```

### Test Docker Compose Locally

```bash
# Go to your project root
cd c:\NHI\2026_IT-Project\260001_Job_Tracker

# Build and start everything
docker-compose up

# You should see:
# - postgres logs
# - backend starting on http://localhost:5000
# - frontend starting on http://localhost:3000

# Open http://localhost:3000 in your browser to test

# To stop everything
# Ctrl+C in the terminal, or:
docker-compose down
```

---

## Terraform - Infrastructure as Code

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY ["JobTracker.Api.csproj", "./"]
RUN dotnet restore "JobTracker.Api.csproj"

COPY . .
RUN dotnet build "JobTracker.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "JobTracker.Api.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

ENTRYPOINT ["dotnet", "JobTracker.Api.dll"]
```

### Frontend Dockerfile

Create `260001_fe/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Docker Compose (Local Testing)

Create `docker-compose.yml` in project root:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
      POSTGRES_DB: jobtracker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./260001_be
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ConnectionStrings__DefaultConnection: "Server=postgres;Port=5432;Database=jobtracker;User Id=admin;Password=password;"
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:
    build: ./260001_fe
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:5000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

Test locally: `docker-compose up`

---

## GitHub Actions - Automated Deployment

### What is CI/CD?

**CI (Continuous Integration):** Every time you push code, GitHub automatically:

- Checks your code for errors
- Runs tests
- Builds your application

**CD (Continuous Deployment):** If all checks pass:

- Builds Docker containers
- Uploads to cloud storage (ECR)
- Automatically deploys to AWS

**Benefits:**

- No manual deployment steps
- Catch errors before they reach production
- Faster releases
- Automatic rollback if something fails

### How It Works

```
1. You push code to GitHub
        ↓
2. GitHub Actions sees the push
        ↓
3. Automatically builds Docker images
        ↓
4. Uploads to AWS ECR (cloud storage)
        ↓
5. Runs Terraform to update AWS
        ↓
6. Your new code is live!
```

### Create GitHub Actions Workflow

Create folder and file: `.github/workflows/deploy.yml`

```
.github/
└── workflows/
    └── deploy.yml
```

### GitHub Actions Workflow Code

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com
  BACKEND_REPOSITORY: job-tracker-backend
  FRONTEND_REPOSITORY: job-tracker-frontend

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        run: aws ecr get-login-password --region ${{ env.AWS_REGION }} | docker login --username AWS --password-stdin ${{ env.ECR_REGISTRY }}

      - name: Build and push backend image
        run: |
          docker build -t ${{ env.ECR_REGISTRY }}/${{ env.BACKEND_REPOSITORY }}:latest ./260001_be
          docker push ${{ env.ECR_REGISTRY }}/${{ env.BACKEND_REPOSITORY }}:latest

      - name: Build and push frontend image
        run: |
          docker build -t ${{ env.ECR_REGISTRY }}/${{ env.FRONTEND_REPOSITORY }}:latest ./260001_fe
          docker push ${{ env.ECR_REGISTRY }}/${{ env.FRONTEND_REPOSITORY }}:latest

      - name: Deploy with Terraform
        run: |
          cd terraform
          terraform init
          terraform plan
          terraform apply -auto-approve
        env:
          TF_VAR_db_username: ${{ secrets.DB_USERNAME }}
          TF_VAR_db_password: ${{ secrets.DB_PASSWORD }}
```

### GitHub Secrets Setup

**What are Secrets?** GitHub Secrets store sensitive information (passwords, API keys) securely. The workflow YAML can reference them, but they're never shown in logs.

**Steps to add secrets:**

1. Go to your GitHub repository
2. Click "Settings" tab (top right)
3. In left menu, click "Secrets and variables" → "Actions"
4. Click "New repository secret" button
5. Add each of these secrets:

**Secret 1: AWS_ACCESS_KEY_ID**

- Name: `AWS_ACCESS_KEY_ID`
- Value: Your AWS access key from Step 3 of AWS Setup
- Click "Add secret"

**Secret 2: AWS_SECRET_ACCESS_KEY**

- Name: `AWS_SECRET_ACCESS_KEY`
- Value: Your AWS secret key from Step 3 of AWS Setup
- Click "Add secret"

**Secret 3: AWS_ACCOUNT_ID**

- Name: `AWS_ACCOUNT_ID`
- Value: Your AWS account number (visible in AWS Console > Account ID)
- Click "Add secret"

**Secret 4: DB_USERNAME**

- Name: `DB_USERNAME`
- Value: `admin` (or whatever you chose)
- Click "Add secret"

**Secret 5: DB_PASSWORD**

- Name: `DB_PASSWORD`
- Value: Your secure database password
- Click "Add secret"

**What does this accomplish?**

- GitHub Actions workflow can now access these values
- They're encrypted and never shown in logs
- Your credentials stay secret even though the code is public

---

## Free Deployment (Railway - Recommended for Portfolio) 🚀

**If you chose Path B (Free), start here!**

### Why Railway?

- ✅ **Completely FREE** for most projects
- ✅ **5-minute setup** vs 15-25 minutes for AWS
- ✅ **Auto-deploy** - push to GitHub, it deploys automatically
- ✅ **Includes database** - no setup needed
- ✅ **Global hosting** - fast for users worldwide
- ✅ **No server management** - they handle everything
- ✅ **No cleanup needed** - just delete the project if done
- ✅ **Looks professional** - perfect for portfolio

### Step-by-Step Railway Deployment

**Step 1: Create Railway Account (1 minute)**

1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway to access your GitHub account
4. You're in!

**Step 2: Create New Project (1 minute)**

1. Click "New Project" button
2. Select "Deploy from GitHub repo"
3. Select your `260001_Job_Tracker` repository
4. Click "Deploy"

**Step 3: Auto-Detected Services (Already Done)**

Railway automatically creates:

- **Frontend**: Node.js environment for React app
- **Backend**: .NET environment for C# API
- Click "Add" → PostgreSQL for your database

**Step 4: Set Environment Variables (1 minute)**

For **Backend Service**:

1. Go to Backend service settings
2. Add variable: `ASPNETCORE_ENVIRONMENT` = `Production`
3. Database connection is **auto-created** by Railway

For **Frontend Service**:

1. Go to Frontend service settings
2. Add variable: `VITE_API_URL` = `https://your-backend-url.railway.app/api`
   - You'll get the backend URL from Railway dashboard

**Step 5: Deploy (2 minutes)**

1. Click "Deploy" button
2. Watch the logs - should show success
3. Both frontend and backend deploy automatically

**Step 6: Get Your Live URLs (30 seconds)**

1. Go to Railway project dashboard
2. Click **Frontend** service → copy the public URL
3. Share this URL - your app is LIVE! 🎉

### What You Get with Railway

| Feature            | AWS                               | Railway                  |
| ------------------ | --------------------------------- | ------------------------ |
| **Setup Time**     | 15-25 minutes                     | 5 minutes                |
| **Server Setup**   | Use Terraform                     | Automatic                |
| **Database Setup** | Create RDS manually               | Automatic                |
| **Deploy**         | Code → GitHub Actions → AWS       | Code → Auto-deployed     |
| **Auto-restart**   | No (you set up monitoring)        | Yes                      |
| **Cost**           | $70-100/month                     | FREE                     |
| **Cleanup**        | 30 minutes (delete all resources) | Delete project (instant) |

### Actual Cost (Railway)

**Free tier provides:**

- 500 compute hours/month
- 5GB storage
- Database included

**Your app uses:**

- ~100 hours/month (plenty in free tier)
- ~500MB storage (well under 5GB)

**Monthly cost: $0** ✅

**If you exceed free tier:**

- Extra compute: $0.000556/hour = ~$5-10/month extra (MAX)
- Railway will never surprise you with bills

### Delete Your Railway Project

When you're done with your portfolio project:

1. Go to Railway dashboard
2. Click **Settings** (gear icon, bottom right)
3. Scroll to **Danger Zone** section
4. Click **Delete Project**
5. Confirm deletion
6. Done - everything is deleted instantly

**Cost after deletion: $0** - completely gone!

---

## Complete Deployment Walkthrough (AWS Path A Only)

This is the step-by-step process to get your app live on AWS.

**⚠️ IMPORTANT:** This section is only for users who chose **Path A (Professional AWS)**. If you chose Railway, you're already live at this point - no need to follow this section!

**⚠️ REMINDER:** When finished with AWS, follow the "AWS Cleanup & Cost Management" section below to delete resources and prevent $61/month in charges!

### Phase 1: Local Testing (Before Pushing to AWS)

**Step 1: Test Docker Locally**

```bash
# Go to your project root
cd c:\NHI\2026_IT-Project\260001_Job_Tracker

# Start everything locally with Docker
docker-compose up

# Wait for messages like:
# postgres_1   | database system is ready to accept connections
# backend_1    | info: Microsoft.Hosting.Lifetime[14]...
# frontend_1   | > serve -s dist -l 3000

# Test in browser: http://localhost:3000
# If it works, Ctrl+C to stop

docker-compose down
```

**Why do this?** Docker containers must work locally before they'll work in AWS.

### Phase 2: Prepare Your Git Repository

**Step 2: Create Files in Your Repository**

In PowerShell in your project root:

```bash
# Create all necessary folders
mkdir terraform
mkdir .github/workflows

# Create terraform/backend.tf with the code from earlier section
# Create terraform/variables.tf with the code from earlier section
# etc...

# Create .github/workflows/deploy.yml with the code from earlier section

# Create Dockerfile in both backend and frontend folders
# (Copy from the Docker section above)
```

**Step 3: Push to GitHub**

```bash
git add .
git commit -m "Add production deployment configuration with Docker, Terraform, and CI/CD"
git push origin main
```

**What happened?** Your deployment configuration is now backed up on GitHub.

### Phase 3: Configure AWS for Automated Deployment

**Step 4: Create S3 Bucket for Terraform**

Terraform needs to save its state. We use S3 (cloud storage).

```bash
# Make sure you ran: aws configure (from earlier)

# Create bucket (must have unique name - add a number)
aws s3api create-bucket `
  --bucket job-tracker-terraform-state-YOUR-UNIQUE-ID `
  --region us-east-1

# Verify it was created
aws s3 ls

# You should see your bucket in the list
```

**Step 5: Create ECR Repositories**

ECR stores your Docker images.

```bash
# Create backend repo
aws ecr create-repository `
  --repository-name job-tracker-backend `
  --region us-east-1

# Create frontend repo
aws ecr create-repository `
  --repository-name job-tracker-frontend `
  --region us-east-1

# You should see output with the repository URLs
```

**Step 6: Get Your AWS Account ID**

```bash
# Find your account ID
aws sts get-caller-identity

# Look for the "Account" number
# Example: "123456789012"
# You'll need this for GitHub Secrets
```

### Phase 4: Set Up GitHub Secrets (Already Done Above)

**Skip this - you already added GitHub Secrets earlier!**

### Phase 5: Trigger the Automated Deployment

**Step 7: GitHub Actions Automatically Deploys**

Now when you push code to GitHub:

1. GitHub Actions automatically runs the workflow
2. Builds Docker images
3. Uploads to AWS ECR
4. Runs Terraform to set up infrastructure
5. Your app is deployed!

**To watch it happen:**

1. Go to your GitHub repository
2. Click "Actions" tab
3. You should see a workflow running
4. Click on it to see detailed logs
5. Wait for all steps to turn green ✅

**If something fails (red ❌):**

- Click the failed step
- Read the error message
- See Troubleshooting Guide below

### Phase 6: Access Your Application

**Step 8: Find Your Application URL**

```bash
# After deployment succeeds, get the load balancer URL
aws elbv2 describe-load-balancers `
  --region us-east-1

# Look for the "DNSName" field
# It will look like: job-tracker-alb-123456789.us-east-1.elb.amazonaws.com

# Open that URL in your browser!
```

**What if it doesn't work immediately?**

- Wait 5-10 minutes for everything to start
- Refresh the page
- Check CloudWatch logs (see Monitoring section)

---

## AWS Cleanup & Cost Management 🗑️

**This section is critical if you chose Path A (AWS)!**

When you're done with your AWS deployment, you MUST delete resources to avoid ongoing charges.

### The Cost Problem

**If you LEAVE AWS running without using it:**

| Service             | Idle Cost/Month | What You Pay For                  |
| ------------------- | --------------- | --------------------------------- |
| RDS (Database)      | $30             | Stays running 24/7 even if unused |
| ECS (Web servers)   | $14             | Compute resources allocated       |
| ALB (Load Balancer) | $16             | Runs 24/7 even if no traffic      |
| Data Transfer       | $1              | Minimal if no usage               |
| S3 & CloudWatch     | $1              | Storage and monitoring            |
| **TOTAL**           | **~$61/month**  | **Running but not used**          |

**Example:** Delete resources March 1, but forget to delete ALB. By April 1, you've been charged $61 for infrastructure you never used!

### Quick Deletion Checklist (15 minutes to $0)

If you need to delete and start fresh anywhere, follow this checklist:

**Step 1: Delete ECS Service (5 minutes)**

```bash
# In AWS Console:
# 1. Go to ECS → Clusters → job-tracker-cluster
# 2. Click "job-tracker-service"
# 3. Click "Delete"
# 4. Select "Force delete service"
# 5. Click "Delete" and wait for deletion
```

**Step 2: Delete Load Balancer (3 minutes)**

```bash
# In AWS Console:
# 1. Go to EC2 → Load Balancers
# 2. Select "job-tracker-alb"
# 3. Click "Delete"
# 4. Confirm deletion
```

**Step 3: Delete RDS Database (5 minutes)**

```bash
# In AWS Console:
# 1. Go to RDS → Databases
# 2. Click "job-tracker-db"
# 3. Click "Delete"
# 4. Uncheck "Create final snapshot" (you don't need it)
# 5. Type "delete me" in confirmation
# 6. Click "Delete database" and wait
```

**Step 4: Delete VPC Resources (2 minutes)**

```bash
# Once ECS and RDS are deleted, run:
terraform destroy

# This will:
# - Delete security groups
# - Delete subnets
# - Delete VPC
# - Delete NAT gateway
# - Clean up everything else

# Confirm by typing "yes" when asked
```

**Step 5: Verify $0 Cost (1 minute)**

```bash
# Go to AWS Console → Billing Dashboard
# Check "Bill Details" → filter by cost
# Should show $0 or nearly $0 for this project
```

### Step-by-Step Deletion (Detailed Version)

If above checklist isn't working, follow this detailed guide:

#### Deletion Step 1: Delete ECS Service

1. **Go to ECS Console**
   - AWS Console → ECS → Clusters
   - Click `job-tracker-cluster`

2. **Find Your Service**
   - You'll see "Services" section
   - Click `job-tracker-service`

3. **Delete Service**
   - Click "Delete" button (top right)
   - Check "Force delete service"
   - Click "Delete"
   - Status changes to "DELETE_IN_PROGRESS"
   - Wait 5 minutes for complete deletion

4. **Verify Deletion**
   - Service should disappear from list
   - ECS costs: **STOPPED ✅**

#### Deletion Step 2: Delete Load Balancer

1. **Go to EC2 Console**
   - AWS Console → EC2 → Load Balancers
   - You'll see `job-tracker-alb`

2. **Delete the Load Balancer**
   - Select `job-tracker-alb` (checkbox on left)
   - Click "Delete" button
   - Confirm deletion

3. **Delete Target Groups** (attached to ALB)
   - EC2 → Target Groups
   - Find groups matching "job-tracker"
   - Select and delete each one
   - ALB costs: **STOPPED ✅**

#### Deletion Step 3: Delete RDS Database

1. **Go to RDS Console**
   - AWS Console → RDS → Databases
   - Find `job-tracker-db`

2. **Modify Database** (if needed)
   - Click on database name
   - If you see "DB cluster" message, delete cluster instead:
     - RDS → DB Clusters
     - Select `job-tracker-cluster`
     - Click "Delete" and follow same steps below

3. **Delete the Database**
   - Click "Delete" button
   - **IMPORTANT:** Uncheck "Create final snapshot"
     - You don't need a backup for a test project
     - Saves $1-2 in storage
   - Type: `delete me` in confirmation field
   - Click "Delete DB instance"
   - Status: "DELETING"
   - Wait 10 minutes for deletion

4. **Verify Deletion**
   - Database should disappear from list
   - RDS costs: **STOPPED ✅**

#### Deletion Step 4: Clean Up with Terraform

1. **Prerequisites**
   - Go to folder with your `terraform` files
   - Must have `terraform.tfvars` with AWS credentials

2. **Run Destroy Command**

   ```bash
   # In terminal, in your deployment folder:
   terraform destroy

   # Review the resources that will be deleted
   # Type "yes" to confirm
   ```

3. **What Terraform Destroys**
   - Security groups (all)
   - VPC and subnets
   - NAT gateway
   - Internet gateway
   - Any remaining resources

4. **Verify Terraform Deletion**

   ```bash
   # List remaining resources:
   terraform state list

   # Should be empty:
   # No resources in state.
   ```

#### Deletion Step 5: Check for Remaining Resources

**Safety Check - Make sure nothing is left:**

```bash
# Search for each resource and verify deleted:
# AWS Console → search for "job-tracker"
# Should find NOTHING

# Check each service:
# - ECS clusters: NONE with "job-tracker"
# - RDS databases: NONE with "job-tracker"
# - Load Balancers: NONE with "job-tracker"
# - VPCs: Should only have default VPC
```

### How to Prevent Accidental Charges

**Option 1: AWS Billing Alerts (Recommended)**

Set up an alert if costs exceed $5/month:

1. AWS Console → Billing → Billing Preferences
2. Check "Receive Billing Alerts"
3. Go to CloudWatch → Alarms
4. Create alarm for billing > $5/month
5. Email notification when alarm triggers

**Option 2: Stop Services Instead of Delete**

Not ready to delete? Stop them temporarily:

```bash
# Keep ECS service but stop it:
aws ecs update-service --cluster job-tracker-cluster \
  --service job-tracker-service \
  --desired-count 0

# Costs less but still charges for database
```

**Option 3: Reserved Capacity (If Keeping AWS)**

If you think you'll use AWS long-term:

- Consider Reserved Instances (save 30% vs on-demand)
- Commitment: 1 year or 3 years
- Only if you're sure you'll keep running

### Deletion Verification Checklist

After following deletion steps, verify everything is gone:

```
☐ ECS Service: DELETED (not just stopped)
☐ ECS Cluster: EMPTY (no tasks running)
☐ ALB: DELETED from Load Balancers list
☐ Target Groups: DELETED
☐ RDS Database: DELETED (not just stopped)
☐ VPC: Reset to AWS default VPC only
☐ Security Groups: Only "default" remains
☐ NAT Gateway: DELETED
☐ Elastic IPs: RELEASED
☐ S3 Buckets: DELETED (if any created)
☐ CloudFormation: STACKS deleted (if any created)
```

### Verify $0 Cost

**Final Step - Check Your Bill:**

1. AWS Console → Billing → Billing Dashboard
2. Check "Current charges" → should be ~$0 (or your expected baseline)
3. Go to "Bill Details" → search for "job-tracker"
4. Should find NOTHING

**If you still see charges after 24 hours:**

- Something wasn't deleted
- Check CloudWatch logs
- Go through deletion checklist again

### Emergency: Disable All Resources Quickly

If you need to just STOP everything immediately:

```bash
# 1. Stop ECS tasks
aws ecs update-service --cluster job-tracker-cluster \
  --service job-tracker-service --desired-count 0

# 2. Stop RDS database (won't delete, just stops running)
# AWS Console → RDS → stop database

# 3. Delete ALB
aws elbv2 delete-load-balancer \
  --load-balancer-arn [your-alb-arn]
```

This cuts costs from $61 → ~$30/month temporarily, buying you time to do full deletion.

### Didn't Delete? What to Do

**If you forgot and now have unexpected charges:**

1. **Delete everything immediately** (follow steps above)
2. **Contact AWS Support**
   - Explain: "I had a portfolio project, took it down, didn't realize AWS was still running"
   - Request account review
   - AWS often credits unexpected charges for new accounts
3. **Set spending limit**
   - AWS Console → Billing → Cost Management
   - Set "Monthly budget limit" to $1
   - AWS will alert you before charges exceed this

---

### Checking if Your Application is Running

**Simple Health Check:**

```bash
# Test your backend API
curl http://your-load-balancer-url/api/auth/test

# If you get a JSON response, it's working!
# If you get an error, check CloudWatch logs (below)
```

### CloudWatch Logs (Where to Look for Errors)

CloudWatch is AWS's logging service. It shows what your application is doing.

**View backend logs:**

```bash
# Get the last 50 log entries
aws logs tail /ecs/job-tracker-backend --max-items 50

# Follow logs in real-time (like `tail -f` in Linux)
aws logs tail /ecs/job-tracker-backend --follow
```

**View frontend logs:**

```bash
aws logs tail /ecs/job-tracker-frontend --max-items 50
aws logs tail /ecs/job-tracker-frontend --follow
```

**Looking for Errors:**

- If you see `error:` or `ERROR` in logs, something is wrong
- Read the error message - it usually tells you what's wrong
- See Troubleshooting section below

### Check if Containers Are Running

**View ECS services:**

```bash
aws ecs describe-services `
  --cluster job-tracker-cluster `
  --services job-tracker-backend-service job-tracker-frontend-service `
  --region us-east-1
```

**Look for:**

- `"desiredCount": 2` (you want 2 running)
- `"runningCount": 2` (both are running)
- `"status": "ACTIVE"` (service is healthy)

**If runningCount < desiredCount:**

- Some containers failed to start
- Check CloudWatch logs above
- Common causes: out of memory, database not accessible, port already in use

### Database Connection Issues

**Check if database is accessible:**

```bash
# List RDS instances
aws rds describe-db-instances --region us-east-1

# Look for Status: "available"
# Note the Endpoint - the backend must be able to reach it
```

### Monitoring Server Health

**Check CPU and Memory usage:**

```bash
# List all metrics
aws cloudwatch list-metrics `
  --namespace AWS/ECS `
  --region us-east-1
```

**What you're looking for:**

- CPU Usage: Should be < 80% most of the time
- Memory Usage: Should be < 80% most of the time
- If higher, your app needs more resources

### Auto-Scaling (Automatically Handle More Users)

Your infrastructure automatically scales when:

- CPU goes above 80% → More containers start
- Traffic increases → Load balancer splits requests evenly
- Traffic decreases → Extra containers stop (saves money)

You don't need to do anything - it happens automatically!

### Cost Tracking

**Check your current AWS bill:**

1. Go to AWS Console
2. Search for "Billing"
3. Click "Billing Dashboard"
4. See your current month's costs

**Cost breakdown:**

- ECS: ~$14/month (runs your app)
- RDS: ~$30/month (database)
- Load Balancer: ~$16/month
- Data transfer: $10-50/month
- **Total: ~$70-100/month**

If it's higher:

- Check CloudWatch for unused services
- Check ECS task definitions - are they asking for too much memory/CPU?
- Consider using Fargate Spot instances (cheaper but can be interrupted)

---

## Rollback Plan

### If deployment fails:

```bash
# Rollback Terraform
terraform apply -auto-approve -var="container_image=previous-image:tag"

# Or manually revert to previous task definition
aws ecs update-service \
  --cluster job-tracker-cluster \
  --service job-tracker-backend-service \
  --task-definition previous-backend
```

---

## Next Steps

1. ✅ Set up AWS account and IAM user
2. ✅ Create S3 bucket for Terraform state
3. ✅ Create ECR repositories
4. ✅ Add Dockerfiles to project
5. ✅ Create Terraform configuration
6. ✅ Set up GitHub Actions
7. ✅ Configure GitHub Secrets
8. ✅ Deploy with GitHub Actions
9. ✅ Monitor with CloudWatch
10. ✅ Set up alerts and auto-scaling

---

---

## Troubleshooting Guide

### General Debugging Process

**When something goes wrong:**

1. **Check GitHub Actions first**
   - Go to your repository → Actions tab
   - Look for red ❌ marks
   - Click on the failed workflow
   - Click the failed step to see the error message

2. **Check CloudWatch Logs**
   - Most application errors show up in logs
   - Use: `aws logs tail /ecs/job-tracker-backend --follow`

3. **Check if Services Are Running**
   - `aws ecs describe-services --cluster job-tracker-cluster --services job-tracker-backend-service --region us-east-1`
   - If runningCount < desiredCount, containers failed to start

4. **Check Terraform Status**
   - `cd terraform`
   - `terraform state list`
   - This shows what was created

### Problem: "Docker Build Fails"

**Error message looks like:**

```
ERROR: Service 'backend' failed to build
```

**Possible causes & fixes:**

1. **Missing dependencies**
   - Check that `package.json` (frontend) or `.csproj` (backend) has all dependencies listed
   - Run locally first: `npm install` or `dotnet restore`

2. **Port already in use**
   - Something else is running on your port
   - Kill conflicting processes: `netstat -ano | findstr :5000`

3. **Docker daemon not running**
   - Make sure Docker Desktop is open
   - Start it and try again

**To test locally:**

```bash
docker-compose up
# See if build works locally first
```

### Problem: "GitHub Actions Fails at 'Deploy with Terraform'"

**Error message in Actions log:**

```
Error: credential issues
```

**Most common cause:** GitHub Secrets not set correctly

**Fix:**

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Verify you have ALL 5 secrets:
   - `AWS_ACCESS_KEY_ID` ✓
   - `AWS_SECRET_ACCESS_KEY` ✓
   - `AWS_ACCOUNT_ID` ✓
   - `DB_USERNAME` ✓
   - `DB_PASSWORD` ✓
3. If missing, add them
4. Go back to Actions and re-run the workflow

### Problem: "Backend Container Starts Then Stops"

**In CloudWatch logs you see:**

```
Exception: Cannot connect to database
```

**Cause:** Backend can't reach database

**Causes & fixes:**

1. **Database password wrong**
   - Update: `terraform.tfvars`
   - Change: `db_password = "your-new-password"`
   - Run: `terraform apply`

2. **Database not running**
   - Check: `aws rds describe-db-instances`
   - Look for: `"DBInstanceStatus": "available"`
   - If not available, wait 5 minutes

3. **Wrong security group**
   - Database security group probably needs to allow port 5432
   - In AWS Console → VPC → Security Groups → find RDS security group
   - Add inbound rule: Port 5432 from ECS security group

### Problem: "Frontend Shows Blank Page"

**What I see:** Just white page, no error

**Possible causes:**

1. **Frontend can't reach backend**
   - The frontend needs to know the backend URL
   - Look at your environment variables
   - Check: `VITE_API_URL=http://your-alb-url/api`

2. **Backend API not responding**
   - Test: `curl http://your-alb-url/api/auth/test`
   - If no response, backend isn't running (see above problem)

3. **CORS Issue**

   ```
   Error: Access to XMLHttpRequest blocked by CORS
   ```

   - Backend CORS not configured
   - In `Program.cs`, check CORS is enabled
   - Should have: `builder.Services.AddCors(...)`

### Problem: "Out of Memory" or "Service Crashes Constantly"

**Look in CloudWatch:**

```
OutOfMemory: Container exited with code 137
```

**Fix:** Increase memory

1. Edit `terraform/ecs.tf`
2. Find: `container_memory = 512`
3. Change to: `container_memory = 1024`
4. Run: `terraform apply`

**Cost impact:** Higher memory = slightly higher cost (~$7/month per GB)

### Problem: "Terraform Fails at VPC Creation"

**Error:**

```
Error: Error creating VPC: VpcLimitExceeded
```

**Cause:** AWS account limit reached

**Fix:**

1. Go to AWS Console → VPC
2. Delete old VPCs you're not using
3. Or request limit increase from AWS
4. Then try: `terraform apply` again

### Problem: "ECR Image Push Fails"

**Error in GitHub Actions:**

```
Failed to push image to ECR
```

**Fix:**

```bash
# Manually authenticate with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Try pushing again manually
docker build -t YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/job-tracker-backend:latest ./260001_be
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/job-tracker-backend:latest
```

If that works, the issue is with GitHub Secrets (see above).

### Problem: "Service Takes Too Long to Deploy"

**Timeline:**

- Push code → GitHub Actions starts (immediate)
- Build Docker (2-3 minutes)
- Push to ECR (1-2 minutes)
- Terraform apply (5-10 minutes)
- ECS pulls new image (2-3 minutes)
- App starts (1-2 minutes)
- **Total: 15-25 minutes**

**This is normal!** Coffee break time.

### Problem: "I Broke Something and Can't Rollback"

**Recovery steps:**

1. **Easy fix - deploy previous version:**

   ```bash
   git log --oneline  # See commit history
   git revert HEAD    # Undo last commit
   git push origin main  # GitHub Actions will deploy old version
   ```

2. **Terraform broke:**

   ```bash
   cd terraform
   terraform plan  # See what's wrong
   terraform destroy  # Delete everything
   # Fix the file
   terraform apply  # Recreate everything
   ```

3. **Database lost:**
   - Check S3 for RDS snapshot
   - Database has automatic backups (7 days)
   - Contact AWS support for recovery

---

## FAQ for Beginners

### Q: How much will this cost?

**A:** Approximately **$70-100 per month** after the first year (AWS has free tier).

- ECS (app containers): $14/month
- RDS (database): $30/month
- Load Balancer: $16/month
- Data transfer: $10-50/month

You can reduce costs by using smaller instances or stopping services when not in use.

### Q: Can I run this for free?

**A:** Yes, for 12 months with AWS Free Tier, but:

- You get limited resources
- After 12 months, you pay
- I recommend paying - production costs are worth it

### Q: What if my application gets hacked?

**A:** AWS has security features:

- ✅ Database encryption
- ✅ HTTPS support
- ✅ Security groups (firewall)
- ✅ Encrypted secrets

**Your responsibility:**

- ✅ Keep database passwords secret
- ✅ Don't commit secrets to GitHub
- ✅ Use HTTPS (enable in terraform)
- ✅ Keep software updated

### Q: Do I need to do anything to keep it running?

**A:** Mostly no, but:

- **Weekly:** Check CloudWatch for errors
- **Monthly:** Review AWS bill
- **Monthly:** Apply security patches (I'll warn you)
- **When you deploy:** GitHub Actions handles it

### Q: What if I want to make changes to my app?

**Simple process:**

1. Make code changes locally
2. Test locally: `npm run dev` (frontend) and `dotnet run` (backend)
3. `git commit` and `git push`
4. GitHub Actions automatically deploys!
5. Check the Actions tab to watch it deploy

### Q: How do I scale to handle more users?

**Automatically happens!**

- Load Balancer splits traffic evenly
- ECS auto-scales (more containers when needed)
- Database auto-scales (up to a limit)

**If you hit limits:**

```bash
# Increase max containers
# Edit terraform/ecs.tf
# Change: max_capacity = 4 to max_capacity = 10
terraform apply
```

### Q: Can I use multiple databases or servers?

**Yes!** Terraform makes it easy:

1. Change Terraform code (add resources)
2. `terraform apply`
3. Done!

Examples:

- Add Redis cache
- Add Elasticsearch
- Add CDN
- Add monitoring

### Q: What if I want to try something different?

**No problem:**

```bash
# Delete everything and start over
cd terraform
terraform destroy
# It will ask for confirmation

# Or change one thing:
# Edit terraform/variables.tf
# terraform apply
```

### Q: How do I debug why my backend isn't working?

**Start here:**

1. Check CloudWatch logs: `aws logs tail /ecs/job-tracker-backend --follow`
2. Test locally: `dotnet run` (do you get errors?)
3. Check database: Can backend connect?
4. Check logs for 404 errors - endpoint doesn't exist
5. Check logs for 500 errors - something threw an exception

### Q: Is this safe for real users?

**Yes, but:**

- ✅ AWS is a trusted provider
- ✅ Your data is encrypted
- ✅ Automatic backups every day
- ✅ High availability (if one server fails, traffic goes to another)

**Still good practices:**

- Regular security audits
- Keep dependencies updated
- Monitor for unusual activity
- Have a backup plan

### Q: What happens if AWS goes down?

**Extremely rare** (AWS has 99.99% uptime), but:

- Your data is safe in multiple data centers
- Auto-recovery is automatic
- You can restore from snapshots

You can't prevent AWS outages, but they're rare and brief.

### Q: Can I use this locally while also having it on AWS?

**Yes!** Run both:

```bash
# Terminal 1 - Local development
docker-compose up

# Terminal 2 - Check AWS live version
curl http://your-alb-dns/api/auth/test
```

They're completely separate.

### Q: How do I handle database migrations?

**When you change your database schema:**

1. Make changes to Entity Framework models
2. Create migration: `dotnet ef migrations add MigrationName`
3. Commit and push
4. GitHub Actions deploys
5. Migration runs automatically

(This is already built into Program.cs!)

### Q: What if I want to add a new database table?

**Process:**

1. Create new Model class (e.g., `Orders.cs`)
2. Add `DbSet<Orders>` to `JobTrackerDbContext`
3. Create migration: `dotnet ef migrations add AddOrders`
4. Commit and push
5. Automatically deployed!

### Getting Help

**When you're stuck:**

1. **Check this troubleshooting guide** (above)
2. **Check AWS CloudWatch logs** - most errors are logged
3. **Google the error message** - usually someone had the same problem
4. **Check AWS documentation** - surprisingly good!
5. **AI Assistant** - paste your error, ask what it means

Remember: Everyone gets stuck. Debugging is a skill. You'll get better!

---

---

## Final Checklist: Before Going Live

Use this checklist to ensure everything is ready:

- [ ] AWS account created and IAM user set up
- [ ] AWS CLI configured locally (`aws configure`)
- [ ] Terraform, Docker, and Git installed
- [ ] All Dockerfile created and tested locally
- [ ] All Terraform files created
- [ ] GitHub repository pushed with deployment files
- [ ] All 5 GitHub Secrets added
- [ ] GitHub Actions workflow has run successfully (green ✅)
- [ ] S3 bucket for Terraform state created
- [ ] ECR repositories created
- [ ] Applications accessible at ALB URL
- [ ] Backend API responds to health check
- [ ] Frontend loads and can make API calls
- [ ] Database is accessible and data is persisting
- [ ] CloudWatch logs are showing normal activity (no errors)
- [ ] Cost is within budget (~$70-100/month)

**Congrats!** If all items are checked, your app is production-ready! 🚀

---

## Cost Breakdown Explained

**What you're paying for:**

| Service                       | Cost/Month | What it Does                       |
| ----------------------------- | ---------- | ---------------------------------- |
| **ECS Fargate**               | ~$14       | Runs your backend and frontend     |
| **RDS PostgreSQL**            | ~$30       | Stores all your data               |
| **Application Load Balancer** | ~$16       | Splits traffic to multiple servers |
| **Data Transfer**             | $10-50     | Sending data to/from internet      |
| **CloudFront**                | $0-5       | Caching (fast delivery)            |
| **S3**                        | $1         | Store Terraform state              |
| **CloudWatch**                | $1-2       | Logs and monitoring                |
| **TOTAL**                     | ~$70-100   | Your monthly AWS bill              |

**How to reduce costs:**

- Use Fargate Spot ($5-7 instead of $14) - but can be interrupted
- Stop services at night/weekends (for dev apps)
- Use smaller database instance (t3.micro)
- Compress images for CloudFront

**Typical spending:**

- Day 1: $0 (still in free tier)
- Month 1: $50-70 (depends on usage)
- Month 2+: $70-100 (stable)

**Free tier covers:**

- First 750 hours of RDS
- First year AWS free tier ($300+ value)
- Most services have free tier

---

## Security Best Practices for Beginners

**What you've already done:**

- ✅ Secrets are encrypted (GitHub Secrets)
- ✅ Database has encryption enabled
- ✅ Security groups (firewall) protect your database
- ✅ Load balancer accepts only HTTPS (once enabled)
- ✅ Access keys limited to Terraform (minimal permissions)

**Additional security steps:**

1. **Regular Updates**

   ```bash
   # Check for security patches monthly
   # Update Terraform: terraform version
   # Update AWS CLI: msiexec /x AWS_CLI v2.0
   ```

2. **Monitor Access**
   - Check CloudWatch for unusual activity
   - Look for repeated 401 (unauthorized) attempts
   - Alert on 500 errors (potential attacks)

3. **Backup Your Data**

   ```bash
   # RDS has automatic backups (7 days)
   # But enable snapshots for long-term protection
   # AWS Console → RDS → Snapshots → Create snapshot
   ```

4. **Rotate Passwords**
   - Change database password every 90 days
   - Update GitHub Secrets when you do
   - Run: `terraform apply`

5. **Enable HTTPS**
   - Add to `alb.tf`:

   ```hcl
   # Redirect HTTP to HTTPS
   # Requires SSL certificate (AWS ACM)
   ```

6. **Restrict IP Access (Optional)**
   - Only allow your office IP to access certain endpoints
   - Done via Security Groups in AWS

---

## Next Steps After Deployment

**Congratulations! Your app is live!** 🎉

**What to do next:**

1. **Tell the world**
   - Share your application URL
   - Post on social media
   - Tell friends to try it

2. **Gather feedback**
   - Ask users what they think
   - What fails? What's slow?
   - Make a list of improvements

3. **Monitor daily**
   - Check CloudWatch logs
   - Look at AWS bill
   - Fix any errors immediately

4. **Plan improvements**
   - More features
   - Better design
   - Mobile app
   - More automation

5. **Document everything**
   - Write down how to deploy
   - Procedure for emergency rollback
   - How to add new team members

6. **Set up alerts**
   ```bash
   # Get notified when something goes wrong
   aws sns create-topic --name job-tracker-alerts
   aws sns subscribe --topic-arn <ARN> --protocol email --notification-endpoint your-email@example.com
   ```

---

## Glossary of Terms

**AWS** - Amazon Web Services (cloud computer provider)

**CLI** - Command Line Interface (typing commands in terminal)

**CORS** - Cross-Origin Resource Sharing (allows frontend to talk to backend on different URL)

**Docker** - Tool that packages your app so it runs the same everywhere

**ECS** - Elastic Container Service (runs Docker containers in AWS)

**ECR** - Elastic Container Registry (stores Docker images)

**Health check** - AWS asking "are you still running?" regularly

**IAM** - Identity and Access Management (user permissions)

**Load Balancer** - Splits traffic across multiple servers

**Logs** - Records of what your app did (useful for debugging)

**RDS** - Relational Database Service (managed database)

**Region** - AWS datacenter location (us-east-1, eu-west-1, etc.)

**Repository** - Storage for code (GitHub) or Docker images (ECR)

**S3** - Simple Storage Service (cloud storage)

**Secrets** - Passwords and API keys kept private

**SSL/TLS** - Encryption for website (makes it HTTPS)

**Subnet** - Network divided into smaller parts

**Terraform** - Tool to describe cloud infrastructure as code

**VPC** - Virtual Private Cloud (your private network in AWS)

---

## Troubleshooting Quick Reference

| Problem                   | Solution                                                                   |
| ------------------------- | -------------------------------------------------------------------------- |
| GitHub Actions fails      | Check logs: Actions tab → failed step                                      |
| Backend won't start       | CloudWatch logs: `aws logs tail /ecs/job-tracker-backend`                  |
| Database connection error | Check RDS is running, password is correct, security group allows port 5432 |
| Frontend blank page       | Check backend is responding, CORS is enabled                               |
| Out of memory             | Increase `container_memory` in `ecs.tf`, then `terraform apply`            |
| ECR push fails            | Check GitHub Secrets are correct (`AWS_ACCESS_KEY_ID`, etc.)               |
| App takes forever to load | Wait 5-10 minutes after pushing, ECS pulls new image                       |
| Want to rollback          | `git revert HEAD`, then `git push`                                         |
| Want to delete everything | `terraform destroy`, confirm when prompted                                 |

---

## Learning Resources

**Recommended for beginners:**

- **AWS Documentation**: https://docs.aws.amazon.com/
- **Terraform Docs**: https://www.terraform.io/docs
- **Docker Guide**: https://docs.docker.com/get-started/
- **GitHub Actions**: https://docs.github.com/en/actions
- **YouTube**: Search "AWS ECS Fargate tutorial" for visual guides

**Free tiers available:**

- AWS (first year/first 750 hours)
- Terraform Cloud (free for small teams)
- GitHub (free for public/private repos)
- Docker (free community edition)

---

## You Did It!

You've successfully:

- ✅ Created a production-ready infrastructure
- ✅ Automated deployment with GitHub Actions
- ✅ Set up a scalable database
- ✅ Deployed your first application to the cloud
- ✅ Learned about Docker, Terraform, and AWS

**This is a real achievement.** Many people never get this far. You should be proud!

**What to remember:**

- Start simple, add features later
- Monitor your costs
- Keep learning
- Don't be afraid to experiment
- Mistakes are learning opportunities

**Good luck!** If you get stuck, the Troubleshooting Guide above has you covered. 💪

---

**Need help?** Common resources:

- AWS Support (paid option)
- Stack Overflow (free community)
- GitHub Issues (community)
- ChatGPT/AI Assistant (paste your error)
- AWS Reddit: r/aws

**Last Updated:** March 3, 2026
**Version:** 1.0 - Beginner Edition
