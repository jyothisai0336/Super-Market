# Terraform Infrastructure

This directory follows the **modules + environments** pattern. Each component
(VPC, EKS, RDS, ALB, S3) in each environment has its **own folder, its own
state, and its own backend** — so a change to one component doesn't trigger
plans/applies on the others.

## 📁 Layout

```
terraform/
├── modules/                  Reusable building blocks (no state, no backend)
│   ├── vpc/
│   ├── eks/
│   ├── rds/
│   ├── alb/
│   ├── s3/
│   ├── ecr/
│   └── iam/
│
├── global/                   Shared across all environments
│   └── ecr/                  Container registries (one set, multi-env tags)
│
└── environments/
    ├── dev/
    │   ├── vpc/              ← own state: dev/vpc/terraform.tfstate
    │   ├── eks/              ← own state: dev/eks/terraform.tfstate
    │   ├── rds/              ← own state: dev/rds/terraform.tfstate
    │   ├── alb/              ← own state: dev/alb/terraform.tfstate
    │   └── s3/               ← own state: dev/s3/terraform.tfstate
    ├── staging/              same structure as dev
    └── prod/                 same structure as dev
```

## 🔁 Dependency order

Apply in this order (some components read others' outputs via remote state):

```
1. global/ecr          (once, before any env)
2. <env>/vpc           (creates network)
3. <env>/eks           (reads vpc outputs)
4. <env>/rds           (reads vpc + eks SG)
5. <env>/alb           (reads vpc)
6. <env>/s3            (independent)
```

## 🚀 Bootstrap (one-time setup)

The S3 backend bucket and DynamoDB lock table must exist before you can
`terraform init`. Create them once:

```bash
aws s3api create-bucket \
  --bucket superlavish-tf-state \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1

aws s3api put-bucket-versioning \
  --bucket superlavish-tf-state \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket superlavish-tf-state \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws dynamodb create-table \
  --table-name superlavish-tf-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

## ⚙️ Day-to-day usage

```bash
# Deploy dev VPC
cd environments/dev/vpc
terraform init
terraform plan
terraform apply

# Deploy dev EKS (reads VPC outputs automatically)
cd ../eks
terraform init
terraform apply

# Deploy dev RDS — pass the password securely
cd ../rds
terraform init
export TF_VAR_db_password='your-strong-password'
terraform apply

# OR use the tfvars file approach (file is gitignored)
cp secrets.tfvars.example secrets.tfvars
# edit secrets.tfvars
terraform apply -var-file=secrets.tfvars
```

## 🧠 Why this design?

| Anti-pattern (old) | This design |
|---|---|
| One `main.tf` calls VPC + EKS + RDS | Each component in its own folder |
| One state file = one blast radius | Per-component state |
| ALB change forces EKS re-plan | Only the changed folder runs |
| No env separation | `dev/`, `staging/`, `prod/` all isolated |
| Hardcoded values per env | Modules parameterized, envs supply values |
| State on local disk | Remote S3 + DynamoDB locking |

## 🔐 Secrets

Never commit:
- `*.tfstate` (gitignored)
- `*.auto.tfvars` (gitignored)
- `secrets.tfvars` (gitignored)

For DB passwords, prefer:
1. `TF_VAR_db_password` environment variable in CI
2. AWS Secrets Manager / SSM Parameter Store + `data` source

## 🧹 State migration from the old flat layout

If you already applied the old flat `Terraform/` folder and want to migrate
without recreating resources:

```bash
# In old flat folder
terraform state pull > /tmp/old.tfstate

# In each new folder (e.g., environments/dev/vpc)
terraform init
terraform state mv \
  -state=/tmp/old.tfstate \
  -state-out=terraform.tfstate \
  aws_vpc.main \
  module.vpc.aws_vpc.main

terraform state push terraform.tfstate
```

Repeat for each resource. Run `terraform plan` after each move to confirm no
changes are detected.
