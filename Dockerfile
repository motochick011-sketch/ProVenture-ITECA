FROM php:8.2-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite (useful for future routing)
RUN a2enmod rewrite

# Set the document root to /var/www/html
WORKDIR /var/www/html

# Copy project files into the container
COPY ../../../../Downloads /var/www/html/

# Ensure Apache can read the files
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
