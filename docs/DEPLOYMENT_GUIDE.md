# Deployment Guide - VibeCoding Platform

**Version**: 1.0.0  
**Date**: December 20, 2025  
**Status**: Production Ready

---

## 📋 Quick Start

1. Clone repository
2. Configure environment
3. Install dependencies
4. Run migrations
5. Build frontend
6. Start services
7. Run tests

---

## Prerequisites

### Backend Requirements
- PHP 8.2+
- Laravel 12.23+
- MySQL 8.0+
- Composer
- Redis (optional, for caching)

### Frontend Requirements
- Node.js 18+
- npm or yarn
- Next.js 15+

### Infrastructure
- Docker (optional, recommended)
- Docker Compose
- Linux/macOS/Windows with WSL2

---

## Step 1: Environment Setup

### Clone Repository
```bash
git clone https://github.com/yourusername/vibecoding.git
cd vibecoding
```

### Create Environment Files

**Backend (.env)**:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
APP_NAME=VibeCoding
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=vibecoding
DB_USERNAME=root
DB_PASSWORD=your_secure_password

CACHE_DRIVER=redis
QUEUE_CONNECTION=database

MAIL_DRIVER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS=noreply@vibecoding.dev

SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=yourdomain.com
```

**Frontend (.env.local)**:
```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_NAME=VibeCoding
```

---

## Step 2: Docker Setup (Recommended)

### Using Docker Compose

```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# Verify services
docker-compose ps
```

This starts:
- PHP-FPM (backend API)
- Nginx (web server)
- MySQL (database)
- Redis (cache)

### Alternative: Manual Setup

```bash
# Backend
cd backend

# Install dependencies
composer install

# Generate application key
php artisan key:generate

# Create database
mysql -u root -p < database/init.sql

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Frontend
cd ../frontend

# Install dependencies
npm install

# Build production
npm run build

# Start production server
npm run start
```

---

## Step 3: Database Configuration

### Create Database
```bash
mysql -u root -p
CREATE DATABASE vibecoding;
CREATE USER 'vibecoding'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON vibecoding.* TO 'vibecoding'@'localhost';
FLUSH PRIVILEGES;
```

### Run Migrations
```bash
cd backend
php artisan migrate --env=production
```

### Seed Initial Data (Optional)
```bash
php artisan db:seed --class=ProductionSeeder
```

---

## Step 4: Backend Setup

```bash
cd backend

# Install Composer dependencies
composer install --optimize-autoloader --no-dev

# Generate app key
php artisan key:generate

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage symlink
php artisan storage:link

# Set permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Generate Passport keys (if using OAuth)
php artisan passport:keys
```

### Queue Configuration

For background jobs:
```bash
# Start queue worker
php artisan queue:work --queue=default,notifications,emails

# Or use Supervisor (recommended for production)
# See: config/supervisor.conf
```

---

## Step 5: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Test build locally
npm run start

# Or use Next.js with PM2 (production)
npm install -g pm2
pm2 start "npm run start" --name "vibecoding-frontend"
```

---

## Step 6: Nginx Configuration

Create `/etc/nginx/sites-available/vibecoding`:

```nginx
upstream vibecoding_backend {
    server php-fpm:9000;
}

server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Root directories
    root /var/www/vibecoding/public;

    # API routes (Laravel)
    location /api/ {
        try_files $uri $uri/ /index.php?$query_string;
        
        fastcgi_pass vibecoding_backend;
        fastcgi_param SCRIPT_FILENAME $realpath_root/index.php;
        include fastcgi_params;
    }

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/vibecoding /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 7: SSL/TLS Certificate

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Step 8: Verification

### Backend Health
```bash
# Check Laravel health
curl https://yourdomain.com/api/health

# Expected response:
# {"status":"ok","database":true,"cache":true}
```

### Frontend
```bash
# Visit website
https://yourdomain.com
```

### Database Connection
```bash
php artisan tinker
>>> DB::connection()->getPdo()
```

### Queue Status
```bash
php artisan queue:failed
```

---

## Step 9: Testing

### Run Tests
```bash
cd backend

# Run all tests
php artisan test

# Run specific test
php artisan test tests/Feature/ToolTest.php

# With coverage
php artisan test --coverage
```

### Performance Testing
```bash
# Cacheing
php artisan config:cache
php artisan route:cache

# Optimize autoloader
composer dump-autoload --optimize

# Check performance
php artisan tinker
>>> Cache::remember('key', now()->addHour(), fn() => /* query */);
```

---

## Step 10: Monitoring

### Error Tracking
Configure Sentry:
```env
SENTRY_LARAVEL_DSN=your_sentry_url
```

### Logging
Check logs:
```bash
tail -f storage/logs/laravel.log
```

### Database Performance
```bash
# Enable query logging
php artisan tinker
>>> DB::enableQueryLog();
>>> DB::getQueryLog();
```

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] SSL certificate installed
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Error tracking active
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Tests passing (100%)
- [ ] Caching enabled
- [ ] Queue workers running
- [ ] Logs monitored
- [ ] Security headers set
- [ ] File permissions correct
- [ ] Database backups automated

---

## Backup Strategy

### Daily Backups
```bash
# Database backup
mysqldump -u vibecoding -p vibecoding > /backups/db_$(date +%Y%m%d_%H%M%S).sql

# File backup
tar -czf /backups/files_$(date +%Y%m%d_%H%M%S).tar.gz storage/

# Or use script in cron
0 2 * * * /var/www/vibecoding/backup.sh
```

### Restore from Backup
```bash
mysql -u vibecoding -p vibecoding < /backups/db_YYYYMMDD_HHMMSS.sql
tar -xzf /backups/files_YYYYMMDD_HHMMSS.tar.gz -C /
```

---

## Scaling

### Load Balancing
For high traffic, use load balancer (AWS ELB, NGINX, etc.):
- Backend: Multiple PHP-FPM instances
- Frontend: Multiple Next.js servers
- Database: Read replicas, write master

### Caching Strategy
- Redis for session/cache
- CDN for static assets
- Database query caching
- API response caching

### Database Optimization
- Indexes on frequently queried columns
- Read replicas for heavy queries
- Query optimization
- Connection pooling

---

## Troubleshooting

### 502 Bad Gateway
```bash
# Check PHP-FPM
php-fpm -t

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

### Database Connection Error
```bash
# Test connection
mysql -h localhost -u vibecoding -p vibecoding -e "SELECT 1"

# Check Laravel
php artisan tinker
>>> DB::connection()->getPdo()
```

### Queue Not Processing
```bash
# Check failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Check worker
ps aux | grep queue:work
```

### High Memory Usage
```bash
# Check Laravel processes
php artisan tinker
>>> Memory usage

# Optimize
php artisan config:cache
php artisan view:cache
```

---

## Maintenance Mode

### Enable Maintenance
```bash
php artisan down --secret=secret_token

# Access during maintenance
https://yourdomain.com/?secret=secret_token
```

### Disable Maintenance
```bash
php artisan up
```

---

## Updates

### Update Laravel
```bash
composer update
php artisan migrate
```

### Update Dependencies
```bash
# PHP dependencies
composer update

# JavaScript dependencies
npm update

# Rebuild
npm run build
```

---

## Support

For deployment issues: deployment-support@vibecoding.dev

---

**Last Updated**: December 20, 2025
