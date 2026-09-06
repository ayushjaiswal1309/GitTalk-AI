#!/bin/bash
set -e

echo "=== Starting Python FastAPI AI Server (Port 8000) ==="
cd /app/app
uvicorn server:app --host 127.0.0.1 --port 8000 &

echo "=== Waiting for Python Server to initialize... ==="
sleep 3

echo "=== Starting Node.js Express Backend & Frontend Server ==="
cd /app/backend
exec node server.js
