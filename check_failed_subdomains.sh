#!/usr/bin/env bash
# ~/hydra/check_failed_subdomains.sh (fixed)

set -euo pipefail

CSV="$HOME/hydra/subdomain_path_status.csv"
NGINX_CONF="$HOME/hydra/nginx_subdomains.conf"

echo "Checking failing subdomains..."

awk -F'\t' '$3=="000000" {print $1}' "$CSV" | sort -u | while read -r sub; do
    # Find the proxy port in nginx config
    port=$(grep -A5 "server_name $sub" "$NGINX_CONF" \
           | grep "proxy_pass" \
           | awk -F: '{print $3}' | tr -d ';')

    if [[ -z "$port" ]]; then
        echo "$sub -> No proxy port found in nginx config ❌"
    else
        # Check if the port is listening
        if sudo ss -ltnp | grep -q ":$port"; then
            echo "$sub -> port $port is LISTENING ✅"
        else
            echo "$sub -> port $port is NOT LISTENING ❌"
        fi
    fi
done
