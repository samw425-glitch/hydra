#!/usr/bin/env bash
# ~/hydra/test_subdomains.sh
# Single-file Hydra subdomain tester
# Usage: bash ~/hydra/test_subdomains.sh

# ---------- safety PATH ----------
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# ---------- config ----------
CONFIG_FILE="$HOME/hydra/nginx_subdomains.conf"
# Paths to check for each subdomain
PATHS=("/" "/lander" "/click" "/api/status" "/api-catalog")
# Timeout for curl (seconds)
CURL_TIMEOUT=8

# ---------- colors ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

# ---------- pre-checks ----------
if [ ! -f "$CONFIG_FILE" ]; then
  echo -e "${RED}Error:${NC} config file not found: $CONFIG_FILE"
  exit 2
fi

if ! command -v curl >/dev/null 2>&1; then
  echo -e "${RED}Error:${NC} curl not found. Install curl and re-run."
  exit 3
fi

# ---------- extract server_name values ----------
# This extracts the second token after 'server_name' and handles multiple names per line.
mapfile -t RAW_NAMES < <(grep -oP '^\s*server_name\s+\K.+' "$CONFIG_FILE" || true)

SUBDOMAINS=()
for line in "${RAW_NAMES[@]}"; do
  # split on whitespace, remove trailing semicolons
  for name in $line; do
    name="${name%;}"        # strip trailing ;
    # skip wildcard/underscore default and empty
    if [[ -z "$name" || "$name" = "_" || "$name" = "*" ]]; then
      continue
    fi
    SUBDOMAINS+=("$name")
  done
done

# Remove duplicates while preserving order
unique_subs=()
declare -A seen
for s in "${SUBDOMAINS[@]}"; do
  if [[ -z "${seen[$s]}" ]]; then
    unique_subs+=("$s")
    seen[$s]=1
  fi
done

if [ ${#unique_subs[@]} -eq 0 ]; then
  echo -e "${YELLOW}No real subdomains found in $CONFIG_FILE (only '_' or none).${NC}"
  exit 0
fi

echo -e "\n=== Hydra Subdomain Path Test ==="
printf "Found %d subdomain(s): %s\n\n" "${#unique_subs[@]}" "$(printf "%s " "${unique_subs[@]}")"

# ---------- run tests ----------
declare -A summary_ok
declare -A summary_fail
for DOMAIN in "${unique_subs[@]}"; do
  echo -e "${YELLOW}Testing: $DOMAIN${NC}"
  for P in "${PATHS[@]}"; do
    URL="http://$DOMAIN$P"
    # follow redirects (-L), show only status code, fail on timeout/connection issues
    HTTP_STATUS=$(curl -L --max-time $CURL_TIMEOUT -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null) || HTTP_STATUS="000"
    if [[ "$HTTP_STATUS" =~ ^2|3 ]]; then
      echo -e "  $P -> ${GREEN}OK${NC} (HTTP $HTTP_STATUS)"
      summary_ok["$DOMAIN,$P"]=$HTTP_STATUS
    else
      echo -e "  $P -> ${RED}FAIL${NC} (HTTP $HTTP_STATUS)"
      summary_fail["$DOMAIN,$P"]=$HTTP_STATUS
    fi
  done
  echo ""
done

# ---------- summary ----------
echo -e "=== Summary ==="
echo -e "${GREEN}Successful checks:${NC}"
if [ ${#summary_ok[@]} -eq 0 ]; then
  echo "  (none)"
else
  for k in "${!summary_ok[@]}"; do
    IFS=',' read -r d p <<< "$k"
    printf "  %-40s %-12s HTTP %s\n" "$d" "$p" "${summary_ok[$k]}"
  done
fi

echo -e "\n${RED}Failed checks:${NC}"
if [ ${#summary_fail[@]} -eq 0 ]; then
  echo "  (none)"
else
  for k in "${!summary_fail[@]}"; do
    IFS=',' read -r d p <<< "$k"
    printf "  %-40s %-12s HTTP %s\n" "$d" "$p" "${summary_fail[$k]}"
  done
fi

echo -e "\n=== Test Complete ==="
