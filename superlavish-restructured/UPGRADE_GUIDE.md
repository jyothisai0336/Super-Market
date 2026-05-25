# Migration Guide: From Flat Layout → Modules + Environments

This document explains what changed from the original repo and **why**, plus
how to safely roll forward.

---

## 🆚 What Changed

### 1. `.gitignore` added at repo root
Original repo had none — Terraform state, `node_modules`, `target/` could all
get committed. Now properly ignored.

### 2. Terraform: flat → modules + environments

**Before**
```
devops/Terraform/          ← capital T, inconsistent casing
├── alb.tf
├── ec2.tf
├── ecr.tf
├── eks.tf                 ← referenced IAM roles that didn't exist
├── iam.tf                 ← empty!
├── rds.tf
├── s3.tf
├── securitygroups.tf
├── subnet.tf              ← typos: "as_subnet", "availability_zones",
│                            "gateway-id", invalid CIDR "0.0.0.0.0"
├── vpc.tf                 ← /25 = 128 IPs, too small for EKS
└── ...                    ← all 15 files = ONE state file
```

**After**
```
devops/terraform/
├── modules/               ← reusable, no state, no backend
│   ├── vpc/   eks/   rds/   ecr/   alb/   s3/   iam/
├── global/
│   └── ecr/               ← container registries, shared across envs
└── environments/
    ├── dev/      vpc/  eks/  rds/  alb/  s3/    ← each has own state
    ├── staging/  vpc/  eks/  rds/  alb/  s3/
    └── prod/     vpc/  eks/  rds/  alb/  s3/
```

### 3. Terraform bugs fixed

| Where | Bug in original | Fix |
|---|---|---|
| `subnet.tf` | `resource "as_subnet"` | `aws_subnet` |
| `subnet.tf` | `availability_zones = "us-east-1a"` (plural attr, scalar value) | `availability_zone` (singular) |
| `subnet.tf` | `gateway-id` (hyphen) | `gateway_id` (underscore) |
| `securitygroups.tf` | `cidr_blocks = ["0.0.0.0.0"]` (5 octets) | `["0.0.0.0/0"]` |
| `securitygroups.tf` | `security_group = [...]` + `web.sg.id` | `security_groups` + `web_sg.id` |
| `resource.tf` | `principal` lowercase + extra `}]` | `Principal` + valid JSON |
| `ec2.tf`, `rds.tf`, `s3.tf` | `var.app-name` (variable doesn't exist) | `var.app_name` |
| `ec2.tf` | Missing closing `}` on launch_template | Fixed |
| `alb.tf` | `aws_lb_app.arn` | `aws_lb.main.arn` |
| `iam.tf` | Empty file, but EKS referenced roles from it | Roles created in module |
| `eks.tf` | Used only one private subnet (EKS needs 2+ AZs) | Now 2 AZs |
| `vpc.tf` | CIDR `10.0.0.0/25` (128 IPs total) | `10.0.0.0/16` (65536 IPs) |
| `variables.tf` vs `terraform.tfvars` | Region mismatch (ap-south-1 vs us-east-1), `app_name` had spaces | Consistent + valid |

### 4. Jenkinsfile: full-build → changeset-driven

**Before:** every push rebuilt all 5 backend services + frontend + ran sonar
+ built all 6 Docker images + deployed everything — even for a 1-character
typo in a single service's README.

**After:** every stage is gated by `when { changeset '<path>/**' }`. A change
to `backend/auth-service/AuthService.java` rebuilds **only** auth-service,
pushes only its image, rolls out only its deployment. Other services are
skipped.

Same applies to Terraform: changing `environments/dev/vpc/main.tf` runs only
the VPC stage; staging and prod are untouched.

### 5. K8s subnet tags added in VPC module
EKS needs `kubernetes.io/role/elb=1` on public subnets and
`kubernetes.io/role/internal-elb=1` on private subnets for the AWS Load
Balancer Controller to discover them. Added automatically in the VPC module.

### 6. Remote state backend (S3 + DynamoDB locking)
Original had no backend — state was local (lost between machines, no locking,
no concurrent-safety). Every environment+component combo now uses:
- S3 bucket `superlavish-tf-state` (versioned, encrypted)
- DynamoDB table `superlavish-tf-locks` (mutex)

---

## 🛠 Migration Path (if you have already applied the old Terraform)

If you've already `terraform apply`-ed the flat layout to AWS and you want to
switch to this layout WITHOUT recreating resources, you'll need to migrate
state. The process per resource is:

```bash
# 1. From the old flat folder, pull state
cd OLD/devops/Terraform
terraform state pull > /tmp/old.tfstate

# 2. Inspect what resources exist
terraform state list

# 3. In the NEW layout, init the target folder (e.g., dev/vpc)
cd NEW/devops/terraform/environments/dev/vpc
terraform init

# 4. Move resources from old → new with renamed addresses
terraform state mv -state=/tmp/old.tfstate \
    -state-out=terraform.tfstate \
    aws_vpc.main \
    module.vpc.aws_vpc.main

# Repeat for every resource the module owns (igw, subnets, route tables, etc.)

# 5. Push the migrated state to S3 backend
terraform state push terraform.tfstate

# 6. Confirm no changes
terraform plan      # should say "No changes."
```

> **⚠️ Test on a non-prod environment first.** If `terraform plan` shows
> resources being created or destroyed after the migration, STOP and inspect
> — something is misaligned.

For complex setups, the simpler path is often:
1. Tear down dev (destroy the old flat layout)
2. Apply the new layout from scratch
3. Use the new layout's `terraform import` for any resources you can't
   recreate (like RDS with data you need to keep)

Prod migration should use **`terraform import`** statement-by-statement, not
state move, to be safe.

---

## ✅ Validation

Every file in this restructure has been validated:

```bash
terraform fmt -recursive devops/terraform/   # all pass
# Each module: terraform validate            # all 7 modules OK
# Each env/component: terraform validate     # all 15 env configs OK
# Global ECR: terraform validate             # OK
```

You can re-run validation yourself:

```bash
cd devops/terraform
terraform fmt -recursive -check
for d in modules/*/; do
  (cd "$d" && terraform init -backend=false > /dev/null && terraform validate)
done
for env in dev staging prod; do
  for comp in vpc eks rds alb s3; do
    (cd environments/$env/$comp && terraform init -backend=false > /dev/null && terraform validate)
  done
done
```

---

## 🎯 Pipeline efficiency: before vs after

| Scenario | Old Jenkinsfile | New Jenkinsfile |
|---|---|---|
| Fix typo in `auth-service/README.md` | Builds all 5 services + frontend + sonar + 6 Docker images + deploys all | Builds nothing (no `.java`/`.tf` changed) |
| Update `auth-service/AuthService.java` | Same — full rebuild | Builds only auth-service, pushes only its image, rolls out only its deployment |
| Change `environments/dev/vpc/main.tf` | Full TF apply of everything | Only dev VPC stage runs |
| Change `environments/prod/eks/main.tf` | Same as dev — risky | Manual `input` approval gate + only prod EKS runs |

Approximate time savings on a single-service change: **70-80%** less CPU,
less Docker pulls, less ECR pushes, faster feedback.

---

## 📋 What you need to do before first run

1. **Create the S3 backend bucket + DynamoDB lock table** — see
   `devops/terraform/README.md` "Bootstrap" section.
2. **Set Jenkins credentials**: `aws-credentials` (AWS keys), `sonar-token`,
   `AWS_ACCOUNT_ID` env var on the agent.
3. **First-time apply order**:
   ```
   global/ecr  →  dev/vpc  →  dev/eks  →  dev/rds  →  dev/alb  →  dev/s3
   ```
4. **Push `secrets.tfvars`** (gitignored) into each `environments/<env>/rds/`
   folder OR set `TF_VAR_db_password` in Jenkins credentials.

---

## 📝 What was NOT touched

- All Java source code (5 services) — unchanged
- All React frontend code — unchanged
- `pom.xml`, `package.json` — unchanged
- Kubernetes YAML manifests — unchanged (these could be Kustomize-ized later)
- Dockerfiles — unchanged
- `docker-compose.yml` — unchanged
- Monitoring configs (Prometheus, Grafana) — unchanged
- Helper scripts in `scripts/` — unchanged

The restructure is **purely** at the Terraform and Jenkinsfile layer. Your
application code is intact and untouched.
