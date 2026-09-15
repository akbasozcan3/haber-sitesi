FROM php:8.2-cli-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    openssl-dev \
    autoconf \
    g++ \
    make \
    linux-headers \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && docker-php-ext-install pdo pdo_mysql bcmath gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . /app

RUN composer install --optimize-autoloader --no-dev --no-interaction

EXPOSE 8000

CMD ["sh", "-c", "php artisan storage:link && php artisan serve --host=0.0.0.0 --port=8000"]
