#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# SuperLavish — Local Development Start Script
# ──────────────────────────────────────────────────────────────────────────────
set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
GOLD='\033[0;33m'
RED='\033[0;31m'
RESET='\033[0m'

echo -e "${GOLD}${BOLD}"
echo "  ____                       _                _     _     "
echo " / ___| _   _ _ __   ___ _ _| |    __ ___   _(_)___| |__  "
echo " \\___ \\| | | | '_ \\ / _ \\ '__| |   / _\` \\ \\ / / / __| '_ \\ "
echo "  ___) | |_| | |_) |  __/ |  | |__| (_| |\\ V /| \\__ \\ | | |"
echo " |____/ \\__,_| .__/ \\___|_|  |_____\\__,_| \\_/ |_|___/_| |_|"
echo "             |_|"
echo -e "${RESET}"
echo -e "${BOLD}🛒 Starting SuperLavish local environment...${RESET}"
echo ""

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${RESET}"
    exit 1
fi

# Check docker compose
if ! docker compose version > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose not found. Install Docker Compose v2.${RESET}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${RESET}"

# Build and start all services
echo ""
echo -e "${BOLD}🔨 Building and starting services...${RESET}"
docker compose up --build -d

# Wait for services to be healthy
echo ""
echo -e "${BOLD}⏳ Waiting for services to be ready...${RESET}"

wait_for_service() {
    local name=$1
    local url=$2
    local retries=30
    local count=0

    while [ $count -lt $retries ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}  ✅ $name is ready${RESET}"
            return 0
        fi
        count=$((count + 1))
        sleep 3
    done
    echo -e "${RED}  ⚠️  $name didn't respond (may still be starting)${RESET}"
}

wait_for_service "PostgreSQL"     "http://localhost:5432" || true
wait_for_service "Auth Service"   "http://localhost:8081/actuator/health"
wait_for_service "Product Service""http://localhost:8082/actuator/health"
wait_for_service "Cart Service"   "http://localhost:8083/actuator/health"
wait_for_service "Order Service"  "http://localhost:8084/actuator/health"
wait_for_service "API Gateway"    "http://localhost:8080/actuator/health"
wait_for_service "Frontend"       "http://localhost:3000/health"

echo ""
echo -e "${GOLD}${BOLD}🚀 SuperLavish is ready!${RESET}"
echo ""
echo -e "  🛒 Frontend:    ${BOLD}http://localhost:3000${RESET}"
echo -e "  🔌 API Gateway: ${BOLD}http://localhost:8080${RESET}"
echo -e "  📊 Grafana:     ${BOLD}http://localhost:3001${RESET}  (admin / superlavish_grafana)"
echo -e "  📈 Prometheus:  ${BOLD}http://localhost:9090${RESET}"
echo ""
echo -e "  Demo account:   ${BOLD}demo@superlavish.com / demo123${RESET}"
echo ""
echo -e "Run ${BOLD}docker compose logs -f${RESET} to tail all logs"
echo -e "Run ${BOLD}docker compose down${RESET} to stop"
