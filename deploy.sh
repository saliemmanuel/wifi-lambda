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
    else
        echo "❌ Error: .env.example not found. Deployment aborted."
        exit 1
    fi
fi

# Build and start containers
echo "📦 Building and starting containers (this may take a few minutes)..."
$DC down --remove-orphans || true
$DC up -d --build

# Optional: Cleanup unused images to save disk space
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Deployment successful!"
echo "📍 Your application should be running on port 8000 (or as configured in docker-compose.yml)"
