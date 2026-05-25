#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# SuperLavish — Terraform AWS Infrastructure Provisioning Script
# ──────────────────────────────────────────────────────────────────────────────
set -e

GREEN='\033[0;32m'; GOLD='\033[0;33m'; RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

echo -e "${GOLD}${BOLD}🏗️  SuperLavish — Terraform Provisioning${RESET}"
echo ""

# ── Prerequisites ─────────────────────────────────────────────────────────────
command -v terraform > /dev/null || { echo -e "${RED}❌ terraform not found. Install from https://terraform.io${RESET}"; exit 1; }
command -v aws > /dev/null       || { echo -e "${RED}❌ aws cli not found${RESET}"; exit 1; }

echo -e "${GREEN}✅ Prerequisites OK${RESET}"

# ── AWS Auth check ────────────────────────────────────────────────────────────
echo "Checking AWS credentials..."
aws sts get-caller-identity --output table || { echo -e "${RED}❌ AWS credentials not configured. Run: aws configure${RESET}"; exit 1; }
echo ""

# ── Variables ─────────────────────────────────────────────────────────────────
ENVIRONMENT=${1:-prod}
REGION=${2:-ap-southeast-2}
TF_DIR="devops/terraform/environments/${ENVIRONMENT}"

if [ -z "$TF_VAR_db_password" ]; then
    echo -e "${GOLD}Enter a secure RDS database password:${RESET}"
    read -s TF_VAR_db_password
    export TF_VAR_db_password
fi

# Create S3 state bucket if needed
STATE_BUCKET="superlavish-terraform-state"
echo "Ensuring S3 state bucket exists..."
aws s3api create-bucket \
    --bucket "$STATE_BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null || true
aws s3api put-bucket-versioning --bucket "$STATE_BUCKET" --versioning-configuration Status=Enabled

# Create DynamoDB lock table
aws dynamodb create-table \
    --table-name superlavish-terraform-locks \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" 2>/dev/null || true

echo -e "${GREEN}✅ State backend ready${RESET}"
echo ""

cd "$TF_DIR"

# ── Init ──────────────────────────────────────────────────────────────────────
echo -e "${BOLD}Initializing Terraform...${RESET}"
terraform init -upgrade

# ── Plan ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Planning infrastructure changes...${RESET}"
terraform plan \
    -var="environment=${ENVIRONMENT}" \
    -var="aws_region=${REGION}" \
    -out=tfplan

echo ""
read -p "Apply changes? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then echo "Aborted."; exit 0; fi

# ── Apply ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Applying...${RESET}"
terraform apply tfplan

echo ""
echo -e "${GREEN}${BOLD}✅ Infrastructure provisioned!${RESET}"
echo ""
terraform output
