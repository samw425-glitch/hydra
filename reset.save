#!/bin/bash
# reset-hydra.sh: Resets and verifies a Hydra stack using Docker Compose.
# MIT License
# (c) 2025 Sam / Hydra Project

set -euo pipefail

# Configuration
HOST="${HOST:-localhost}"
PORT="${PORT:-3000}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-5}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-3}"
LOG_FILE="${LOG_FILE:-reset-hydra.log}"

# Colors for output
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m"

# Log function
log() {
    local level="$1"
    local message="$2"
    echo -e "${message}" | tee -a "$LOG_FILE"
}

# Detect docker-compose command
COMPOSE_CMD=""
if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    log "ERROR" "${RED}Neither docker-compose nor docker compose is installed.${NC}"
    exit 1
fi

# Check health endpoint with retries
check_health() {
    local url="$1"
    local name="$2"
    local attempt=1
    local response

    while [ $attempt -le "$HEALTH_CHECK_RETRIES" ]; do
        log "INFO" "${YELLOW}Checking ${name} (Attempt ${attempt}/${HEALTH_CHECK_RETRIES})...${NC}"
        response=$(curl -s -m "$HEALTH_CHECK_TIMEOUT" -o /dev/null -w "%{http_code}" "$url" || echo "000")
        if [[ "$response" == "200" ]]; then
            log "SUCCESS" "${GREEN}${name} is up!${NC}"
            return 0
        fi
        log "WARNING" "${YELLOW}${name} not responding (HTTP $response). Retrying...${NC}"
        sleep 2
        ((attempt++))
    done
    log "ERROR" "${RED}${name} failed to respond after $HEALTH_CHECK_RETRIES attempts (HTTP $response)${NC}"
    return 1
}

# Wait for all containers to be healthy
wait_for_services() {
    local services=("$@")
    local all_healthy=false
    local retries=0
    local max_retries=10

    while [ $retries -lt $max_retries ]; do
        all_healthy=true
        for svc in "${services[@]}"; do
            if ! docker inspect -f '{{.State.Health.Status}}' "$svc" 2>/dev/null | grep -q "healthy"; then
                all_healthy=false
                break
            fi
        done
        if $all_healthy; then
            log "SUCCESS" "${GREEN}All containers report healthy!${NC}"
            return 0
        fi
        log "INFO" "${YELLOW}Waiting for containers to become healthy... (${retries}/${max_retries})${NC}"
        sleep 2
        ((retries++))
    done

    log "WARNING" "${YELLOW}Some containers did not report healthy after $max_retries checks.${NC}"
}

# Main
main() {
    log "INFO" "${GREEN}=== Hydra Stack Reset Script ===${NC}"
    log "INFO" "${YELLOW}Configuration: HOST=$HOST, PORT=$PORT, TIMEOUT=$HEALTH_CHECK_TIMEOUT, RETRIES=$HEALTH_CHECK_RETRIES${NC}"

    # Ensure docker-compose.yml exists
    if [[ ! -f "docker-compose.yml" ]]; then
        log "ERROR" "${RED}docker-compose.yml not found in the current directory.${NC}"
        exit 1
    fi

    log "INFO" "${GREEN}Stopping all Hydra containers and removing orphans...${NC}"
    $COMPOSE_CMD down --remove-orphans || log "WARNING" "${YELLOW}Some containers failed to stop cleanly.${NC}"

    log "INFO" "${GREEN}Pruning unused Docker networks...${NC}"
    docker network prune -f || log "WARNING" "${YELLOW}Failed to prune networks, continuing...${NC}"

    log "INFO" "${GREEN}Building all Hydra services from scratch...${NC}"
    $COMPOSE_CMD build --no-cache || {
        log "ERROR" "${RED}Failed to build services.${NC}"
        exit 1
    }

    log "INFO" "${GREEN}Starting all Hydra containers in detached mode...${NC}"
    $COMPOSE_CMD up -d || {
        log "ERROR" "${RED}Failed to start containers.${NC}"
        exit 1
    }

    log "INFO" "${GREEN}Listing all Hydra containers:${NC}"
    docker ps -a | tee -a "$LOG_FILE"

    # Wait for containers to be healthy
    wait_for_services hydra-api1 hydra-api2 hydra-api3 hydra-website || log "WARNING" "${YELLOW}Proceeding with manual health checks.${NC}"

    # Parallel health checks
    check_health "http://${HOST}:${PORT}/api/health" "API1" &
    check_health "http://${HOST}:${PORT}/api2/health" "API2" &
    check_health "http://${HOST}:${PORT}/api3/health" "API3" &
    check_health "http://${HOST}:${PORT}/" "Website (Nginx)" &
    wait

    log "INFO" "${GREEN}=== Hydra Stack Reset Complete ===${NC}"
}

# Show usage
if [[ "$#" -gt 0 && "$1" == "--help" ]]; then
    echo "Usage: $0"
    echo "Resets and verifies a Hydra stack using Docker Compose."
    echo "Environment variables:"
    echo "  HOST: Hostname for health checks (default: localhost)"
    echo "  PORT: Port for health checks (default: 3000)"
    echo "  HEALTH_CHECK_TIMEOUT: Timeout for health checks in seconds (default: 5)"
    echo "  HEALTH_CHECK_RETRIES: Number of retries for health checks (default: 3)"
    echo "  LOG_FILE: Log file path (default: reset-hydra.log)"
    exit 0
fi

# Run
main
