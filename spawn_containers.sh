#!/bin/bash

# Name your network
NETWORK="technicobasico-net"
docker network create $NETWORK 2>/dev/null

# List of services: container_name:internal_port
services=(
    "click-tracker-4100:4000"
    "click-tracker-4101:4000"
    "click-tracker-4102:4000"
    "csv:4203"
)

# Function to find a free host port
get_free_port() {
    while :; do
        port=$((4000 + RANDOM % 1000))
        ! lsof -i :"$port" &>/dev/null && echo "$port" && return
    done
}

# Array to store table rows
declare -a table_rows=()

for svc in "${services[@]}"; do
    name="${svc%%:*}"
    container_port="${svc##*:}"
    host_port=$(get_free_port)

    # Remove container if exists
    docker rm -f "$name" 2>/dev/null

    # Spawn container
    cid=$(docker run -d --name "$name" --network "$NETWORK" -p "$host_port:$container_port" hydra-click-tracker:latest 2>/dev/null)

    if [ -n "$cid" ]; then
        # Format subdomain
        subdomain=$(echo "$name" | tr '_' '-')
        table_rows+=("$host_port|$name|$subdomain.technicobasico.local")
        echo "✅ Spawned $name on port $host_port -> $subdomain.technicobasico.local"
    else
        echo "❌ Failed to spawn $name. Port $host_port may be in use."
    fi
done

# Print final table
echo -e "\n\e[1;33mPort | Name | Subdomain\e[0m"
for row in "${table_rows[@]}"; do
    IFS="|" read -r port name subdomain <<< "$row"
    echo -e "\e[33m$port\e[0m | \e[32m$name\e[0m | \e[36m$subdomain\e[0m"
done
