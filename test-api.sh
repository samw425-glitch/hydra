#!/bin/bash
echo "🚀 Testing API Endpoints..."
echo "==========================="

echo "API Health:"
curl -s http://localhost:4000/health | jq . 2>/dev/null || curl -s http://localhost:4000/health

echo ""
echo "API Data:"
curl -s http://localhost:4000/data | jq . 2>/dev/null || curl -s http://localhost:4000/data

echo ""
echo "API Users:"
curl -s http://localhost:4000/users | jq . 2>/dev/null || curl -s http://localhost:4000/users
