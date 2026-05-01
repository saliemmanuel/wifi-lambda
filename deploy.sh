#!/bin/bash

# Stop execution on error
set -e

echo "Deploying application..."

# Determine which command to use (docker compose v2 or legacy docker-compose)
if docker compose version >/dev/null 2>&1; then
    DC="docker compose"
    echo "Using Docker Compose v2"
elif command -v docker-compose >/dev/null 2>&1; then
    DC="docker-compose"
    echo "Using Legacy Docker Compose"
    export DOCKER_BUILDKIT=0
    export COMPOSE_DOCKER_CLI_BUILD=0
else
    echo "Error: docker-compose not found. Please install it."
    exit 1
fi

# Build and start containers
echo "Building and starting containers..."
$DC down --remove-orphans || true
$DC up -d --build

# Wait for database to be ready
echo "Waiting for database to be ready..."
MAX_RETRIES=30
COUNT=0

while [ $COUNT -lt $MAX_RETRIES ]; do
    # Check if we can connect to the database using PHP inside the container
    if $DC exec -T app php -r "try { new PDO('mysql:host=db;dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]); echo 'Connected'; } catch (PDOException \$e) { exit(1); }" > /dev/null 2>&1; then
        echo "Database is ready!"
        break
    fi
    
    echo "Database not ready yet... waiting ($COUNT/$MAX_RETRIES)"
    sleep 2
    COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "Error: Database connection timed out."
    echo "Printing container logs for debugging:"
    $DC logs db
    exit 1
fi

# Run migrations (using -T to avoid TTY errors in scripts)
echo "Running migrations..."
$DC exec -T app php artisan migrate --force

# Optimize cache
echo "Optimizing cache..."
$DC exec -T app php artisan optimize
$DC exec -T app php artisan view:cache
$DC exec -T app php artisan config:cache
$DC exec -T app php artisan route:cache

echo "Deployment complete!"
