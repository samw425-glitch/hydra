#!/bin/bash
# scripts/run_all.sh

set -e

echo "[INFO] Starting full Hydra automation..."

# 1. Generate content
for f in ./gen/*.sh; do
    echo "[INFO] Running $f"
    bash "$f"
done

# 2. Spawn containers
for f in ./spawn/*.sh; do
    echo "[INFO] Running $f"
    bash "$f"
done

# 3. Deploy if needed
for f in ./deploy/*.sh; do
    echo "[INFO] Running $f"
    bash "$f"
done

echo "[INFO] All automation completed!"
