# Cloud Infrastructure & DevOps Architecture

This project utilizes a modern, enterprise-grade cloud architecture deployed on AWS using Infrastructure as Code (IaC), Kubernetes, and fully automated continuous delivery. 

## 🏗️ Infrastructure as Code (Terraform)
The entire AWS infrastructure is strictly defined and provisioned using **Terraform**.
- **State Management**: Remote state is securely stored in an encrypted **Amazon S3** bucket, with state-locking managed by **Amazon DynamoDB** to prevent concurrent pipeline corruptions during team deployments.
- **Networking**: A custom **AWS VPC** spanning two Availability Zones, utilizing both Public and Private subnets. EKS Worker nodes reside in private subnets and access the internet securely via a NAT Gateway.

## 🐳 Container Orchestration (Kubernetes / EKS)
- **Amazon EKS**: The four core microservices (`frontend`, `eventapp`, `imageservice`, `webservices`) are orchestrated using Elastic Kubernetes Service.
- **Compute**: AWS Managed Node Groups (EC2 `t3.medium` instances) handle the computing workload, with auto-scaling capabilities.
- **Ingress & Routing**: An **AWS Application Load Balancer (ALB)** Ingress Controller routes external traffic to the appropriate internal Kubernetes Services.

## 💾 Storage & Database
- **Amazon RDS**: Relational app data is stored in a highly available PostgreSQL RDS instance within a private subnet, decoupled from the application pods to ensure data persistence, automated backups, and scalability.
- **Amazon S3**: Integrated for robust object storage (e.g., user-uploaded event images), replacing local disk storage and significantly reducing the load on containerized applications.

## ⚡ CI/CD Pipeline (GitHub Actions)
A fully automated, multi-stage pipeline triggers on every push to the `main` branch, mimicking enterprise workflows:
1. **Testing**: Automatically executes backend unit tests in isolated runner environments.
2. **Build & Push (Parallelized)**: Builds Docker images for all microservices concurrently and pushes them to private **Amazon ECR** repositories. Images are immutably tagged using the unique Git commit SHA.
3. **Continuous Deployment**: The pipeline securely authenticates with the EKS cluster via OIDC/IAM, dynamically updates the Kubernetes Deployment manifests with the new image tags, and performs a zero-downtime rolling update.

---

## 🛑 Cost Optimization & Portfolio Usage

This architecture generates actual cloud costs (EKS Control Plane, NAT Gateways, EC2 Instances). If you are using this code purely for a DevOps Portfolio display:

1. Prove the code works by running:
```bash
terraform init
terraform plan
terraform apply --auto-approve
```
2. Trigger the GitHub Actions pipeline and watch it successfully deploy your codebase to the EKS cluster.
3. Take all necessary screenshots of the AWS Console (EKS, VPC, ALB, ECR), the GitHub Actions success screen, and the live accessible website.
4. **IMMEDIATELY DESTROY** all resources to avoid recurring hourly charges:
```bash
terraform destroy --auto-approve
```
