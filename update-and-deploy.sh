#!/bin/bash

echo "🔄 HYDRA ECOSYSTEM UPDATE & DEPLOYMENT"
echo "======================================"

# Check if docker compose is available
if command -v docker-compose > /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version > /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "❌ Error: Neither 'docker-compose' nor 'docker compose' is available."
    echo "Please install Docker Compose:"
    echo "  https://docs.docker.com/compose/install/"
    exit 1
fi

echo "Using: $DOCKER_COMPOSE_CMD"

# Step 1: Update local code
echo "1. 📥 Updating local code..."
git pull origin main

# Step 2: Stop current services
echo "2. 🛑 Stopping current services..."
$DOCKER_COMPOSE_CMD -f docker-compose.complete.yml down

# Step 3: Build updated services
echo "3. 🔨 Building updated services..."
$DOCKER_COMPOSE_CMD -f docker-compose.complete.yml build --no-cache

# Step 4: Start services
echo "4. 🚀 Starting updated services..."
$DOCKER_COMPOSE_CMD -f docker-compose.complete.yml up -d

# Step 5: Verify services
echo "5. ✅ Verifying services..."
sleep 10
$DOCKER_COMPOSE_CMD -f docker-compose.complete.yml ps

# Step 6: Test services
echo "6. 🧪 Testing services..."
./scripts/manage-complete-hydra.sh test

# Step 7: Push to GitHub
echo "7. 📤 Pushing to GitHub..."
git add .
git commit -m "chore: Update deployment $(date +%Y-%m-%d)"
git push origin main

echo ""
echo "🎉 Update complete!"
echo "🌐 Local services running on:"
echo "   Website: http://localhost:3000"
echo "   API: http://localhost:4000"
echo "   UTM: http://localhost:9000"
