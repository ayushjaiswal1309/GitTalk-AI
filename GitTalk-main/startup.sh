#!/usr/bin/env bash
set -euo pipefail

# Build frontend
cd Frontend
npm ci
npm run build

# copy frontend build into backend/public
rm -rf ../backend/public
mkdir -p ../backend/public
cp -r dist/* ../backend/public/

# Install backend deps and start server
cd ../backend
npm ci
npm start
