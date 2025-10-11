#!/bin/bash
# ~/hydra/generate_nginx_subdomains.sh
# Generates nginx_subdomains.conf with 100 short subdomains

OUTPUT_FILE="$HOME/hydra/nginx_subdomains.conf"
START_PORT=30000
NUM_SUBDOMAINS=100
BASE_DOMAIN="yourdomainhere.com"

echo "" > "$OUTPUT_FILE"

for i in $(seq 1 $NUM_SUBDOMAINS); do
    PORT=$((START_PORT + i - 1))
    SUBDOMAIN="sub$i.$BASE_DOMAIN"

    cat >> "$OUTPUT_FILE" <<EOL
server {
    listen 80;
    server_name $SUBDOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    access_log /var/log/nginx/$SUBDOMAIN-access.log;
    error_log /var/log/nginx/$SUBDOMAIN-error.log;
}
EOL
done

echo "✅ Generated $NUM_SUBDOMAINS subdomain server blocks in $OUTPUT_FILE"
