FROM php:8.2-fpm

# Install system dependencies and PHP extensions
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libzip-dev zip unzip git curl libpng-dev libonig-dev libxml2-dev default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip xml \
    && rm -rf /var/lib/apt/lists/*

# Install Composer (copy from official composer image)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install Xdebug
RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

# Set working directory
WORKDIR /var/www/html

# Create a non-root 'laravel' user for ownership and permissions
RUN groupadd -g 1000 laravel || true \
    && useradd -u 1000 -ms /bin/bash -g laravel laravel || true

# Copy composer files and install dependencies (use cache by copying only composer files first)
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts || true

# Copy the rest of the application
COPY . .

# Fix permissions for storage & cache (use laravel user so start.sh chown works)
RUN chown -R laravel:laravel /var/www/html/storage /var/www/html/bootstrap/cache || true

EXPOSE 9003 8000

CMD ["php-fpm"]
