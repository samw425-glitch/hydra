#!/bin/bash
echo "🌐 Opening Hydra Website..."
echo "Main Site: http://localhost:3000/"
echo "Lead Generation: http://localhost:3000/Lead_Generation_Strategies"
echo "SEO: http://localhost:3000/seo"

# Try to open in default browser (if GUI available)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000/ 2>/dev/null &
elif command -v open > /dev/null; then
    open http://localhost:3000/ 2>/dev/null &
fi

# Show quick test
curl -s http://localhost:3000/ | grep -o "<title>.*</title>"
