#!/usr/bin/env bash
echo "Example gen script running on: $(date)"
sleep 1
mkdir -p "$(dirname "$0")/../../output" 2>/dev/null || true
echo "sample output from example.sh at $(date)" > "$(cd "$(dirname "$0")/../.." && pwd)/output/example.out"
exit 0
