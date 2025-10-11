#!/bin/bash
# restart_all_backends.sh - Smart version that detects entry points

LOG_DIR=~/hydra/logs
mkdir -p "$LOG_DIR"

echo "=== Killing all existing backend processes on ports 30000-30100 ==="
for port in {30000..30100}; do
    pid=$(sudo lsof -t -i:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "Killing PID $pid on port $port"
        sudo kill -9 $pid 2>/dev/null
    fi
done

echo "=== Starting all backend services ==="
declare -A PORT_DIR_MAP=(
    [30041]=~/hydra/api-catalog
    [30042]=~/hydra/lander
    [30043]=~/hydra/click
)

for port in "${!PORT_DIR_MAP[@]}"; do
    app_dir="${PORT_DIR_MAP[$port]}"
    
    if [[ -d "$app_dir" ]]; then
        echo "Starting $port -> $app_dir"
        
        # Check and install dependencies
        if [[ -f "$app_dir/package.json" ]]; then
            echo "📦 Installing dependencies for $app_dir..."
            cd "$app_dir"
            npm install --silent
        fi
        
        # Find the main entry point
        main_file=""
        cd "$app_dir"
        
        # Check common entry points in order of preference
        for file in server.js app.js index.js main.js orchestrator.js topic-fetcher.js; do
            if [[ -f "$file" ]]; then
                main_file="$file"
                echo "✅ Found entry point: $main_file"
                break
            fi
        done
        
        if [[ -z "$main_file" ]]; then
            echo "❌ No entry point found in $app_dir (looked for server.js, app.js, index.js, main.js, orchestrator.js, topic-fetcher.js)"
            continue
        fi
        
        # Start the server
        echo "🚀 Starting: node $main_file -p $port"
        nohup node "$main_file" -p $port > "$LOG_DIR/$port.log" 2>&1 &
        echo "✅ Started $port using $main_file (PID: $!)"
        
    else
        echo "⚠️  Directory $app_dir not found for port $port, skipping..."
    fi
done

echo "=== Waiting for servers to initialize ==="
sleep 3

echo "=== Verification ==="
echo "Live Node processes:"
ps aux | grep "node " | grep -v grep

echo -e "\nPorts listening:"
sudo ss -ltnp | grep 30

echo -e "\n=== Done ==="
