#!/bin/bash
echo "🚀 Deploying Hydra API..."
cd ~/dev/hydra
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
