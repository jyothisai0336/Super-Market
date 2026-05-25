#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# SuperLavish — Kubernetes EKS Deploy Script
# ──────────────────────────────────────────────────────────────────────────────
set -e

GREEN='\033[0;32m'; GOLD='\033[0;33m'; RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

echo -e "${GOLD}${BOLD}🚀 SuperLavish — Deploying to EKS${RESET}"
echo ""

# ── Config ────────────────────────────────────────────────────────────────────
CLUSTER_NAME=${CLUSTER_NAME:-superlavish-prod}
AWS_REGION=${AWS_REGION:-ap-southeast-2}
NAMESPACE="superlavish"
IMAGE_TAG=${IMAGE_TAG:-latest}
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Prerequisites
for cmd in kubectl aws docker; do
    command -v $cmd > /dev/null || { echo -e "${RED}❌ $cmd not found${RESET}"; exit 1; }
done

# ── kubeconfig ────────────────────────────────────────────────────────────────
echo "Configuring kubectl..."
aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$AWS_REGION"
kubectl cluster-info
echo ""

# ── ECR Login ─────────────────────────────────────────────────────────────────
echo "Logging into ECR..."
aws ecr get-login-password --region "$AWS_REGION" | \
    docker login --username AWS --password-stdin "$ECR_REGISTRY"

# ── Build & Push images ───────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Building and pushing Docker images (tag: ${IMAGE_TAG})...${RESET}"

declare -A SERVICES=(
    ["auth-service"]="backend/auth-service|superlavish-auth|devops/docker/Dockerfile.service"
    ["product-service"]="backend/product-service|superlavish-products|devops/docker/Dockerfile.service"
    ["cart-service"]="backend/cart-service|superlavish-cart|devops/docker/Dockerfile.service"
    ["order-service"]="backend/order-service|superlavish-orders|devops/docker/Dockerfile.service"
    ["gateway"]="backend/gateway|superlavish-gateway|devops/docker/Dockerfile.service"
    ["frontend"]="frontend|superlavish-frontend|devops/docker/Dockerfile.frontend"
)

for svc_name in "${!SERVICES[@]}"; do
    IFS='|' read -r context image dockerfile <<< "${SERVICES[$svc_name]}"
    FULL_IMAGE="${ECR_REGISTRY}/${image}:${IMAGE_TAG}"

    echo "  🐳 Building ${svc_name}..."
    docker build -f "$dockerfile" -t "$FULL_IMAGE" "$context"
    docker push "$FULL_IMAGE"
    echo -e "  ${GREEN}✅ Pushed ${image}:${IMAGE_TAG}${RESET}"
done

# ── Apply K8s manifests ───────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Applying Kubernetes manifests...${RESET}"
kubectl apply -f devops/kubernetes/configmaps/config.yaml
kubectl apply -f devops/kubernetes/services/services.yaml
kubectl apply -f devops/kubernetes/ingress/ingress.yaml

# ── Update image tags ─────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Updating deployments to ${IMAGE_TAG}...${RESET}"

declare -A DEPLOY_IMAGES=(
    ["auth-service"]="superlavish-auth"
    ["product-service"]="superlavish-products"
    ["cart-service"]="superlavish-cart"
    ["order-service"]="superlavish-orders"
    ["gateway"]="superlavish-gateway"
    ["frontend"]="superlavish-frontend"
)

for deploy in "${!DEPLOY_IMAGES[@]}"; do
    image="${DEPLOY_IMAGES[$deploy]}"
    kubectl set image deployment/"$deploy" \
        "$deploy"="${ECR_REGISTRY}/${image}:${IMAGE_TAG}" \
        -n "$NAMESPACE"
done

# ── Rollout status ────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Waiting for rollouts to complete...${RESET}"
for deploy in auth-service product-service cart-service order-service gateway frontend; do
    echo -n "  ⏳ $deploy... "
    kubectl rollout status deployment/"$deploy" -n "$NAMESPACE" --timeout=5m
    echo -e "${GREEN}✅${RESET}"
done

# ── Get ALB URL ───────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}✅ Deployment complete!${RESET}"
echo ""
ALB_URL=$(kubectl get ingress superlavish-ingress -n "$NAMESPACE" \
    -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "pending")
echo -e "  🌐 Load Balancer: ${BOLD}${ALB_URL}${RESET}"
echo ""
kubectl get pods -n "$NAMESPACE"
