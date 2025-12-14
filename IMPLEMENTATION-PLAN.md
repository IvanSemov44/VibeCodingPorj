# Comprehensive Implementation Plan
## Modernizing Laravel Full-Stack Project (2025 Standards)

**Project:** VibeCoding Full-Stack Starter Kit
**Current State:** Laravel 11.x + Next.js with basic CRUD
**Goal:** Implement 2025 best practices systematically
**Timeline:** Phased approach over 4-6 weeks

---

## Table of Contents
1. [Current State Assessment](#current-state-assessment)
2. [Phase 1: Code Quality & Foundation](#phase-1-code-quality--foundation)
3. [Phase 2: Architecture Improvements](#phase-2-architecture-improvements)
4. [Phase 3: Performance & Optimization](#phase-3-performance--optimization)
5. [Phase 4: Testing & CI/CD](#phase-4-testing--cicd)
6. [Phase 5: Security Hardening](#phase-5-security-hardening)
7. [Phase 6: Advanced Features](#phase-6-advanced-features)
8. [Priority Matrix](#priority-matrix)
9. [Success Metrics](#success-metrics)

---

## Current State Assessment

### ✅ What's Already Good

**Infrastructure:**
- ✅ Docker setup with docker-compose
- ✅ Automatic migrations and seeding
- ✅ Multi-container setup (PHP, Nginx, MySQL, Redis)
- ✅ Health checks configured

**Backend:**
- ✅ Laravel 11.x
- ✅ Sanctum authentication
- ✅ Spatie Permissions (roles & permissions)
- ✅ API Resources for data transformation
- ✅ Database seeders (idempotent)
- ✅ Activity logging (Spatie Activity Log)

**Frontend:**
- ✅ Next.js with TypeScript
- ✅ Redux Toolkit for state management
- ✅ Tailwind CSS
- ✅ React Hook Form + Yup validation

**Database:**
- ✅ Migrations organized
- ✅ Basic relationships (tools, categories, tags)
- ✅ Some indexes in place

### 🔶 Needs Improvement

**Code Quality:**
- ⚠️ No code formatting standard (Pint not configured)
- ⚠️ No static analysis (PHPStan)
- ⚠️ Inconsistent code style

**Architecture:**
- ⚠️ Business logic in controllers (no service layer)
- ⚠️ No repository pattern for complex queries
- ⚠️ No action classes for single-purpose operations

**Testing:**
- ⚠️ Limited test coverage
- ⚠️ No feature tests for all endpoints
- ⚠️ Not using Pest (modern testing)

**Performance:**
- ⚠️ No query optimization strategy
- ⚠️ No caching implemented
- ⚠️ Potential N+1 query issues
- ⚠️ No queue jobs for slow operations

**Security:**
- ⚠️ Rate limiting not configured
- ⚠️ No API versioning
- ⚠️ CORS might need adjustment

**DevOps:**
- ⚠️ No CI/CD pipeline
- ⚠️ No automated testing on push
- ⚠️ No deployment automation

---

## Phase 1: Code Quality & Foundation
**Duration:** Week 1
**Priority:** HIGH
**Effort:** Low to Medium

### 1.1 Install & Configure Code Quality Tools

#### Laravel Pint (Code Formatter)
```bash
# Already included in Laravel 11, just configure
composer require laravel/pint --dev
```

**Create:** `pint.json`
```json
{
    "preset": "laravel",
    "rules": {
        "no_unused_imports": true,
        "not_operator_with_successor_space": true,
        "binary_operator_spaces": {
            "default": "single_space"
        },
        "blank_line_after_opening_tag": true,
        "method_chaining_indentation": true,
        "no_extra_blank_lines": {
            "tokens": [
                "extra",
                "throw",
                "use"
            ]
        },
        "no_spaces_around_offset": {
            "positions": ["inside", "outside"]
        },
        "types_spaces": {
            "space": "none"
        }
    }
}
```

**Run:**
```bash
./vendor/bin/pint
```

**Add to package.json:**
```json
{
  "scripts": {
    "format": "cd backend && ./vendor/bin/pint",
    "format:check": "cd backend && ./vendor/bin/pint --test"
  }
}
```

#### PHPStan (Static Analysis)
```bash
cd backend
composer require --dev phpstan/phpstan
composer require --dev larastan/larastan
```

**Create:** `backend/phpstan.neon`
```neon
includes:
    - ./vendor/larastan/larastan/extension.neon

parameters:
    level: 6  # Start at 6, work towards 8
    paths:
        - app
    excludePaths:
        - app/Console/Kernel.php
    checkMissingIterableValueType: false
    checkGenericClassInNonGenericObjectType: false
```

**Run:**
```bash
cd backend
./vendor/bin/phpstan analyse
```

**Add to package.json:**
```json
{
  "scripts": {
    "analyse": "cd backend && ./vendor/bin/phpstan analyse"
  }
}
```

#### IDE Helper
```bash
cd backend
composer require --dev barryvdh/laravel-ide-helper
```

**Add to package.json:**
```json
{
  "scripts": {
    "ide-helper": "cd backend && php artisan ide-helper:generate && php artisan ide-helper:models -N && php artisan ide-helper:meta"
  }
}
```

### 1.2 Add EditorConfig
**Create:** `.editorconfig`
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 4
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml,json}]
indent_size = 2

[*.{js,jsx,ts,tsx}]
indent_size = 2

[docker-compose.yml]
indent_size = 2
```

### 1.3 Update composer.json Scripts
**Edit:** `backend/composer.json`
```json
{
  "scripts": {
    "test": "pest",
    "test:coverage": "pest --coverage",
    "format": "pint",
    "format:check": "pint --test",
    "analyse": "phpstan analyse",
    "ide-helper": [
      "@php artisan ide-helper:generate",
      "@php artisan ide-helper:models -N",
      "@php artisan ide-helper:meta"
    ],
    "quality": [
      "@format",
      "@analyse",
      "@test"
    ]
  }
}
```

### 1.4 Deliverables
- ✅ Pint configured and all code formatted
- ✅ PHPStan analyzing at level 6+
- ✅ IDE Helper generating autocompletion
- ✅ EditorConfig for consistent formatting
- ✅ All scripts in composer.json

---

## Phase 2: Architecture Improvements
**Duration:** Week 2-3
**Priority:** HIGH
**Effort:** Medium to High

### 2.1 Implement Service Layer

**Goal:** Move business logic from controllers to service classes

#### Create Base Service
**Create:** `app/Services/BaseService.php`
```php
<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\DB;

abstract class BaseService
{
    protected function transaction(callable $callback): mixed
    {
        return DB::transaction($callback);
    }
}
```

#### Example: Tool Service
**Create:** `app/Services/ToolService.php`
```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Tool;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ToolService extends BaseService
{
    public function getAllPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return Tool::with(['categories', 'tags', 'roles'])
            ->latest()
            ->paginate($perPage);
    }

    public function getFiltered(array $filters): Collection
    {
        return Tool::query()
            ->when($filters['category_id'] ?? null, fn($q, $id) =>
                $q->whereHas('categories', fn($q) => $q->where('id', $id))
            )
            ->when($filters['tag_id'] ?? null, fn($q, $id) =>
                $q->whereHas('tags', fn($q) => $q->where('id', $id))
            )
            ->when($filters['search'] ?? null, fn($q, $search) =>
                $q->where(fn($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                )
            )
            ->with(['categories', 'tags'])
            ->get();
    }

    public function create(array $data): Tool
    {
        return $this->transaction(function () use ($data) {
            $tool = Tool::create([
                'name' => $data['name'],
                'url' => $data['url'],
                'docs_url' => $data['docs_url'] ?? null,
                'description' => $data['description'],
                'usage' => $data['usage'] ?? null,
                'screenshots' => $data['screenshots'] ?? [],
            ]);

            if (isset($data['categories'])) {
                $tool->categories()->sync($data['categories']);
            }

            if (isset($data['tags'])) {
                $tool->tags()->sync($data['tags']);
            }

            if (isset($data['roles'])) {
                $tool->roles()->sync($data['roles']);
            }

            return $tool->fresh(['categories', 'tags', 'roles']);
        });
    }

    public function update(Tool $tool, array $data): Tool
    {
        return $this->transaction(function () use ($tool, $data) {
            $tool->update([
                'name' => $data['name'] ?? $tool->name,
                'url' => $data['url'] ?? $tool->url,
                'docs_url' => $data['docs_url'] ?? $tool->docs_url,
                'description' => $data['description'] ?? $tool->description,
                'usage' => $data['usage'] ?? $tool->usage,
                'screenshots' => $data['screenshots'] ?? $tool->screenshots,
            ]);

            if (isset($data['categories'])) {
                $tool->categories()->sync($data['categories']);
            }

            if (isset($data['tags'])) {
                $tool->tags()->sync($data['tags']);
            }

            if (isset($data['roles'])) {
                $tool->roles()->sync($data['roles']);
            }

            return $tool->fresh(['categories', 'tags', 'roles']);
        });
    }

    public function delete(Tool $tool): bool
    {
        return $this->transaction(function () use ($tool) {
            $tool->categories()->detach();
            $tool->tags()->detach();
            $tool->roles()->detach();

            return $tool->delete();
        });
    }
}
```

#### Update Controller to Use Service
**Update:** `app/Http/Controllers/ToolController.php`
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Http\Resources\ToolResource;
use App\Models\Tool;
use App\Services\ToolService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ToolController extends Controller
{
    public function __construct(
        private readonly ToolService $toolService
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $tools = $this->toolService->getAllPaginated();

        return ToolResource::collection($tools);
    }

    public function store(StoreToolRequest $request): ToolResource
    {
        $tool = $this->toolService->create($request->validated());

        return new ToolResource($tool);
    }

    public function show(Tool $tool): ToolResource
    {
        $tool->load(['categories', 'tags', 'roles']);

        return new ToolResource($tool);
    }

    public function update(UpdateToolRequest $request, Tool $tool): ToolResource
    {
        $tool = $this->toolService->update($tool, $request->validated());

        return new ToolResource($tool);
    }

    public function destroy(Tool $tool): JsonResponse
    {
        $this->toolService->delete($tool);

        return response()->json(null, 204);
    }
}
```

### 2.2 Create Action Classes

**For single-purpose operations, create Action classes**

#### Example: Import Tools Action
**Create:** `app/Actions/Tools/ImportToolsAction.php`
```php
<?php

declare(strict_types=1);

namespace App\Actions\Tools;

use App\Models\Tool;
use Illuminate\Support\Facades\DB;

class ImportToolsAction
{
    public function execute(array $toolsData): array
    {
        $imported = [];
        $errors = [];

        DB::transaction(function () use ($toolsData, &$imported, &$errors) {
            foreach ($toolsData as $index => $data) {
                try {
                    $tool = Tool::create($data);
                    $imported[] = $tool;
                } catch (\Exception $e) {
                    $errors[$index] = $e->getMessage();
                }
            }
        });

        return [
            'imported' => count($imported),
            'errors' => $errors,
            'tools' => $imported,
        ];
    }
}
```

### 2.3 Implement Data Transfer Objects (DTOs)

**Create:** `app/Data/ToolData.php`
```php
<?php

declare(strict_types=1);

namespace App\Data;

class ToolData
{
    public function __construct(
        public readonly string $name,
        public readonly string $url,
        public readonly string $description,
        public readonly ?string $docsUrl = null,
        public readonly ?string $usage = null,
        public readonly array $screenshots = [],
        public readonly array $categories = [],
        public readonly array $tags = [],
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            name: $data['name'],
            url: $data['url'],
            description: $data['description'],
            docsUrl: $data['docs_url'] ?? null,
            usage: $data['usage'] ?? null,
            screenshots: $data['screenshots'] ?? [],
            categories: $data['categories'] ?? [],
            tags: $data['tags'] ?? [],
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'url' => $this->url,
            'description' => $this->description,
            'docs_url' => $this->docsUrl,
            'usage' => $this->usage,
            'screenshots' => $this->screenshots,
        ];
    }
}
```

### 2.4 Add PHP Enums for Status Fields

**Create:** `app/Enums/ToolStatus.php`
```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum ToolStatus: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';

    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'Draft',
            self::PUBLISHED => 'Published',
            self::ARCHIVED => 'Archived',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::DRAFT => 'gray',
            self::PUBLISHED => 'green',
            self::ARCHIVED => 'red',
        };
    }
}
```

**Migration:**
```php
// Migration to add status
Schema::table('tools', function (Blueprint $table) {
    $table->string('status')->default('draft')->after('description');
    $table->index('status');
});
```

**Update Model:**
```php
class Tool extends Model
{
    protected $casts = [
        'status' => ToolStatus::class,
        'screenshots' => 'array',
    ];
}
```

### 2.5 Deliverables
- ✅ Service classes for all main entities (Tools, Users, Categories)
- ✅ Action classes for complex operations
- ✅ DTOs for data transfer
- ✅ Enums for status fields
- ✅ Controllers refactored to use services
- ✅ All business logic moved out of controllers

---

## Phase 3: Performance & Optimization
**Duration:** Week 3-4
**Priority:** MEDIUM
**Effort:** Medium

### 3.1 Query Optimization

#### Fix N+1 Queries

**Create:** `app/Traits/PreventLazyLoading.php`
```php
<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;

trait PreventLazyLoading
{
    public static function bootPreventLazyLoading(): void
    {
        Model::preventLazyLoading(! app()->isProduction());
    }
}
```

**Add to AppServiceProvider:**
```php
public function boot(): void
{
    Model::preventLazyLoading(! app()->isProduction());
}
```

#### Add Query Scopes

**Update:** `app/Models/Tool.php`
```php
class Tool extends Model
{
    public function scopePublished($query)
    {
        return $query->where('status', ToolStatus::PUBLISHED);
    }

    public function scopeWithRelations($query)
    {
        return $query->with(['categories', 'tags', 'roles']);
    }

    public function scopePopular($query, int $limit = 10)
    {
        return $query->where('views', '>', 100)
            ->orderBy('views', 'desc')
            ->limit($limit);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }
}
```

**Usage:**
```php
Tool::published()->withRelations()->paginate();
Tool::popular()->get();
Tool::search($request->search)->get();
```

### 3.2 Implement Caching

#### Cache Configuration

**Update:** `config/cache.php` (ensure Redis is default)
```php
'default' => env('CACHE_DRIVER', 'redis'),
```

#### Cache Service

**Create:** `app/Services/CacheService.php`
```php
<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    private const TTL = 3600; // 1 hour
    private const TAGS = ['tools'];

    public function remember(string $key, callable $callback, ?int $ttl = null): mixed
    {
        return Cache::tags(self::TAGS)
            ->remember($key, $ttl ?? self::TTL, $callback);
    }

    public function flush(): void
    {
        Cache::tags(self::TAGS)->flush();
    }

    public function forget(string $key): void
    {
        Cache::tags(self::TAGS)->forget($key);
    }
}
```

#### Update ToolService with Caching

```php
class ToolService extends BaseService
{
    public function __construct(
        private readonly CacheService $cache
    ) {}

    public function getAllPaginated(int $perPage = 15): LengthAwarePaginator
    {
        $page = request('page', 1);
        $key = "tools.paginated.{$page}.{$perPage}";

        return $this->cache->remember($key, function () use ($perPage) {
            return Tool::withRelations()->latest()->paginate($perPage);
        }, 600); // Cache for 10 minutes
    }

    public function getPopular(int $limit = 10): Collection
    {
        return $this->cache->remember("tools.popular.{$limit}", function () use ($limit) {
            return Tool::popular($limit)->withRelations()->get();
        });
    }

    // Clear cache on create/update/delete
    public function create(array $data): Tool
    {
        $tool = parent::create($data);
        $this->cache->flush();
        return $tool;
    }
}
```

### 3.3 Add Database Indexes

**Create migration:** `2025_01_15_add_performance_indexes_to_tools.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            // Composite index for common queries
            $table->index(['status', 'created_at']);

            // Full-text search
            $table->fullText(['name', 'description']);
        });

        Schema::table('journal_entries', function (Blueprint $table) {
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
            $table->dropFullText(['name', 'description']);
        });

        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
        });
    }
};
```

### 3.4 Implement Queue Jobs

#### Setup Queue

**Update:** `.env`
```env
QUEUE_CONNECTION=database
```

**Run migration:**
```bash
php artisan queue:table
php artisan migrate
```

#### Create Job for Email Notifications

**Create:** `app/Jobs/SendToolCreatedNotification.php`
```php
<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Tool;
use App\Models\User;
use App\Notifications\ToolCreatedNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendToolCreatedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public Tool $tool
    ) {}

    public function handle(): void
    {
        // Notify all admins
        $admins = User::role('owner')->get();

        foreach ($admins as $admin) {
            $admin->notify(new ToolCreatedNotification($this->tool));
        }
    }
}
```

**Dispatch in Service:**
```php
public function create(array $data): Tool
{
    $tool = $this->transaction(function () use ($data) {
        // Create tool...
    });

    // Dispatch job
    SendToolCreatedNotification::dispatch($tool);

    return $tool;
}
```

### 3.5 Deliverables
- ✅ N+1 query prevention enabled
- ✅ Query scopes added to models
- ✅ Redis caching implemented
- ✅ Database indexes optimized
- ✅ Queue jobs for slow operations
- ✅ Cache invalidation strategy

---

## Phase 4: Testing & CI/CD
**Duration:** Week 4-5
**Priority:** HIGH
**Effort:** Medium to High

### 4.1 Install Pest PHP

```bash
cd backend
composer require pestphp/pest --dev --with-all-dependencies
composer require pestphp/pest-plugin-laravel --dev
./vendor/bin/pest --init
```

### 4.2 Write Feature Tests

**Create:** `tests/Feature/ToolApiTest.php`
```php
<?php

use App\Models\Tool;
use App\Models\User;
use function Pest\Laravel\{actingAs, getJson, postJson, putJson, deleteJson};

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('lists all tools', function () {
    Tool::factory()->count(5)->create();

    getJson('/api/tools')
        ->assertOk()
        ->assertJsonCount(5, 'data');
});

it('shows a single tool', function () {
    $tool = Tool::factory()->create(['name' => 'Test Tool']);

    getJson("/api/tools/{$tool->id}")
        ->assertOk()
        ->assertJsonPath('data.name', 'Test Tool');
});

it('requires authentication to create tool', function () {
    postJson('/api/tools', [
        'name' => 'Test Tool',
        'url' => 'https://example.com',
        'description' => 'Test description',
    ])->assertUnauthorized();
});

it('creates tool when authenticated', function () {
    actingAs($this->user)->postJson('/api/tools', [
        'name' => 'Test Tool',
        'url' => 'https://example.com',
        'description' => 'Test description',
    ])->assertCreated()
      ->assertJsonPath('data.name', 'Test Tool');

    expect(Tool::where('name', 'Test Tool')->exists())->toBeTrue();
});

it('updates tool', function () {
    $tool = Tool::factory()->create();

    actingAs($this->user)->putJson("/api/tools/{$tool->id}", [
        'name' => 'Updated Tool',
    ])->assertOk();

    expect($tool->fresh()->name)->toBe('Updated Tool');
});

it('deletes tool', function () {
    $tool = Tool::factory()->create();

    actingAs($this->user)->deleteJson("/api/tools/{$tool->id}")
        ->assertNoContent();

    expect(Tool::find($tool->id))->toBeNull();
});
```

### 4.3 Write Unit Tests

**Create:** `tests/Unit/ToolServiceTest.php`
```php
<?php

use App\Models\Category;
use App\Models\Tool;
use App\Services\ToolService;

beforeEach(function () {
    $this->service = app(ToolService::class);
});

it('creates tool with categories', function () {
    $category = Category::factory()->create();

    $tool = $this->service->create([
        'name' => 'Test Tool',
        'url' => 'https://example.com',
        'description' => 'Test description',
        'categories' => [$category->id],
    ]);

    expect($tool)
        ->toBeInstanceOf(Tool::class)
        ->and($tool->categories->pluck('id')->toArray())
        ->toContain($category->id);
});

it('filters tools by category', function () {
    $category = Category::factory()->create();
    Tool::factory()->count(3)->hasAttached($category, [], 'categories')->create();
    Tool::factory()->count(2)->create();

    $tools = $this->service->getFiltered(['category_id' => $category->id]);

    expect($tools)->toHaveCount(3);
});
```

### 4.4 Setup GitHub Actions CI/CD

**Create:** `.github/workflows/tests.yml`
```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  tests:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: testing
          MYSQL_ROOT_PASSWORD: password
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd="redis-cli ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: mbstring, pdo, pdo_mysql, redis
          coverage: xdebug

      - name: Install dependencies
        run: |
          cd backend
          composer install --prefer-dist --no-progress

      - name: Copy .env
        run: |
          cd backend
          cp .env.testing .env

      - name: Generate key
        run: |
          cd backend
          php artisan key:generate

      - name: Run migrations
        run: |
          cd backend
          php artisan migrate --force

      - name: Run tests
        run: |
          cd backend
          php artisan test --coverage --min=80

      - name: Run PHPStan
        run: |
          cd backend
          ./vendor/bin/phpstan analyse

      - name: Run Pint
        run: |
          cd backend
          ./vendor/bin/pint --test
```

**Create:** `.env.testing`
```env
APP_ENV=testing
APP_KEY=
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=testing
DB_USERNAME=root
DB_PASSWORD=password
CACHE_DRIVER=redis
QUEUE_CONNECTION=sync
SESSION_DRIVER=array
```

### 4.5 Deliverables
- ✅ Pest installed and configured
- ✅ Feature tests for all API endpoints
- ✅ Unit tests for services
- ✅ 80%+ code coverage
- ✅ GitHub Actions CI/CD pipeline
- ✅ Automated testing on PR

---

## Phase 5: Security Hardening
**Duration:** Week 5
**Priority:** HIGH
**Effort:** Low to Medium

### 5.1 Implement Rate Limiting

**Update:** `app/Providers/RouteServiceProvider.php`
```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

public function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip())
            ->response(function () {
                return response()->json([
                    'message' => 'Too many requests. Please slow down.',
                ], 429);
            });
    });

    RateLimiter::for('login', function (Request $request) {
        return [
            Limit::perMinute(5)->by($request->ip()),
            Limit::perHour(20)->by($request->ip()),
        ];
    });

    RateLimiter::for('register', function (Request $request) {
        return Limit::perHour(3)->by($request->ip());
    });
}
```

**Apply to routes:**
```php
// routes/api.php
Route::middleware(['throttle:api'])->group(function () {
    Route::apiResource('tools', ToolController::class);
});

Route::middleware(['throttle:login'])->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});
```

### 5.2 API Versioning

**Update:** `routes/api.php`
```php
// API v1
Route::prefix('v1')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('tools', ToolController::class);
        Route::apiResource('categories', CategoryController::class);
    });
});

// Future: API v2
Route::prefix('v2')->group(function () {
    // New version endpoints
});
```

### 5.3 Security Headers Middleware

**Create:** `app/Http/Middleware/SecurityHeaders.php`
```php
<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        return $response;
    }
}
```

**Register in kernel:**
```php
protected $middleware = [
    // ...
    \App\Http\Middleware\SecurityHeaders::class,
];
```

### 5.4 Input Sanitization

**Update Form Requests:**
```php
class StoreToolRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => strip_tags($this->name),
            'description' => strip_tags($this->description),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
        ];
    }
}
```

### 5.5 Deliverables
- ✅ Rate limiting on all API routes
- ✅ API versioning (`/api/v1/`)
- ✅ Security headers middleware
- ✅ Input sanitization in Form Requests
- ✅ CORS properly configured

---

## Phase 6: Advanced Features
**Duration:** Week 6
**Priority:** LOW
**Effort:** Medium

### 6.1 Install Laravel Telescope (Development)

```bash
cd backend
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

**Access:** `http://localhost:8201/telescope`

### 6.2 Install Laravel Pulse (Monitoring)

```bash
cd backend
composer require laravel/pulse
php artisan pulse:install
php artisan migrate
```

### 6.3 API Documentation with Scribe

```bash
composer require --dev knuckleswtf/scribe
php artisan scribe:generate
```

**Access:** `http://localhost:8201/docs`

### 6.4 Deliverables
- ✅ Telescope for development debugging
- ✅ Pulse for application monitoring
- ✅ API documentation auto-generated

---

## Priority Matrix

### Must Have (Phase 1-2)
Priority: **CRITICAL**
Timeline: **Week 1-3**

- ✅ Code formatting (Pint)
- ✅ Static analysis (PHPStan)
- ✅ Service layer
- ✅ Form Requests for validation
- ✅ API Resources

### Should Have (Phase 3-4)
Priority: **HIGH**
Timeline: **Week 3-5**

- ✅ Caching strategy
- ✅ Database indexes
- ✅ Feature tests
- ✅ CI/CD pipeline

### Nice to Have (Phase 5-6)
Priority: **MEDIUM**
Timeline: **Week 5-6**

- ✅ Rate limiting
- ✅ API versioning
- ✅ Laravel Telescope
- ✅ API documentation

### Optional
Priority: **LOW**
Timeline: **Future**

- Queue jobs for emails
- Real-time notifications
- GraphQL API
- Microservices architecture

---

## Success Metrics

### Code Quality
- ✅ PHPStan level 8 with no errors
- ✅ 100% code formatted with Pint
- ✅ 80%+ test coverage
- ✅ Zero N+1 queries

### Performance
- ✅ API response time < 200ms (95th percentile)
- ✅ Database queries < 10 per request
- ✅ Cache hit rate > 70%
- ✅ Page load time < 2s

### Security
- ✅ All endpoints rate-limited
- ✅ 100% input validated
- ✅ Security headers on all responses
- ✅ No vulnerabilities in dependencies

### Developer Experience
- ✅ CI/CD pipeline < 5 minutes
- ✅ Local setup in 1 command
- ✅ IDE autocomplete working
- ✅ Clear documentation

---

## Maintenance Schedule

### Daily
- Monitor error logs
- Check CI/CD pipeline status

### Weekly
- Review code coverage
- Update dependencies
- Check security advisories

### Monthly
- Performance audit
- Dependency updates
- Security scan

### Quarterly
- Architecture review
- Refactoring session
- Documentation update

---

## Resources & Tools

### Essential
- [Laravel Docs](https://laravel.com/docs)
- [Pest Docs](https://pestphp.com)
- [PHPStan Docs](https://phpstan.org)

### Community
- [Laravel News](https://laravel-news.com)
- [Laracasts](https://laracasts.com)
- [Laravel Daily](https://laraveldaily.com)

### Packages
- [Spatie Packages](https://spatie.be/open-source)
- [Laravel Beyond CRUD](https://laravel-beyond-crud.com)

---

## Next Steps

### Immediate (This Week)
1. Run `composer require laravel/pint --dev`
2. Run `./vendor/bin/pint` to format all code
3. Install PHPStan and fix level 6 issues
4. Create first service class (ToolService)

### Short Term (Next 2 Weeks)
1. Implement service layer for all controllers
2. Add caching to frequently accessed data
3. Write feature tests for all API endpoints
4. Setup GitHub Actions

### Long Term (Next Month)
1. Achieve 80%+ test coverage
2. Implement queue jobs
3. Add API documentation
4. Deploy with CI/CD

---

**Last Updated:** December 2025
**Next Review:** January 2025
