#!/bin/sh
set -e

# Fix storage permissions (volume mount can override Dockerfile chown)
chown -R www-data:www-data /app/storage /app/bootstrap/cache
chmod -R 775 /app/storage /app/bootstrap/cache

# Wait for database to be ready
echo "Waiting for database..."
until nc -z db 3306; do
  sleep 1
done
echo "Database is ready!"

# Run migrations
php artisan migrate --force

# Create storage symlink if not exists
php artisan storage:link --force 2>/dev/null || true

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Execute the CMD
exec "$@"