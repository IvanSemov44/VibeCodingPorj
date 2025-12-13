# Backend Testing Plan

## Goal
Build a maintainable, fast, and reliable test suite for the Laravel backend covering unit, integration, and feature tests. Prioritize Services, Policies, and FormRequest validation, then expand to full HTTP flows, jobs, and external integrations.

## Strategy Overview
- Follow the Test Pyramid: Unit -> Integration -> Feature (E2E last)
- Keep tests deterministic and fast; use in-memory SQLite for most tests
- Use factories and seeders for predictable data
- Fake external services (email, Telegram, HTTP) in unit tests
- Enforce tests in CI with coverage gates

## Directory Structure
- tests/
  - Unit/
    - Services/
    - Policies/
    - Requests/
    - Resources/
  - Feature/
    - Api/
    - Admin/
  - Helpers/

## Priority Tasks (implementation order)
1. Policy unit tests
   - `tests/Unit/Policies/ToolPolicyTest.php`
   - `tests/Unit/Policies/UserPolicyTest.php`
2. FormRequest validation tests
   - `tests/Unit/Requests/StoreToolRequestTest.php`
   - Additional requests
3. Service unit tests (complete)
   - `AuthServiceTest`, `ToolServiceTest` (already present)
4. Resource/Transformer tests
   - `ToolResourceTest`, `UserResourceTest`
5. Feature/API tests
   - Auth, Tools, 2FA, Admin
   - Rate-limit assertions
6. Jobs & Notifications
   - `SendTwoFactorCode` and `CleanupActivityLogs` with `Notification::fake()` and `Bus::fake()`
7. External integrations & webhooks
   - Mock Telegram, mailers, and webhook payloads
8. CI Integration
   - Run migrations, minimal seeding, run tests, collect coverage

## Test Patterns & Best Practices
- Use `RefreshDatabase` for isolation
- Use `Factory::make()` for unit tests that don't need DB persistence
- Use `Factory::create()` for integration and feature tests
- Freeze time with `Carbon::setTestNow()` for time-based assertions
- Use `Bus::fake()`, `Notification::fake()` for jobs/notifications
- Guard audit logging with schema checks to avoid missing-table failures in tests

## CI Commands
```bash
# Example pipeline commands
docker compose up -d php_fpm mysql redis
docker compose exec php_fpm composer install --no-interaction --prefer-dist
docker compose exec php_fpm php artisan migrate --force
docker compose exec php_fpm php artisan test --coverage
```

## Quality Gates
- Minimum coverage: 80% (raise to 90% for critical services)
- Block PR merge if Feature tests fail
- Run `vendor/bin/pint --test` as part of pipeline

## Metrics
- Track test runtime and flakiness; aim for sub-1 minute unit suite locally
- Maintain coverage report artifacts in CI for PRs

## Next Steps
1. Implement policy tests (this commit)
2. Add FormRequest tests
3. Add resource tests
4. Integrate tests into CI pipeline


