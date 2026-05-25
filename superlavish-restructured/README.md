# 🛒 SuperLavish — Premium Supermarket Platform

A full-stack, production-grade supermarket application inspired by Woolworths services architecture.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│              (Lavish UI + Framer Motion)                 │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│              API Gateway (Spring Cloud)                  │
│         JWT Validation + Rate Limiting + Routing         │
└──┬────────────┬────────────┬────────────┬───────────────┘
   │            │            │            │
┌──▼──┐    ┌───▼──┐    ┌────▼─┐    ┌────▼──┐
│Auth │    │Prod  │    │Cart  │    │Order  │
│Svc  │    │Svc   │    │Svc   │    │Svc    │
└──┬──┘    └───┬──┘    └────┬─┘    └────┬──┘
   │            │            │            │
└──────────────────────────────────────────────────────────┘
                    PostgreSQL (RDS)
```

## 🚀 Services

| Service | Port | Responsibility |
|---------|------|---------------|
| API Gateway | 8080 | Routing, Auth validation, Rate limiting |
| Auth Service | 8081 | Login, Register, JWT tokens |
| Product Service | 8082 | Catalog, Search, Categories |
| Cart Service | 8083 | Cart CRUD, Price calculation |
| Order Service | 8084 | Orders, Status tracking |
| Frontend (React) | 3000 | UI |

## 🛠️ Tech Stack

- **Frontend**: React 18, Framer Motion, Tailwind CSS, Zustand
- **Backend**: Java 17, Spring Boot 3.x, Spring Cloud Gateway
- **Database**: PostgreSQL 15 (AWS RDS)
- **Auth**: JWT + Spring Security
- **Infrastructure**: AWS EKS, EC2, RDS, VPC, IAM
- **CI/CD**: Jenkins Declarative Pipeline
- **IaC**: Terraform
- **Monitoring**: Prometheus + Grafana + Datadog
- **Containers**: Docker + Kubernetes

## 📁 Project Structure

```
superlavish/
├── frontend/                          # React Application
├── backend/
│   ├── auth-service/                  # Authentication microservice
│   ├── product-service/               # Product catalog microservice
│   ├── cart-service/                  # Shopping cart microservice
│   ├── order-service/                 # Order management microservice
│   └── gateway/                       # API Gateway
├── devops/
│   ├── docker/                        # Dockerfiles
│   ├── kubernetes/                    # K8s manifests
│   ├── jenkins/
│   │   └── Jenkinsfile                # Declarative pipeline with changeset filters
│   ├── monitoring/                    # Prometheus + Grafana
│   └── terraform/
│       ├── modules/                   # Reusable building blocks (no state)
│       │   ├── vpc/ eks/ rds/ alb/ s3/ ecr/ iam/
│       ├── global/
│       │   └── ecr/                   # Container registries (shared across envs)
│       └── environments/              # Per-env, per-component → isolated state
│           ├── dev/      {vpc, eks, rds, alb, s3}
│           ├── staging/  {vpc, eks, rds, alb, s3}
│           └── prod/     {vpc, eks, rds, alb, s3}
└── scripts/                           # Setup & deployment scripts
```

### Why this layout?

- **Each Terraform component has its own state.** Changing the ALB never
  triggers a re-plan on EKS or RDS.
- **Each environment is isolated.** A `dev/eks` apply cannot touch `prod/eks`.
- **The Jenkinsfile uses `when { changeset '...' }`** — only stages whose paths
  actually changed will run. A backend-only commit will not rebuild the
  frontend or re-apply Terraform.

See `UPGRADE_GUIDE.md` for a full breakdown of the changes and `devops/terraform/README.md`
for Terraform-specific usage.

## 🚀 Quick Start

### Local Development
```bash
# 1. Clone and setup
git clone https://github.com/YOUR_USERNAME/superlavish.git
cd superlavish
chmod +x scripts/*.sh

# 2. Start everything with Docker Compose
./scripts/local-start.sh

# 3. Access the app
# Frontend: http://localhost:3000
# API Gateway: http://localhost:8080
# Grafana: http://localhost:3001
```

### Deploy to AWS
```bash
# 1. Configure AWS credentials
aws configure

# 2. Provision infrastructure
./scripts/terraform-deploy.sh

# 3. Deploy to EKS
./scripts/k8s-deploy.sh
```

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in your values.
