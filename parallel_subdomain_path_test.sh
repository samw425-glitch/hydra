#!/usr/bin/env bash
# ~/hydra/parallel_subdomain_path_test.sh
# Parallel tester: produces ~/hydra/subdomain_path_status.csv (domain,path,status)

set -euo pipefail

# ---------- config ----------
CONFIG="$HOME/hydra/nginx_subdomains.conf"
OUT="$HOME/hydra/subdomain_path_status.csv"
TMP="$HOME/hydra/.subdomain_path_status.tmp"
CONCURRENCY=40   # adjust for your CPU / network; 40 is generous but safe
CURL_TIMEOUT=6
PATHS=( "/" "/lander" "/click" "/api/status" "/api-catalog" )

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# find curl absolute
CURL_BIN="$(command -v curl || true)"
if [[ -z "$CURL_BIN" ]]; then
  if [[ -x "/usr/bin/curl" ]]; then
    CURL_BIN="/usr/bin/curl"
  elif [[ -x "/bin/curl" ]]; then
    CURL_BIN="/bin/curl"
  else
    echo "Error: curl not found. sudo apt update && sudo apt install curl -y" >&2
    exit 1
  fi
fi

# ---------- validate ----------
if [[ ! -f "$CONFIG" ]]; then
  echo "Config not found: $CONFIG" >&2
  exit 2
fi

# create work list: "domain,path"
grep -oP '^\s*server_name\s+\K.+' "$CONFIG" 2>/dev/null \
  | tr -d ';' \
  | tr ' ' '\n' \
  | grep -vE '^_|^\*' \
  | while read -r domain; do
      for p in "${PATHS[@]}"; do
        printf '%s\t%s\n' "$domain" "$p"
      done
    done > "$TMP.jobs"

# header for CSV
echo "domain,path,status" > "$OUT"

# runner function for xargs
run_one() {
  domain="$1"; path="$2"
  url="http://${domain}${path}"
  status="$("$CURL_BIN" -L --max-time $CURL_TIMEOUT -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")"
  printf '%s,%s,%s\n' "$domain" "$path" "$status"
}

export -f run_one
export CURL_BIN CURL_TIMEOUT

# run jobs in parallel and append to CSV
# convert tab-separated job list into xargs args
cat "$TMP.jobs" | xargs -n2 -P"$CONCURRENCY" bash -c 'run_one "$0" "$1"' 2>/dev/null >> "$OUT"

# ---------- summary ----------
echo ""
echo "Results written to: $OUT"
echo ""
echo "=== Failures (status not 2xx/3xx) ==="
awk -F, '($3 !~ /^2|^3/){print $0}' "$OUT" | column -t -s, | sed -n '1,200p' || echo "(none)"

echo ""
echo "=== Quick counts ==="
awk -F, '{counts[$3]++} END { for (s in counts) printf "%s -> %d\n", s, counts[s] }' "$OUT" | sort -nr -k2

# cleanup
rm -f "$TMP.jobs"
