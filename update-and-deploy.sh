#!/bin/bash

echo "🔄 HYDRA ECOSYSTEM UPDATE & DEPLOYMENT"
echo "======================================"

# Step 1: Update local code
echo "1. 📥 Updating local code..."
git pull origin main

# Step 2: Stop current services
echo "2. 🛑 Stopping current services..."
docker-compose -f docker-compose.complete.yml down

# Step 3: Build updated services
echo "3. 🔨 Building updated services..."
docker-compose -f docker-compose.complete.yml build --no-cache

# Step 4: Start services
echo "4. 🚀 Starting updated services..."
docker-compose -f docker-compose.complete.yml up -d

# Step 5: Verify services
echo "5. ✅ Verifying services..."
sleep 10
docker-compose -f docker-compose.complete.yml ps

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
