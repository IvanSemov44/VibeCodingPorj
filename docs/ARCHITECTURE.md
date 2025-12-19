# VibeCoding Architecture Documentation

**Version**: 1.0.0  
**Date**: December 20, 2025  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Design](#database-design)
4. [API Architecture](#api-architecture)
5. [Service Layer](#service-layer)
6. [Frontend Architecture](#frontend-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Caching Strategy](#caching-strategy)
9. [Monitoring & Logging](#monitoring--logging)
10. [Security Architecture](#security-architecture)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌──────────────────────┐  ┌─────────────────────────────┐  │
│  │  Web Browser         │  │  Mobile/Desktop Client      │  │
│  │  (Next.js Frontend)  │  │  (HTTP REST)                │  │
│  └──────────────────────┘  └─────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │     Nginx Load Balancer            │
        │     (HTTPS, Rate Limiting)         │
        └────────┬─────────────────────────┬─┘
                 │                         │
        ┌────────▼────────┐      ┌─────────▼────────┐
        │  API Gateway    │      │  Frontend Server │
        │  (Laravel API)  │      │  (Next.js)       │
        └────────┬────────┘      └──────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌──────────┐
│ MySQL  │  │ Redis  │  │ Message  │
│ Database│  │ Cache  │  │ Queue    │
└────────┘  └────────┘  └──────────┘
```

### Components

**Frontend Layer**:
- Next.js 15 React application
- Server-side rendering
- Client-side state management
- Real-time updates via WebSocket

**API Layer**:
- Laravel 12 REST API
- Sanctum authentication
- Rate limiting & throttling
- Request/response validation

**Service Layer**:
- Business logic
- Data processing
- Integration logic
- Caching layer

**Data Layer**:
- MySQL database
- Redis cache
- Message queue

---

## Technology Stack

### Backend
```
├─ Framework: Laravel 12.23.1
├─ Language: PHP 8.2+
├─ ORM: Eloquent
├─ Authentication: Sanctum
├─ Validation: Laravel Validation
├─ Testing: PHPUnit/Pest
└─ Package Manager: Composer
```

### Frontend
```
├─ Framework: Next.js 15
├─ Language: TypeScript
├─ Styling: Tailwind CSS
├─ State: React Hooks/Context
├─ HTTP: Axios
├─ Testing: Jest/Vitest
└─ Package Manager: npm
```

### Infrastructure
```
├─ Database: MySQL 8.0+
├─ Cache: Redis
├─ Queue: Database/Redis
├─ Web Server: Nginx
├─ Runtime: PHP-FPM
├─ Containerization: Docker
└─ Orchestration: Docker Compose
```

---

## Database Design

### Core Tables

**users**:
- id, name, email, password_hash
- avatar_url, bio, location
- created_at, updated_at, deleted_at

**categories**:
- id, name, description, slug
- icon_url, parent_id (hierarchical)
- created_at, updated_at

**tools**:
- id, name, description, url
- category_id, user_id (creator)
- rating, view_count, favorite_count
- created_at, updated_at, deleted_at

**tool_comments**:
- id, tool_id, user_id
- content, likes_count
- created_at, updated_at, deleted_at

**tool_ratings**:
- id, tool_id, user_id
- rating (1-5), review
- created_at, updated_at

**favorites**:
- id, user_id, tool_id
- created_at

### Phase 7 Feature Tables

**search_histories**:
- id, user_id, query, results_count, created_at

**notifications**:
- id, user_id, type, title, message, read_at, created_at

**user_preferences**:
- id, user_id (unique)
- 24+ preference columns (notifications, theme, language, etc.)

**analytics_page_views**:
- id, user_id, tool_id, page_path, response_time_ms, created_at

**analytics_user_activities**:
- id, user_id, activity_type, tool_id, activity_data (JSON)

**analytics_trending**:
- id, tool_id, view_count, comment_count, rating_count, trend_score, period, date

**analytics_category_stats**, **analytics_user_stats**: Aggregated statistics

**content_reports**:
- id, user_id (reporter), reported_user_id, reportable_type/id
- reason, description, status

**moderation_actions**:
- id, moderator_id, report_id, user_id (target)
- action, reason, duration_days (for suspension)

**user_moderation_status**:
- id, user_id (unique)
- is_suspended, is_banned, suspension_ends_at, warning_count

### Relationships

```
User
├─ hasMany Tools
├─ hasMany Comments
├─ hasMany Ratings
├─ hasMany Favorites
├─ hasMany Notifications
├─ hasOne UserPreference
├─ hasOne UserModerationStatus
├─ hasMany ContentReports (created)
├─ hasMany ModerationActions (taken)
└─ hasMany SearchHistories

Tool
├─ belongsTo Category
├─ belongsTo User (creator)
├─ hasMany Comments
├─ hasMany Ratings
├─ hasMany Favorites
├─ morphMany ContentReports
└─ hasMany AnalyticsPageViews

Category
├─ hasMany Tools
└─ hasMany AnalyticsCategoryStats
```

---

## API Architecture

### Request/Response Cycle

```
Client Request
    ↓
Nginx (rate limiting, SSL)
    ↓
Laravel Router
    ↓
Middleware Stack:
  ├─ API Guard (Sanctum)
  ├─ Authorization (Policies)
  ├─ Request Validation
  └─ CORS
    ↓
Controller Action
    ↓
Service Layer
    ↓
Model/Repository
    ↓
Database Query
    ↓
Cache Check
    ↓
Response (JSON)
    ↓
Nginx (compression)
    ↓
Client
```

### API Routes Structure

```
/api/
├─ /auth/
│  ├─ POST /login
│  ├─ POST /register
│  ├─ POST /logout
│  └─ POST /refresh
├─ /tools/
│  ├─ GET / (list)
│  ├─ POST / (create)
│  ├─ GET /{id}
│  ├─ PUT /{id}
│  ├─ DELETE /{id}
│  ├─ /search
│  ├─ /search/advanced
│  ├─ /{id}/comments
│  ├─ /{id}/ratings
│  └─ /{id}/favorites
├─ /categories/
│  ├─ GET /
│  ├─ GET /{id}
│  └─ GET /{id}/tools
├─ /notifications/
│  ├─ GET /
│  ├─ GET /count
│  └─ PUT /{id}
├─ /settings/
│  ├─ GET /
│  └─ PUT /
└─ /admin/
   ├─ /analytics/*
   ├─ /moderation/*
   └─ /users/*
```

---

## Service Layer

### Service Architecture

```
Controller
    ↓
Service Interface
    ↓
Service Implementation
    ├─ Data Validation
    ├─ Business Logic
    ├─ Cache Management
    ├─ Event Dispatching
    └─ Queue Jobs
    ↓
Repository Pattern
    ↓
Eloquent Models
    ↓
Database
```

### Key Services

**ToolService**:
- Create, read, update, delete tools
- Calculate ratings and aggregates
- Manage relationships

**SearchService**:
- Full-text search
- Advanced filtering
- Result pagination
- History tracking

**NotificationService**:
- Send notifications
- Mark as read
- User preferences

**AnalyticsService**:
- Record page views and activities
- Generate reports
- Calculate metrics
- Trending algorithms

**ModerationService**:
- Report management
- Decision making
- User actions
- Appeal processing

---

## Frontend Architecture

### Next.js App Structure

```
frontend/
├─ app/
│  ├─ layout.tsx (root layout)
│  ├─ page.tsx (home)
│  ├─ tools/
│  │  ├─ page.tsx (list)
│  │  └─ [id]/page.tsx (detail)
│  ├─ search/
│  │  └─ page.tsx
│  ├─ profile/
│  │  └─ page.tsx
│  └─ admin/
│     ├─ analytics/
│     ├─ moderation/
│     └─ users/
├─ components/
│  ├─ layout/
│  │  ├─ Header.tsx
│  │  ├─ Sidebar.tsx
│  │  └─ Footer.tsx
│  ├─ tools/
│  │  ├─ ToolCard.tsx
│  │  ├─ ToolList.tsx
│  │  └─ ToolDetail.tsx
│  ├─ search/
│  │  ├─ SearchBar.tsx
│  │  └─ SearchFilters.tsx
│  └─ common/
│     ├─ Button.tsx
│     ├─ Modal.tsx
│     └─ Loading.tsx
├─ hooks/
│  ├─ useTools.ts
│  ├─ useSearch.ts
│  ├─ useAuth.ts
│  └─ useNotifications.ts
├─ lib/
│  ├─ api.ts (API client)
│  ├─ auth.ts (auth utilities)
│  └─ utils.ts (helpers)
└─ styles/
   └─ globals.css (Tailwind)
```

### State Management

**React Context**:
- Authentication state
- User preferences
- Notifications
- UI state

**Local State**:
- Form inputs
- Component visibility
- Loading states

**Server State**:
- Tool list (via React Query)
- Comments (via React Query)
- Ratings (via React Query)

---

## Authentication & Authorization

### Authentication Flow

```
1. User enters credentials
   ↓
2. POST /api/login
   ↓
3. Verify credentials against database
   ↓
4. Generate Sanctum token
   ↓
5. Return token + user data
   ↓
6. Client stores token in secure HTTP-only cookie
   ↓
7. Subsequent requests include token in Authorization header
```

### Authorization Levels

```
Anonymous User
  └─ View tools, categories
  └─ Search
  
Authenticated User
  ├─ Create/edit own tools
  ├─ Comment on tools
  ├─ Rate tools
  ├─ Create favorites
  ├─ Report content
  └─ Modify own preferences
  
Moderator
  ├─ View reports
  ├─ Review content
  ├─ Make moderation decisions
  ├─ Remove/hide content
  └─ Manage appeals
  
Admin
  ├─ All moderator capabilities
  ├─ Manage users
  ├─ View analytics
  ├─ Modify system settings
  └─ View audit logs
```

### Token Management

- **Type**: Bearer token (Sanctum)
- **Storage**: HTTP-only cookie + localStorage
- **Expiration**: 24 hours
- **Refresh**: Automatic via refresh endpoint
- **Revocation**: Token deleted from database

---

## Caching Strategy

### Cache Levels

```
Level 1: HTTP Cache (Browser)
  ├─ Static assets (1 year)
  ├─ API responses (5 minutes)
  └─ Conditional requests (ETag)

Level 2: CDN Cache
  ├─ Images
  ├─ CSS/JavaScript
  └─ API responses

Level 3: Application Cache (Redis)
  ├─ User sessions
  ├─ Tool details (30 minutes)
  ├─ Category list (1 hour)
  ├─ Rating aggregates (1 hour)
  ├─ Search results (5 minutes)
  └─ User preferences (1 hour)

Level 4: Query Cache (Database)
  └─ Indexed columns
  └─ Query result sets
```

### Cache Invalidation

```
Tool Updated
  ↓
Invalidate:
  ├─ Tool detail cache
  ├─ Category rating aggregate
  ├─ Trending cache
  ├─ Search results (partial)
  └─ User activity cache
```

---

## Monitoring & Logging

### Application Monitoring

```
Metrics Collection
  ├─ Request/response times
  ├─ Error rates
  ├─ Cache hit rates
  ├─ Database query times
  ├─ Active connections
  └─ Memory usage

Storage
  ├─ Application logs (storage/logs/)
  ├─ Database logs
  ├─ Nginx access logs
  └─ Error tracking (Sentry)

Visualization
  ├─ Dashboard (custom or Grafana)
  ├─ Alerts (email/Slack)
  └─ Reports (daily/weekly)
```

### Logging Strategy

```
Level: DEBUG
  → Detailed information (development)
  → Cache operations
  → Database queries

Level: INFO
  → General information
  → User actions
  → API requests

Level: WARNING
  → Potential issues
  → Rate limiting
  → Cache misses

Level: ERROR
  → Exceptions
  → Failed operations
  → Validation errors

Level: CRITICAL
  → System failures
  → Database unavailable
  → Authentication failures
```

---

## Security Architecture

### HTTPS/TLS

```
Client
  ↓ (HTTPS only)
Nginx (SSL termination)
  ├─ TLS 1.3
  ├─ Strong ciphers
  ├─ Perfect forward secrecy
  └─ HSTS header
  ↓
PHP-FPM (HTTP)
```

### Input Validation

```
Request
  ↓
Middleware Validation
  ├─ CSRF token check
  ├─ Content-Type validation
  └─ Request size limit
  ↓
Controller Validation
  ├─ Type checking
  ├─ Range validation
  └─ Format validation
  ↓
Service Layer Validation
  ├─ Business logic
  ├─ Duplicate checking
  └─ Authorization
```

### Database Security

```
├─ Parameterized queries (no SQL injection)
├─ Minimal privileges (role-based)
├─ Encrypted passwords (bcrypt)
├─ Encrypted sensitive data (AES-256)
├─ Access logging
└─ Regular backups
```

### API Security

```
├─ Rate limiting (60 requests/minute)
├─ CORS validation
├─ CSRF protection
├─ Authorization checks
├─ Input sanitization
├─ Response headers (security)
└─ DDoS protection
```

### File Security

```
├─ Uploaded files scanned
├─ Stored outside webroot
├─ Proper MIME types
├─ Access control lists
├─ Regular backups
└─ Encryption at rest
```

---

## Performance Optimization

### Backend

- Database indexing on key columns
- Query optimization (N+1 prevention)
- Caching strategy at multiple levels
- Asynchronous job processing
- Connection pooling
- Gzip compression

### Frontend

- Code splitting
- Image optimization
- CSS/JavaScript minification
- Lazy loading
- Service workers
- Critical CSS inline

### Infrastructure

- Load balancing
- CDN for static assets
- Database replication
- Redis clustering
- Horizontal scaling
- Auto-scaling policies

---

## Disaster Recovery

### Backup Strategy

```
Backup Frequency: Daily
  ├─ Database: Full + incremental
  ├─ Files: Incremental
  └─ Configuration: Full

Retention Policy:
  ├─ Daily: 7 days
  ├─ Weekly: 4 weeks
  ├─ Monthly: 12 months
  └─ Yearly: Permanent archive

Storage:
  ├─ Local: Near real-time
  ├─ Regional: 24 hours
  └─ Off-site: 7 days
```

### Recovery Procedures

```
Database Corruption
  → Restore from latest backup
  → Verify data integrity
  → Sync read replicas

Data Loss
  → Restore from backup
  → Replay transaction logs
  → Verify user data

Service Failure
  → Failover to backup server
  → Update DNS records
  → Verify functionality
```

---

## Scalability

### Horizontal Scaling

```
Current Architecture:
  ├─ Single API server
  ├─ Single database
  └─ Single cache server

Scalable Architecture:
  ├─ Load-balanced API servers (N)
  ├─ Database primary + replicas
  ├─ Redis cluster
  ├─ Separate queue server
  └─ CDN for static assets
```

### Database Scaling

```
Read Scaling:
  ├─ Read replicas for SELECT queries
  ├─ Cache layer for frequent queries
  └─ Analytics on separate instance

Write Scaling:
  ├─ Write to primary only
  ├─ Connection pooling
  └─ Batch operations
```

---

**Last Updated**: December 20, 2025
