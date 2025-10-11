# Create a startup script that uses your actual services
cat > ~/hydra/scripts/start_services.sh << 'EOF'
#!/bin/bash
# start_services.sh - Start multiple instances of actual Hydra services

set -euo pipefail

BASE_DIR="$HOME/hydra"
LOG_DIR="$BASE_DIR/logs"
mkdir -p "$LOG_DIR"

# Number of instances per service
INSTANCES=5  # Reduced for testing, increase later

# Services and their actual entry points
declare -A SERVICES
SERVICES=(
    ["worker"]="api-catalog/worker/worker.js"
    ["uploader"]="api-catalog/uploader/index.js" 
    ["click-tracker"]="api-catalog/click/index.js"
    ["landing"]="api-catalog/landing/index.js"
)

# Base ports
declare -A PORTS
PORTS=(
    ["worker"]=5000
    ["uploader"]=6000
    ["click-tracker"]=7000  
    ["landing"]=4500
)

# Create missing entry points
mkdir -p "$BASE_DIR/api-catalog/uploader"
cat > "$BASE_DIR/api-catalog/uploader/index.js" << 'JS'
const http = require("http");
const PORT = process.env.PORT || 6000;
const server = http.createServer((req, res) => {
  res.writeHead(200, {"Content-Type":"application/json"});
  res.end(JSON.stringify({service:"uploader", port:PORT, status:"ok"}));
});
server.listen(PORT, () => console.log(\`Uploader on port \${PORT}\`));
JS

# Start instances
for svc in "${!SERVICES[@]}"; do
    script_path="$BASE_DIR/${SERVICES[$svc]}"
    base_port=${PORTS[$svc]}
    
    if [ ! -f "$script_path" ]; then
        echo "WARNING: Script not found: $script_path"
        continue
    fi
    
    echo "=== Starting $svc from $script_path ==="
    
    for ((i=0; i<INSTANCES; i++)); do
        port=$((base_port + i))
        pm2_name="${svc}-${port}"
        
        if pm2 describe "$pm2_name" >/dev/null 2>&1; then
            echo "Skipping existing: $pm2_name"
            continue
        fi
        
        pm2 start "$script_path" \
            --name "$pm2_name" \
            --output "$LOG_DIR/$pm2_name.out.log" \
            --error "$LOG_DIR/$pm2_name.err.log" \
            --env PORT="$port" \
            --no-autorestart
            
        echo "Started $pm2_name on port $port"
        sleep 0.1
    done
done

pm2 save
echo "✅ Services started. Check: pm2 list"
EOF

chmod +x ~/hydra/scripts/start_services.sh
