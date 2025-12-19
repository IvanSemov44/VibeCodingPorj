# VibeCoding API Documentation - Complete Reference

**Version**: 1.0.0  
**Date**: December 20, 2025  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Tools API](#tools-api)
3. [Categories API](#categories-api)
4. [Comments API](#comments-api)
5. [Ratings API](#ratings-api)
6. [Favorites API](#favorites-api)
7. [Search API](#search-api)
8. [Notifications API](#notifications-api)
9. [User Preferences API](#user-preferences-api)
10. [Analytics API](#analytics-api)
11. [Moderation API](#moderation-api)
12. [Error Handling](#error-handling)

---

## Authentication

All endpoints require authentication via Bearer token (Sanctum).

```bash
Authorization: Bearer {access_token}
```

**Get Token**:
```bash
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

---

## Tools API

### List Tools
```bash
GET /api/tools
Query Parameters:
  - page (int): Page number (default: 1)
  - per_page (int): Items per page (default: 15)
  - sort_by (string): 'name', 'rating', 'views', 'created_at' (default: 'name')
  - sort_order (string): 'asc', 'desc' (default: 'asc')

Headers:
  Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Laravel Debugbar",
      "description": "Debug bar for Laravel",
      "url": "https://github.com/barryvdh/laravel-debugbar",
      "category_id": 1,
      "user_id": 1,
      "rating": 4.8,
      "ratings_count": 45,
      "comments_count": 12,
      "views_count": 1250,
      "is_favorite": false,
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-15T14:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 156,
    "last_page": 11
  }
}
```

### Get Single Tool
```bash
GET /api/tools/{id}

Headers:
  Authorization: Bearer {token}
```

### Create Tool
```bash
POST /api/tools
Content-Type: application/json

{
  "name": "New Tool",
  "description": "Tool description",
  "category_id": 1,
  "url": "https://example.com",
  "tags": ["development", "testing"]
}
```

**Response** (201):
```json
{
  "data": {
    "id": 157,
    "name": "New Tool",
    "description": "Tool description",
    "category_id": 1,
    "url": "https://example.com",
    "user_id": 5,
    "rating": 0,
    "ratings_count": 0,
    "comments_count": 0,
    "created_at": "2025-12-20T10:00:00Z"
  }
}
```

### Update Tool
```bash
PUT /api/tools/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "url": "https://new-url.com"
}
```

### Delete Tool
```bash
DELETE /api/tools/{id}
```

---

## Categories API

### List Categories
```bash
GET /api/categories

Query Parameters:
  - page (int): Page number (default: 1)
  - per_page (int): Items per page (default: 20)

Headers:
  Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Development",
      "description": "Development tools",
      "slug": "development",
      "tools_count": 45,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Get Category with Tools
```bash
GET /api/categories/{id}/tools

Query Parameters:
  - page (int): Page number (default: 1)
  - per_page (int): Items per page (default: 15)

Headers:
  Authorization: Bearer {token}
```

---

## Comments API

### Add Comment
```bash
POST /api/tools/{tool_id}/comments
Content-Type: application/json

{
  "content": "Great tool! Very useful for debugging."
}
```

**Response** (201):
```json
{
  "data": {
    "id": 1,
    "tool_id": 5,
    "user_id": 2,
    "user": {
      "id": 2,
      "name": "John Doe"
    },
    "content": "Great tool! Very useful for debugging.",
    "created_at": "2025-12-20T10:00:00Z"
  }
}
```

### Get Tool Comments
```bash
GET /api/tools/{tool_id}/comments

Query Parameters:
  - page (int): Page number (default: 1)
  - per_page (int): Items per page (default: 20)

Headers:
  Authorization: Bearer {token}
```

### Update Comment
```bash
PUT /api/comments/{id}
Content-Type: application/json

{
  "content": "Updated comment content"
}
```

### Delete Comment
```bash
DELETE /api/comments/{id}
```

---

## Ratings API

### Add Rating/Review
```bash
POST /api/tools/{tool_id}/ratings
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent tool with great features"
}
```

**Response** (201):
```json
{
  "data": {
    "id": 1,
    "tool_id": 5,
    "user_id": 2,
    "rating": 5,
    "review": "Excellent tool with great features",
    "created_at": "2025-12-20T10:00:00Z"
  }
}
```

### Get Tool Ratings
```bash
GET /api/tools/{tool_id}/ratings

Headers:
  Authorization: Bearer {token}
```

### Update Rating
```bash
PUT /api/ratings/{id}
Content-Type: application/json

{
  "rating": 4,
  "review": "Updated review"
}
```

### Delete Rating
```bash
DELETE /api/ratings/{id}
```

---

## Favorites API

### Add to Favorites
```bash
POST /api/tools/{tool_id}/favorites

Headers:
  Authorization: Bearer {token}
```

**Response** (201):
```json
{
  "data": {
    "tool_id": 5,
    "user_id": 2,
    "added_at": "2025-12-20T10:00:00Z"
  }
}
```

### Get User Favorites
```bash
GET /api/me/favorites

Query Parameters:
  - page (int): Page number (default: 1)
  - per_page (int): Items per page (default: 15)

Headers:
  Authorization: Bearer {token}
```

### Remove from Favorites
```bash
DELETE /api/tools/{tool_id}/favorites

Headers:
  Authorization: Bearer {token}
```

---

## Search API

### Basic Search
```bash
GET /api/tools/search

Query Parameters:
  - q (string, required): Search query
  - page (int): Page number (default: 1)
  - per_page (int): Items per page (default: 15)

Headers:
  Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": [
    {
      "id": 5,
      "name": "Laravel Debugbar",
      "description": "Debug bar for Laravel",
      "rating": 4.8
    }
  ],
  "pagination": {
    "current_page": 1,
    "total": 12
  }
}
```

### Advanced Search
```bash
GET /api/tools/search/advanced

Query Parameters:
  - q (string): Search query (optional)
  - category_id (int): Filter by category
  - min_rating (float): Minimum rating (0-5)
  - max_rating (float): Maximum rating (0-5)
  - tags (string): Comma-separated tags
  - sort_by (string): 'name', 'rating', 'views', 'created_at'
  - sort_order (string): 'asc', 'desc'

Headers:
  Authorization: Bearer {token}
```

### Search Suggestions
```bash
GET /api/tools/search/suggestions

Query Parameters:
  - q (string, required): Partial query for suggestions
  - limit (int): Max suggestions (default: 10)

Headers:
  Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": [
    "Laravel",
    "Laravel Debugbar",
    "Laravel IDE Helper"
  ]
}
```

---

## Notifications API

### List Notifications
```bash
GET /api/notifications

Query Parameters:
  - page (int): Page number (default: 1)
  - per_page (int): Items per page (default: 20)
  - unread_only (bool): Only unread notifications

Headers:
  Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "type": "tool_created",
      "title": "New tool added",
      "message": "A new tool has been added to your favorite category",
      "read_at": null,
      "created_at": "2025-12-20T10:00:00Z"
    }
  ]
}
```

### Get Unread Count
```bash
GET /api/notifications/count

Headers:
  Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": {
    "unread_count": 3
  }
}
```

### Mark as Read
```bash
PUT /api/notifications/{id}
Content-Type: application/json

{
  "read": true
}
```

### Mark All as Read
```bash
POST /api/notifications/mark-all-read

Headers:
  Authorization: Bearer {token}
```

---

## User Preferences API

### Get All Preferences
```bash
GET /api/settings

Headers:
  Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": {
    "notifications_enabled": true,
    "email_on_new_tool": false,
    "email_on_comment": true,
    "theme": "light",
    "language": "en"
  }
}
```

### Update Preference
```bash
PUT /api/settings/{key}
Content-Type: application/json

{
  "value": true
}
```

### Bulk Update Preferences
```bash
PUT /api/settings
Content-Type: application/json

{
  "notifications_enabled": true,
  "theme": "dark",
  "language": "es"
}
```

---

## Analytics API

### Get Dashboard Summary
```bash
GET /api/admin/analytics/dashboard

Query Parameters:
  - date (string): Date in YYYY-MM-DD format (optional)

Headers:
  Authorization: Bearer {admin_token}
```

**Response** (200):
```json
{
  "data": {
    "date": "2025-12-20",
    "page_views": 1250,
    "unique_users": 45,
    "average_response_time_ms": 250,
    "user_activities": 89
  }
}
```

### Get Health Metrics
```bash
GET /api/admin/analytics/health

Query Parameters:
  - date (string): Date (optional)

Headers:
  Authorization: Bearer {admin_token}
```

### Get Trending Tools
```bash
GET /api/admin/analytics/trending

Query Parameters:
  - period (string): 'hourly', 'daily', 'weekly', 'monthly' (default: 'daily')
  - limit (int): Max results (default: 10)
  - date (string): Date (optional)

Headers:
  Authorization: Bearer {admin_token}
```

### Get Top Tools
```bash
GET /api/admin/analytics/top-tools

Query Parameters:
  - limit (int): Max results (default: 10)
  - date (string): Date (optional)

Headers:
  Authorization: Bearer {admin_token}
```

---

## Moderation API

### Report Content
```bash
POST /api/admin/moderation/report
Content-Type: application/json

{
  "reportable_type": "Tool",
  "reportable_id": 5,
  "reason": "spam",
  "description": "This is spam content",
  "reported_user_id": 10
}
```

**Response** (201):
```json
{
  "data": {
    "id": 1,
    "user_id": 2,
    "reportable_type": "Tool",
    "reportable_id": 5,
    "reason": "spam",
    "status": "pending",
    "created_at": "2025-12-20T10:00:00Z"
  }
}
```

### Get Pending Reports
```bash
GET /api/admin/moderation/reports/pending

Query Parameters:
  - priority (string): 'low', 'medium', 'high', 'urgent'
  - limit (int): Max results (default: 50)

Headers:
  Authorization: Bearer {admin_token}
```

### Suspend User
```bash
POST /api/admin/moderation/users/{user_id}/suspend
Content-Type: application/json

{
  "duration_days": 7,
  "reason": "Harassment",
  "notes": "Multiple complaints"
}
```

### Ban User
```bash
POST /api/admin/moderation/users/{user_id}/ban
Content-Type: application/json

{
  "reason": "Severe violation",
  "notes": "Hate speech and harassment"
}
```

### Create Appeal
```bash
POST /api/admin/moderation/appeal/{action_id}
Content-Type: application/json

{
  "reason": "I believe the action was unfair"
}
```

---

## Error Handling

### Error Response Format
```json
{
  "message": "Error message",
  "errors": {
    "field_name": ["Error detail"]
  }
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 204 | No Content - Success, no response body |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Internal error |

### Validation Error Example
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required"],
    "rating": ["The rating must be between 0 and 5"]
  }
}
```

---

## Rate Limiting

- **Default**: 60 requests per minute per user
- **Admin**: 120 requests per minute
- **Headers**:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Pagination

Default pagination returns 15-20 items per page.

**Query Parameters**:
- `page`: Page number (starts at 1)
- `per_page`: Items per page (max 100)

**Response Structure**:
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 256,
    "last_page": 18
  }
}
```

---

## Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2025-12-20T10:30:45Z
```

---

## API Versioning

Current version: **v1.0**

Future versions will be available at:
- `/api/v2/...`
- `/api/v3/...`

---

## Support

For API issues or questions, contact: api-support@vibecoding.dev

Last Updated: December 20, 2025
