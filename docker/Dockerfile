FROM php:7.4-apache

RUN echo 'deb http://archive.debian.org/debian bullseye main' > /etc/apt/sources.list \
    && echo 'deb http://archive.debian.org/debian bullseye-updates main' >> /etc/apt/sources.list \
    && echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev libjpeg62-turbo-dev libfreetype6-dev libwebp-dev \
    libzip-dev libonig-dev libxml2-dev libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        mysqli pdo pdo_mysql \
        gd \
        zip mbstring xml \
        opcache \
    && a2enmod rewrite headers

COPY php.ini /usr/local/etc/php/conf.d/custom.ini
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

EXPOSE 80
CMD ["apache2-foreground"]
