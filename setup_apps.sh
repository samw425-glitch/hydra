# Save this as ~/setup_apps.sh
#!/bin/bash

echo "🚀 Setting up your app ecosystem..."

# Install common tools
sudo apt update
sudo apt install -y git python3-pip nodejs npm screen tmux

# Create essential apps
runapp create system-monitor << 'EOF'
#!/bin/bash
echo "🖥️  System Monitor"
echo "=================="
uptime
free -h
df -h ~
EOF

runapp create git-manager << 'EOF'
#!/bin/bash
echo "📦 Git Repository Manager"
echo "========================"
find ~ -name ".git" -type d 2>/dev/null | while read repo; do
    project=$(dirname "$repo")
    echo "📁 $(basename $project)"
    git -C "$project" status --short
done
EOF

runapp create python-server << 'EOF'
#!/bin/bash
echo "🐍 Starting Python HTTP Server..."
cd "${1:-.}"
python3 -m http.server 8000
EOF

echo "✅ App ecosystem ready!"
echo "📝 Run 'runapp list' to see available apps"
