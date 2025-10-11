#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# ⚙️ Hydra Smart Nginx Regenerator — Unique Ports Edition
# Generates nginx_subdomains.conf from cname_ready.txt + spawned-containers.json
# Auto-increments ports cleanly and avoids duplicates.
# ─────────────────────────────────────────────

CNAME_FILE="cname_ready.txt"
JSON_FILE="spawned-containers.json"
OUT_FILE="nginx_subdomains.conf.new"
DOMAIN_FALLBACK="${1:-yourdomain.com}"
PORT_BASE="${PORT_BASE:-30000}"

GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RESET="\033[0m"

echo -e "\n${GREEN}🧠 Hydra Nginx Regenerator — assigning unique ports...${RESET}"
echo "Domain fallback: ${DOMAIN_FALLBACK}"
echo "Starting port: ${PORT_BASE}"
echo

# ─────────────────────────────────────────────
# Ensure JSON file exists
# ─────────────────────────────────────────────
if [ ! -f "$JSON_FILE" ]; then
  echo "[]" > "$JSON_FILE"
  echo -e "${YELLOW}⚠️ Created new $JSON_FILE${RESET}"
fi

# ─────────────────────────────────────────────
# Remove duplicates & normalize JSON
# ─────────────────────────────────────────────
tmp_clean=$(mktemp)
jq 'unique_by(.containerName)' "$JSON_FILE" > "$tmp_clean" && mv "$tmp_clean" "$JSON_FILE"

# ─────────────────────────────────────────────
# Function: next available port
# ─────────────────────────────────────────────
get_next_port() {
  local used_ports max_port
  used_ports=$(jq -r '.[].port' "$JSON_FILE" | grep -E '^[0-9]+$' || true)
  if [ -z "$used_ports" ]; then
    echo "$PORT_BASE"
  else
    max_port=$(echo "$used_ports" | sort -n | tail -1)
    echo $((max_port + 1))
  fi
}

> "$OUT_FILE"
echo "# Auto-generated Nginx config — $(date)" >> "$OUT_FILE"

# ─────────────────────────────────────────────
# Main loop
# ─────────────────────────────────────────────
while IFS= read -r line || [ -n "$line" ]; do
  line="$(echo "$line" | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [ -z "$line" ] && continue

  host="${line#http://}"
  host="${host#https://}"
  host="${host%%:*}"

  [[ "$host" != *.* ]] && host="${host}.${DOMAIN_FALLBACK}"
  baseName="${host%%.*}"

  # Check existing entry
  existing_port=$(jq -r --arg name "$baseName" '.[] | select(.containerName == $name) | .port' "$JSON_FILE" || true)

  if [ -n "$existing_port" ] && [ "$existing_port" != "null" ]; then
    port="$existing_port"
    echo -e "${GREEN}Using existing port $port for $host${RESET}"
  else
    port="$(get_next_port)"
    echo -e "${YELLOW}Assigning new port $port to $host${RESET}"
    tmp_json=$(mktemp)
    jq --arg name "$baseName" --argjson port "$port" '. + [{containerName: $name, port: $port}]' "$JSON_FILE" > "$tmp_json"
    mv "$tmp_json" "$JSON_FILE"
  fi

  # Write nginx block
  cat >> "$OUT_FILE" <<EOF
server {
    listen 80;
    server_name ${host};

    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

EOF

done < "$CNAME_FILE"

# ─────────────────────────────────────────────
# Finalize
# ─────────────────────────────────────────────
mv "$OUT_FILE" nginx_subdomains.conf
jq 'unique_by(.containerName)' "$JSON_FILE" > tmp && mv tmp "$JSON_FILE"

echo -e "\n${GREEN}✅ Regenerated nginx_subdomains.conf${RESET}"
head -n 25 nginx_subdomains.conf
echo -e "\n${GREEN}💾 Updated port mapping:${RESET}"
jq . "$JSON_FILE" | head -n 15
echo -e "\n${GREEN}✨ Done.${RESET}\n"
