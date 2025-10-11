#!/usr/bin/env bash
# ~/hydra/test_all_subdomains.sh
# Robust tester that uses an absolute curl path if needed.

# Ensure sane PATH for helpers (still uses absolute curl if PATH broken)
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

CONFIG_FILE="$HOME/hydra/nginx_subdomains.conf"
PATHS=("/" "/lander" "/click" "/api/status" "/api-catalog")
CURL_TIMEOUT=6

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; NC='\033[0m'

# Try to locate curl binary explicitly
CURL_BIN="$(command -v curl 2>/dev/null || true)"
if [[ -z "$CURL_BIN" ]]; then
  if [[ -x "/usr/bin/curl" ]]; then
    CURL_BIN="/usr/bin/curl"
  elif [[ -x "/bin/curl" ]]; then
    CURL_BIN="/bin/curl"
  else
    echo -e "${RED}Error:${NC} curl not found. Install it with: sudo apt update && sudo apt install curl -y"
    exit 1
  fi
fi

echo -e "${YELLOW}Using curl binary at: $CURL_BIN${NC}"

if [ ! -f "$CONFIG_FILE" ]; then
  echo -e "${RED}Error:${NC} config file not found: $CONFIG_FILE"
  exit 2
fi

# Extract server_name tokens; skip '_' and '*' defaults
SUBDOMAINS=$(grep -oP '^\s*server_name\s+\K.+' "$CONFIG_FILE" 2>/dev/null | tr -d ';' | tr ' ' '\n' | grep -vE '^_|^\*' || true)
if [[ -z "$SUBDOMAINS" ]]; then
  echo -e "${YELLOW}No subdomains found in $CONFIG_FILE${NC}"
  exit 0
fi

echo -e "\n=== Hydra Subdomain Path Test (using $CURL_BIN) ===\n"
for DOMAIN in $SUBDOMAINS; do
  echo -e "${YELLOW}Testing: $DOMAIN${NC}"
  for P in "${PATHS[@]}"; do
    URL="http://$DOMAIN$P"
    HTTP_STATUS=$("$CURL_BIN" -L --max-time $CURL_TIMEOUT -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null) || HTTP_STATUS="000"
    if [[ "$HTTP_STATUS" =~ ^2|3 ]]; then
      echo -e "  $P -> ${GREEN}OK${NC} (HTTP $HTTP_STATUS)"
    else
      echo -e "  $P -> ${RED}FAIL${NC} (HTTP $HTTP_STATUS)"
    fi
  done
  echo ""
done

echo "=== Test Complete ==="
