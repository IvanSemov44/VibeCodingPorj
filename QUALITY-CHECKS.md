# Quality Check Scripts

Comprehensive quality check scripts that run all code quality tools (typecheck, prettier, lint, tests) together instead of running them individually.

## 🚀 Quick Start

### Run All Checks (Frontend + Backend)

From the **root directory**:

```bash
npm run check
```

This will run all quality checks for both frontend and backend in sequence.

---

## 📋 Available Scripts

### Root Level Commands

| Command | Description |
|---------|-------------|
| `npm run check` | Run ALL quality checks (frontend + backend) |
| `npm run check:frontend` | Run only frontend checks |
| `npm run check:backend` | Run only backend checks |

### Frontend Commands

From **root directory**:
```bash
npm run check:frontend
```

From **frontend directory**:
```bash
npm run check        # typecheck + prettier + lint + tests
npm run check:all    # typecheck + prettier + lint + tests + build
```

**What it runs:**
1. ✅ TypeScript type checking (`tsc --noEmit`)
2. ✅ Prettier format check (`prettier --check .`)
3. ✅ ESLint
4. ✅ Vitest tests

### Backend Commands

From **root directory**:
```bash
npm run check:backend
```

From **backend directory**:
```bash
composer run check        # lint:test + analyse + tests
composer run check:fix    # lint (with fixes) + analyse + tests
```

**What it runs:**
1. ✅ Laravel Pint (code style check)
2. ✅ PHPStan (static analysis)
3. ✅ Pest/PHPUnit tests

---

## 📊 Understanding the Output

### ✓ Success Output

```
=======================================================================
✓ 1. TypeScript Type Check - PASSED
✓ 2. Prettier Format Check - PASSED
✓ 3. ESLint - PASSED
✓ 4. Tests (Vitest) - PASSED
✓ 5. Laravel Pint (Code Style) - PASSED
✓ 6. PHPStan (Static Analysis) - PASSED
✓ 7. Tests (Pest/PHPUnit) - PASSED

📊 QUALITY CHECK SUMMARY
Total: 7 checks
Passed: 7
Failed: 0
Duration: 48.23s

✅ All quality checks PASSED!
```

### ✗ Failure Output

```
✗ 2. Prettier Format Check - FAILED

📊 QUALITY CHECK SUMMARY
Total: 7 checks
Passed: 6
Failed: 1

❌ Quality checks FAILED. Please fix the issues above.
```

---

## 🛠️ Individual Check Commands

If you need to run individual checks:

### Frontend

```bash
cd frontend

# TypeScript type checking
npm run typecheck

# Prettier (code formatting)
npm run format:check  # Check formatting
npm run format        # Auto-fix formatting

# Linting
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues

# Tests
npm run test          # Watch mode
npm run test:ci       # Run once
npm run test:coverage # With coverage

# Build
npm run build
```

### Backend

```bash
cd backend

# Code style
composer run lint          # Fix code style
composer run lint:test     # Check code style (no fixes)

# Static analysis
composer run analyse

# Tests
composer run test

# All quality checks (lint + analyse, no tests)
composer run quality
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Quality Checks

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'

      - name: Install Dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && composer install --no-interaction

      - name: Run Quality Checks
        run: npm run check
```

---

## 💡 Best Practices

### 1. Before Committing
```bash
# Run all checks
npm run check
```

### 2. Pre-commit Hook

Already configured in the project with `husky` and `lint-staged`:
- Automatically runs ESLint + Prettier on staged `.ts` and `.tsx` files

### 3. Before Pull Requests

```bash
# Run full check including build
cd frontend && npm run check:all
cd ../backend && composer run check
```

### 4. Quick Fixes

If formatting or linting fails:
```bash
# Frontend - Fix formatting
cd frontend && npm run format

# Frontend - Fix linting
cd frontend && npm run lint:fix

# Backend - Fix code style
cd backend && composer run lint
```

---

## 🐛 Troubleshooting

### Issue: TypeScript Errors

```bash
cd frontend
npm run typecheck
```

Fix the reported type errors in your code.

### Issue: Prettier Format Errors

```bash
cd frontend
npm run format  # Auto-fix formatting
```

### Issue: ESLint Errors

```bash
cd frontend
npm run lint:fix  # Auto-fix what can be fixed
npm run lint      # Check remaining issues
```

### Issue: Test Failures

```bash
# Frontend
cd frontend
npm run test:watch  # Interactive mode to debug

# Backend
cd backend
composer run test
```

### Issue: Backend Script Not Working

If you're using Docker:

```bash
cd backend
docker compose exec php_fpm composer run check
```

---

## 📝 What Each Tool Does

### Frontend

| Tool | Purpose | Config File |
|------|---------|-------------|
| **TypeScript** | Type checking | `tsconfig.json` |
| **ESLint** | Code quality & style | `eslint.config.mjs` |
| **Vitest** | Unit testing | `vitest.config.ts` |
| **Prettier** | Code formatting | `.prettierrc` |

### Backend

| Tool | Purpose | Config File |
|------|---------|-------------|
| **Pint** | Code style (PSR-12) | `pint.json` |
| **PHPStan** | Static analysis | `phpstan.neon` |
| **Pest/PHPUnit** | Testing | `phpunit.xml` |

---

## 🎯 When to Use Which Command

| Scenario | Command |
|----------|---------|
| Before committing | `npm run check` |
| Quick frontend check | `npm run check:frontend` |
| Quick backend check | `npm run check:backend` |
| Fix formatting | `cd frontend && npm run format` |
| Fix code style issues | `cd frontend && npm run lint:fix`<br>`cd backend && composer run lint` |
| Debug failing tests | `cd frontend && npm run test:watch` |
| Pre-deployment check | `cd frontend && npm run check:all` |
| CI/CD pipeline | `npm run check` |

---

## ⚡ Performance Tips

### 1. Run Checks in Parallel (Advanced)

If you want faster execution, you can run frontend and backend checks in parallel:

```bash
npm install -g concurrently

concurrently "npm run check:frontend" "npm run check:backend"
```

### 2. Skip Tests for Quick Check

**Frontend:**
```bash
npm run typecheck && npm run format:check && npm run lint
```

**Backend:**
```bash
composer run quality
```

### 3. Cache Dependencies in CI

Use cache actions in your CI/CD to speed up dependency installation.

---

## 🔗 Related Documentation

- [UNUSED-CODE-ANALYZER.md](./UNUSED-CODE-ANALYZER.md) - Find unused code and files
- Frontend Testing: `frontend/tests/README.md` (if exists)
- Backend Testing: `backend/tests/README.md` (if exists)

---

## 📦 Summary of Commands

```bash
# Quality Checks
npm run check              # All checks (recommended)
npm run check:frontend     # Frontend only
npm run check:backend      # Backend only

# Find Unused Code
npm run find:unused        # All projects
npm run find:frontend      # Frontend only
npm run find:backend       # Backend only
```

---

Happy coding! 🎉
