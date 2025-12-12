# AI Vibecoding Academy - Laravel PHP Dockerfile
# Public images only - no private dependencies

FROM php:8.2-fpm-alpine

LABEL project="AI Vibecoding Academy Starter Kit"
LABEL maintainer="AI Vibecoding Academy"

# Install system dependencies
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    supervisor \
    nginx \
    mysql-client \
    git \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mysqli \
        gd \
        zip \
        bcmath \
        pcntl

# Install Redis extension
RUN apk add --no-cache --virtual .phpize-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .phpize-deps

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy composer files and install PHP dependencies into the image so doctrine/dbal
# and other packages are available at image-build time. Note: in development the
# project directory may later be bind-mounted over `/var/www/html`, but installing
# here speeds up CI/builds and avoids runtime installs on clean images.
COPY backend/composer.json /var/www/html/composer.json
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader || true

# Create laravel user
RUN addgroup -g 1000 laravel && adduser -u 1000 -G laravel -s /bin/sh -D laravel

# Copy project-specific configurations
COPY docker/php.ini /usr/local/etc/php/conf.d/project.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set working directory and permissions
WORKDIR /var/www/html
RUN chown -R laravel:laravel /var/www

# Switch to laravel user
USER laravel

# Expose PHP-FPM port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]