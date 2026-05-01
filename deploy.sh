#!/bin/bash

# Stop execution on error
set -e

echo "🚀 Starting deployment for ZAWIFI..."

# Determine which command to use (docker compose v2 or legacy docker-compose)
if docker compose version >/dev/null 2>&1; then
    DC="docker compose"
    echo "✅ Using Docker Compose v2"
elif command -v docker-compose >/dev/null 2>&1; then
    DC="docker-compose"
    echo "✅ Using Legacy Docker Compose"
else
    echo "❌ Error: docker-compose not found. Please install it."
    exit 1
fi

# Check for .env file
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "⚠️  .env file not found. Creating from .env.example..."
        cp .env.example .env
        echo "⚠️  Please edit .env with your production credentials!"
        echo "❌ Deployment aborted. Fill in .env then re-run."
        exit 1
    else
        echo "❌ Error: .env.example not found. Deployment aborted."
        exit 1
    fi
fi

# Validate critical .env variables
echo "🔍 Validating .env..."
MISSING=0
for VAR in APP_KEY DB_DATABASE DB_USERNAME DB_PASSWORD; do
    VALUE=$(grep -E "^${VAR}=" .env | cut -d '=' -f2-)
    if [ -z "$VALUE" ]; then
        echo "❌ Missing or empty: $VAR"
        MISSING=1
    fi
done
if [ "$MISSING" -eq 1 ]; then
    echo "❌ Fix the missing variables in .env then re-run."
    exit 1
fi
echo "✅ .env looks good!"

# Build and start containers
echo "📦 Building and starting containers (this may take a few minutes)..."
$DC down --remove-orphans || true
$DC up -d --build

# Wait for app container to be healthy/ready
echo "⏳ Waiting for app to be ready..."
RETRIES=30
until docker logs wifi_lambda_app 2>&1 | grep -q "Caddy serving PHP app"; do
    RETRIES=$((RETRIES - 1))
    if [ "$RETRIES" -eq 0 ]; then
        echo "❌ App failed to start. Check logs with: docker logs wifi_lambda_app"
        exit 1
    fi
    sleep 3
done

echo "✅ App is ready!"

# Optional: Cleanup unused images to save disk space
echo "🧹 Cleaning up old images..."
docker image prune -f

echo ""
echo "🎉 Deployment successful!"
echo "📍 App running at: http://$(hostname -I | awk '{print $1}'):8000"
echo "📋 Logs: docker logs -f wifi_lambda_app"
