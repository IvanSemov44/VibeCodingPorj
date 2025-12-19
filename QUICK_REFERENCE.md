# VibeCoding Platform - Quick Reference Guide

**Last Updated**: December 20, 2025
**Version**: 1.0 (Production Ready)

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Laravel 12.23+
- MySQL 8.0+
- Node.js 18+
- Docker (recommended)

### Installation (Docker)
```bash
# 1. Clone repository
git clone https://github.com/yourusername/vibecoding.git
cd vibecoding

# 2. Start services
docker-compose up -d

# 3. Set up database
docker-compose exec app php artisan migrate --seed

# 4. View application
# Backend API: http://localhost:8201
# Frontend: http://localhost:3000
```

### Installation (Local)
```bash
# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📊 API Quick Reference

### Authentication
```bash
# Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure-password"
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "secure-password"
}

# All requests use Bearer token
Authorization: Bearer <token>
```

### Tools
```bash
# List all tools
GET /api/tools

# Search tools
GET /api/tools?q=laravel&category=framework

# Get tool detail
GET /api/tools/{id}

# Create tool
POST /api/tools
{
  "name": "Tool Name",
  "description": "Description",
  "categories": [1, 2]
}

# Update tool
PUT /api/tools/{id}

# Delete tool
DELETE /api/tools/{id}
```

### Search
```bash
# Basic search
GET /api/search?q=query

# Advanced search
GET /api/search/advanced?q=query&min_rating=4&status=approved

# Get suggestions
GET /api/search/suggestions?q=lar
```

### Comments
```bash
# Get comments
GET /api/tools/{id}/comments

# Add comment
POST /api/tools/{id}/comments
{
  "body": "Great tool!"
}

# Update comment
PUT /api/comments/{id}

# Delete comment
DELETE /api/comments/{id}
```

### Ratings
```bash
# Get ratings
GET /api/tools/{id}/ratings

# Add rating
POST /api/tools/{id}/ratings
{
  "rating": 5,
  "review": "Excellent!"
}

# Update rating
PUT /api/ratings/{id}

# Delete rating
DELETE /api/ratings/{id}
```

### Favorites
```bash
# Get favorites
GET /api/favorites

# Add to favorites
POST /api/tools/{id}/favorite

# Remove from favorites
DELETE /api/tools/{id}/favorite
```

### Notifications
```bash
# Get notifications
GET /api/notifications

# Mark as read
PUT /api/notifications/{id}/read

# Mark all as read
PUT /api/notifications/read-all

# Get preferences
GET /api/notifications/preferences

# Update preferences
PUT /api/notifications/preferences
```

### Analytics
```bash
# Get dashboard
GET /api/analytics/dashboard

# Get trending tools
GET /api/analytics/trending

# Get top tools
GET /api/analytics/top-tools

# Get engagement metrics
GET /api/analytics/engagement
```

### Admin
```bash
# Get users
GET /api/admin/users

# Get moderation queue
GET /api/admin/moderation/queue

# Get statistics
GET /api/admin/statistics

# Approve tool
POST /api/admin/tools/{id}/approve

# Suspend user
POST /api/admin/users/{id}/suspend
```

---

## 🗄️ Database Schema Overview

### Core Tables
- `users` - User accounts
- `tools` - Tool listings
- `categories` - Tool categories
- `tags` - Tool tags
- `comments` - Tool comments
- `ratings` - Tool ratings
- `favorites` - User favorites

### Phase 7 Tables
- `search_histories` - Search history
- `notifications` - User notifications
- `user_preferences` - User settings
- `analytics_page_views` - Page tracking
- `analytics_activities` - Activity tracking
- `analytics_daily_metrics` - Daily stats
- `content_reports` - Moderation reports
- `moderation_actions` - Mod actions

---

## 🧪 Testing

### Run Tests
```bash
# All tests
php artisan test

# Specific test
php artisan test tests/Feature/ToolTest.php

# With coverage
php artisan test --coverage

# Watch mode
php artisan test --watch
```

### Load Testing
```bash
# Load test
.\scripts\load-test.ps1 -Concurrent 10 -Requests 100

# Results in load-test-results.json
```

### Query Analysis
```bash
# Analyze queries
php artisan scan:queries

# Show SQL
php artisan scan:queries --dump-sql

# Slow queries
php artisan scan:queries --slow=50
```

---

## ⚙️ Configuration

### Environment Variables
```
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vibecoding
DB_USERNAME=root
DB_PASSWORD=password

# Cache
CACHE_STORE=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Queue
QUEUE_CONNECTION=database

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=465

# App
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com
```

### Cache Configuration
```php
// Backend caches (php artisan cache:clear)
- Categories: 1 hour
- Tags: 1 hour
- Roles: 1 hour
- User permissions: 15 minutes
- Search results: 5 minutes

// Frontend caches (in browser)
- Static assets: 1 year
- API responses: 5 minutes
```

---

## 🔐 Security

### CORS Configuration
```php
CORS_ALLOWED_ORIGINS=https://example.com,https://app.example.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization
```

### Rate Limiting
- Authentication endpoints: 5 requests/minute
- API endpoints: 60 requests/minute
- Search: 30 requests/minute

### Authentication
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Logout: `POST /api/auth/logout`
- Refresh: `POST /api/auth/refresh`

---

## 📈 Performance Tips

### Backend
```php
// Use eager loading
$tools = Tool::withOptimizedRelations()->get();

// Use caching
$service = app(AdvancedCacheService::class);
$categories = $service->remember('categories', 'static_lists', fn() => Category::all());

// Use pagination
$tools = Tool::paginate(20);
```

### Frontend
```typescript
// Use React Query for caching
const { data: tools } = useQuery(['tools'], fetchTools);

// Debounce search
const debouncedSearch = debounce(performSearch, 300);

// Monitor performance
initPerformanceMonitoring();
```

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check MySQL is running
docker-compose ps | grep mysql

# Check credentials
cat .env | grep DB_

# Verify connection
php artisan tinker
DB::connection()->getPdo();
```

### Cache Not Working
```bash
# Clear cache
php artisan cache:clear

# Check Redis
redis-cli ping  # Should return PONG

# Warm cache
php artisan cache:warm
```

### Tests Failing
```bash
# Refresh database
php artisan migrate:fresh --seed

# Run specific test
php artisan test tests/Feature/ToolTest.php --verbose

# Check logs
tail -f storage/logs/laravel.log
```

### API Errors
```bash
# Check API logs
tail -f storage/logs/laravel.log

# Verify routes
php artisan route:list

# Test endpoint
curl -X GET http://localhost:8201/api/tools \
  -H "Accept: application/json" \
  -H "Authorization: Bearer TOKEN"
```

---

## 📚 Documentation

### Key Documents
- **README.md** - Project overview
- **ARCHITECTURE.md** - System design
- **API_REFERENCE_COMPLETE.md** - API endpoints
- **DEPLOYMENT_GUIDE.md** - Deployment process
- **BEST_PRACTICES_2025.md** - Coding standards
- **DB_PERFORMANCE_REPORT.md** - Query optimization
- **PHASE_7_7_PERFORMANCE_OPTIMIZATION.md** - Performance

### Feature Documentation
- **PHASE_7_1_SEARCH_COMPLETE.md** - Search feature
- **PHASE_7_2_NOTIFICATIONS_COMPLETE.md** - Notifications
- **PHASE_7_3_PREFERENCES_COMPLETE.md** - User preferences
- **PHASE_7_4_ANALYTICS_COMPLETE.md** - Analytics
- **PHASE_7_5_MODERATION_COMPLETE.md** - Moderation

---

## 🚀 Deployment

### Staging
```bash
# Deploy to staging
git push origin main

# Run tests
php artisan test

# Verify API
curl https://staging-api.example.com/health
```

### Production
```bash
# Set maintenance mode
php artisan down

# Deploy code
git pull origin main

# Run migrations
php artisan migrate --force

# Build frontend
npm run build

# Exit maintenance mode
php artisan up

# Verify
curl https://api.example.com/health
```

---

## 📞 Support

### Getting Help
1. Check documentation
2. Search GitHub issues
3. Check logs: `storage/logs/laravel.log`
4. Run tests: `php artisan test`
5. Check API health: `GET /api/health`

### Reporting Issues
Include:
- Error message/log
- Steps to reproduce
- Expected vs actual result
- Environment (Laravel version, PHP version, etc.)

---

## 📊 Useful Commands

```bash
# Database
php artisan migrate              # Run migrations
php artisan migrate:rollback     # Rollback migrations
php artisan migrate:refresh      # Refresh database
php artisan seed:refresh         # Re-seed database
php artisan tinker              # Interactive shell

# Cache
php artisan cache:clear         # Clear all caches
php artisan cache:warm          # Warm caches
php artisan config:cache        # Cache configuration

# Routes
php artisan route:list          # List all routes
php artisan route:cache         # Cache routes

# Testing
php artisan test                # Run tests
php artisan test --coverage     # With coverage report

# Analytics
php artisan scan:queries        # Analyze queries
php artisan scan:queries --dump-sql

# Health Check
php artisan health:check        # System health
curl http://localhost:8201/health

# Monitoring
tail -f storage/logs/laravel.log # View logs
php artisan tinker              # Debug
```

---

**Version**: 1.0  
**Last Updated**: December 20, 2025  
**Status**: ✅ Production Ready
