#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
until nc -z db 3306; do
  sleep 1
done
echo "Database is ready!"

# Run migrations
php artisan migrate --force

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Execute the CMD
exec "$@"
