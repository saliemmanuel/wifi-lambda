# Stage 1: Build assets (with PHP + Node)
FROM dunglas/frankenphp:1-php8.4-alpine AS build-assets

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Install PHP dependencies first (needed for Vite plugins like Wayfinder)
COPY composer.* ./
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --no-scripts --no-autoloader

# Install JS dependencies and build
COPY package*.json ./
RUN npm install
COPY . .
RUN composer dump-autoload --no-dev --optimize
RUN npm run build

# Final stage
FROM dunglas/frankenphp:1-php8.4-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    libzip-dev \
    unzip \
    git \
    icu-dev \
    oniguruma-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql zip intl mbstring bcmath opcache

ENV SERVER_NAME=:80

# Copy application files
COPY . .
# Copy built assets from build stage
COPY --from=build-assets /app/public/build ./public/build
# Copy vendor from build stage
COPY --from=build-assets /app/vendor ./vendor

# Set permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Production settings
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

ENTRYPOINT ["docker-entrypoint"]
CMD ["frankenphp", "php-server", "--config", "/etc/caddy/Caddyfile"]
