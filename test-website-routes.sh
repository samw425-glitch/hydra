#!/bin/bash
echo "🌐 WEBSITE ROUTE TESTER"
echo "======================"

# Define all routes to test
routes=(
  "/"
  "/Lead_Generation_Strategies"
  "/seo" 
  "/analytics"
  "/api"
  "/about"
  "/contact"
  "/health"
  "/nonexistent"  # This should 404
)

for route in "${routes[@]}"; do
  echo -n "Testing $route ... "
  status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000$route)
  
  case $status_code in
    200) echo "✅ 200 OK" ;;
    404) echo "❌ 404 Not Found" ;;
    500) echo "💥 500 Server Error" ;;
    *)   echo "⚠️  $status_code Unknown" ;;
  esac
done

echo ""
echo "🎯 Quick Access Links:"
echo "   Home: http://localhost:3000/"
echo "   Lead Generation: http://localhost:3000/Lead_Generation_Strategies"
echo "   SEO: http://localhost:3000/seo"
echo "   Analytics: http://localhost:3000/analytics"
