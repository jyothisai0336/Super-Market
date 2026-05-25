#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# SuperLavish — Push to GitHub
# Usage: ./scripts/github-push.sh YOUR_GITHUB_USERNAME
# ──────────────────────────────────────────────────────────────────────────────

GITHUB_USER=${1:-YOUR_GITHUB_USERNAME}
REPO_NAME="superlavish"

echo "🚀 Pushing SuperLavish to GitHub..."
echo ""

# Init git if needed
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git initialized"
fi

# Create .gitignore
cat > .gitignore << 'EOF'
# Maven
target/
*.jar
*.war

# Node
node_modules/
build/
.env
.env.local

# Terraform
*.tfstate
*.tfstate.backup
.terraform/
*.tfplan
*.tfvars
!example.tfvars

# IDE
.idea/
.vscode/
*.iml
.DS_Store

# Docker
*.log
EOF

git add -A
git commit -m "🛒 feat: initial SuperLavish full-stack application

- React frontend with Framer Motion (lavish UI)
- 5 Java Spring Boot microservices (auth, products, cart, orders, gateway)
- PostgreSQL with Flyway migrations
- Docker multi-stage builds
- Kubernetes manifests for AWS EKS
- Terraform for AWS infrastructure (VPC, EKS, RDS)
- Jenkins Declarative CI/CD pipeline
- Prometheus + Grafana monitoring"

# Add remote and push
REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"
git branch -M main
git push -u origin main

echo ""
echo "✅ Pushed to: $REMOTE_URL"
echo ""
echo "Next steps:"
echo "  1. Run Terraform: ./scripts/terraform-deploy.sh"
echo "  2. Deploy to EKS: ./scripts/k8s-deploy.sh"
echo "  3. Local dev:     ./scripts/local-start.sh"
