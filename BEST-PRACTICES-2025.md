# Best Practices for Laravel Full-Stack Projects (2025)

This document outlines modern best practices, recommendations, and industry standards for Laravel-based full-stack projects in 2025.

## Table of Contents
1. [Laravel Backend Best Practices](#laravel-backend-best-practices)
2. [Database & Migrations](#database--migrations)
3. [API Design](#api-design)
4. [Authentication & Security](#authentication--security)
5. [Testing](#testing)
6. [Docker & DevOps](#docker--devops)
7. [Frontend Integration](#frontend-integration)
8. [Performance & Optimization](#performance--optimization)
9. [Code Quality](#code-quality)
10. [Project Structure](#project-structure)

---

## Laravel Backend Best Practices

### PHP Version
✅ **Use PHP 8.3 or 8.4** (Latest stable)
- Type declarations (strict types)
- Readonly properties
- Enums for constants
- Constructor property promotion

```php
<?php
declare(strict_types=1);

namespace App\Models;

class User extends Authenticatable
{
    // Use readonly properties for immutable data
    public function __construct(
        public readonly string $id,
        public string $name,
    ) {}
}
```

### Laravel Version
✅ **Use Laravel 11.x** (Latest LTS)
- Streamlined application structure
- Per-second rate limiting
- Health routing
- Model casts improvements

### Service Layer Pattern
✅ **Implement Service classes** for business logic

```php
// Bad: Logic in controller
class ToolController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([...]);
        $tool = Tool::create($validated);
        $tool->categories()->attach($request->categories);
        // More logic...
        return response()->json($tool);
    }
}

// Good: Logic in service
class ToolController extends Controller
{
    public function __construct(
        private readonly ToolService $toolService
    ) {}

    public function store(StoreToolRequest $request)
    {
        $tool = $this->toolService->createTool(
            $request->validated()
        );

        return new ToolResource($tool);
    }
}

// app/Services/ToolService.php
class ToolService
{
    public function createTool(array $data): Tool
    {
        return DB::transaction(function () use ($data) {
            $tool = Tool::create($data);
            $this->attachRelationships($tool, $data);
            event(new ToolCreated($tool));
            return $tool;
        });
    }
}
```

### Repository Pattern (Optional)
✅ **Use for complex queries** - Don't over-engineer simple CRUD

```php
// Good for complex scenarios
interface ToolRepositoryInterface
{
    public function findWithFilters(array $filters): Collection;
    public function findPopular(int $limit = 10): Collection;
}

// app/Repositories/ToolRepository.php
class ToolRepository implements ToolRepositoryInterface
{
    public function findWithFilters(array $filters): Collection
    {
        return Tool::query()
            ->when($filters['category'] ?? null, fn($q, $cat) =>
                $q->whereHas('categories', fn($q) => $q->where('id', $cat))
            )
            ->when($filters['search'] ?? null, fn($q, $search) =>
                $q->where('name', 'like', "%{$search}%")
            )
            ->with(['categories', 'tags'])
            ->get();
    }
}
```

### Action Classes (Single Responsibility)
✅ **Use for complex operations**

```php
// app/Actions/Tools/CreateToolAction.php
class CreateToolAction
{
    public function execute(array $data): Tool
    {
        return DB::transaction(function () use ($data) {
            $tool = Tool::create([
                'name' => $data['name'],
                'url' => $data['url'],
                'description' => $data['description'],
            ]);

            if (isset($data['categories'])) {
                $tool->categories()->attach($data['categories']);
            }

            return $tool->fresh(['categories', 'tags']);
        });
    }
}
```

---

## Database & Migrations

### Migration Best Practices

✅ **Always use transactions for complex migrations**
```php
public function up(): void
{
    DB::transaction(function () {
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index();
            $table->string('slug')->unique();
            $table->timestamps();
        });
    });
}
```

✅ **Add indexes strategically**
```php
Schema::create('tools', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique(); // Unique = automatic index
    $table->text('description');
    $table->timestamp('published_at')->nullable();

    // Add indexes for frequently queried columns
    $table->index(['published_at', 'name']); // Composite index
    $table->fullText(['name', 'description']); // Full-text search
});
```

✅ **Use Enums for status fields**
```php
// Migration
$table->string('status')->default('draft');
$table->index('status');

// Better: Use enum (PHP 8.1+)
enum ToolStatus: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';
}

// Model
class Tool extends Model
{
    protected $casts = [
        'status' => ToolStatus::class,
    ];
}
```

✅ **Use UUIDs for public-facing IDs**
```php
// Migration
$table->uuid('id')->primary();
$table->uuid('user_id');
$table->foreign('user_id')->references('id')->on('users');

// Model
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Tool extends Model
{
    use HasUuids;
}
```

### Seeder Best Practices

✅ **Use Model Factories**
```php
// database/factories/ToolFactory.php
class ToolFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'url' => fake()->url(),
            'description' => fake()->sentence(20),
            'status' => ToolStatus::PUBLISHED,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ToolStatus::DRAFT,
        ]);
    }
}

// Seeder
Tool::factory()
    ->count(50)
    ->hasCategories(2)
    ->hasTags(3)
    ->create();
```

✅ **Make seeders idempotent**
```php
// Good - can run multiple times safely
public function run(): void
{
    $tools = [
        ['name' => 'OpenAI', 'url' => 'https://openai.com'],
        ['name' => 'Claude', 'url' => 'https://claude.ai'],
    ];

    foreach ($tools as $tool) {
        Tool::updateOrCreate(
            ['name' => $tool['name']], // Find by name
            $tool // Update with this data
        );
    }
}
```

---

## API Design

### RESTful API Standards

✅ **Use API Resources for transformations**
```php
// app/Http/Resources/ToolResource.php
class ToolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'url' => $this->url,
            'description' => $this->description,
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

// Controller
public function index()
{
    $tools = Tool::with(['categories', 'tags'])->paginate(15);
    return ToolResource::collection($tools);
}
```

✅ **Use Form Requests for validation**
```php
// app/Http/Requests/StoreToolRequest.php
class StoreToolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Tool::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:tools'],
            'url' => ['required', 'url', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
            'categories' => ['array'],
            'categories.*' => ['exists:categories,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'categories.*.exists' => 'One or more categories are invalid.',
        ];
    }
}
```

✅ **Consistent error responses**
```php
// app/Exceptions/Handler.php
public function render($request, Throwable $exception)
{
    if ($request->wantsJson()) {
        return match (true) {
            $exception instanceof ModelNotFoundException => response()->json([
                'message' => 'Resource not found',
            ], 404),

            $exception instanceof ValidationException => response()->json([
                'message' => 'Validation failed',
                'errors' => $exception->errors(),
            ], 422),

            $exception instanceof AuthorizationException => response()->json([
                'message' => 'Unauthorized',
            ], 403),

            default => response()->json([
                'message' => app()->isProduction()
                    ? 'Server error'
                    : $exception->getMessage(),
            ], 500),
        };
    }

    return parent::render($request, $exception);
}
```

✅ **API versioning**
```php
// routes/api.php
Route::prefix('v1')->group(function () {
    Route::apiResource('tools', ToolController::class);
});

// Or via subdomain
Route::domain('api.example.com')->group(function () {
    Route::prefix('v1')->group(function () {
        // Routes
    });
});
```

---

## Authentication & Security

### Laravel Sanctum (Recommended for SPAs)

✅ **Setup for SPA authentication**
```php
// config/sanctum.php
'stateful' => explode(',', env(
    'SANCTUM_STATEFUL_DOMAINS',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000'
)),

// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
    Route::apiResource('tools', ToolController::class);
});

// CORS configuration (config/cors.php)
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
'supports_credentials' => true,
```

### Security Best Practices

✅ **Rate limiting**
```php
// app/Providers/RouteServiceProvider.php
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

// Custom rate limiting
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(5)->by($request->ip()),
        Limit::perHour(20)->by($request->ip()),
    ];
});

// Use in routes
Route::middleware(['throttle:login'])->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});
```

✅ **Policies for authorization**
```php
// app/Policies/ToolPolicy.php
class ToolPolicy
{
    public function create(User $user): bool
    {
        return $user->hasRole(['owner', 'backend']);
    }

    public function update(User $user, Tool $tool): bool
    {
        return $user->id === $tool->user_id
            || $user->hasRole('owner');
    }
}

// Controller
public function update(UpdateToolRequest $request, Tool $tool)
{
    $this->authorize('update', $tool);
    // ...
}
```

✅ **SQL Injection prevention**
```php
// Bad - vulnerable to SQL injection
DB::select("SELECT * FROM tools WHERE name = '{$request->name}'");

// Good - use parameter binding
DB::select("SELECT * FROM tools WHERE name = ?", [$request->name]);

// Best - use Query Builder or Eloquent
Tool::where('name', $request->name)->get();
```

✅ **XSS Prevention**
```php
// Blade automatically escapes
{{ $tool->description }} // Escaped

// Don't use {!! !!} unless you trust the content
{!! $tool->html !!} // NOT escaped - dangerous!

// API - always validate and sanitize input
public function rules(): array
{
    return [
        'description' => ['required', 'string', 'max:1000'],
        'html' => ['sometimes', 'string'], // Then use Purifier
    ];
}
```

---

## Testing

### Test Structure

✅ **Feature tests for API endpoints**
```php
// tests/Feature/ToolApiTest.php
class ToolApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_tools(): void
    {
        $tools = Tool::factory()->count(3)->create();

        $response = $this->getJson('/api/tools');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'url', 'description']
                ]
            ]);
    }

    public function test_cannot_create_tool_without_authentication(): void
    {
        $response = $this->postJson('/api/tools', [
            'name' => 'Test Tool',
        ]);

        $response->assertUnauthorized();
    }

    public function test_can_create_tool_when_authenticated(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/tools', [
                'name' => 'Test Tool',
                'url' => 'https://example.com',
                'description' => 'Test description',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Test Tool');

        $this->assertDatabaseHas('tools', [
            'name' => 'Test Tool',
        ]);
    }
}
```

✅ **Unit tests for services**
```php
// tests/Unit/ToolServiceTest.php
class ToolServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_tool_with_categories(): void
    {
        $category = Category::factory()->create();
        $service = new ToolService();

        $tool = $service->createTool([
            'name' => 'Test Tool',
            'url' => 'https://example.com',
            'description' => 'Test',
            'categories' => [$category->id],
        ]);

        $this->assertInstanceOf(Tool::class, $tool);
        $this->assertTrue($tool->categories->contains($category));
    }
}
```

✅ **Use Pest (Modern alternative to PHPUnit)**
```php
// tests/Feature/ToolTest.php
use function Pest\Laravel\{get, post, actingAs};

it('lists all tools', function () {
    Tool::factory()->count(5)->create();

    get('/api/tools')
        ->assertOk()
        ->assertJsonCount(5, 'data');
});

it('requires authentication to create tool', function () {
    post('/api/tools', ['name' => 'Test'])
        ->assertUnauthorized();
});

it('creates tool when authenticated', function () {
    $user = User::factory()->create();

    actingAs($user)->post('/api/tools', [
        'name' => 'Test Tool',
        'url' => 'https://example.com',
        'description' => 'Test',
    ])->assertCreated();

    expect(Tool::where('name', 'Test Tool')->exists())->toBeTrue();
});
```

---

## Docker & DevOps

### Docker Best Practices

✅ **Multi-stage builds**
```dockerfile
# Build stage
FROM composer:latest AS composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Production stage
FROM php:8.3-fpm-alpine
WORKDIR /var/www/html

# Install only production dependencies
RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    && docker-php-ext-install pdo_mysql gd

# Copy from build stage
COPY --from=composer /app/vendor ./vendor
COPY . .

RUN chown -R www-data:www-data storage bootstrap/cache

USER www-data
```

✅ **Health checks**
```yaml
# docker-compose.yml
services:
  backend:
    healthcheck:
      test: ["CMD", "php", "artisan", "health:check"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

✅ **Use .dockerignore**
```
# .dockerignore
.git
.env
node_modules
vendor
storage/logs/*
!storage/logs/.gitkeep
tests
.phpunit.result.cache
```

### Environment Configuration

✅ **Separate configs per environment**
```env
# .env.production
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=error

# .env.staging
APP_ENV=staging
APP_DEBUG=true
LOG_LEVEL=debug

# .env.docker (local development)
APP_ENV=local
APP_DEBUG=true
LOG_LEVEL=debug
```

✅ **Use Laravel Envoy or GitHub Actions for deployment**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'

      - name: Install dependencies
        run: composer install --no-dev --optimize-autoloader

      - name: Run tests
        run: php artisan test

      - name: Deploy to production
        run: |
          php artisan down
          git pull
          composer install --no-dev
          php artisan migrate --force
          php artisan config:cache
          php artisan route:cache
          php artisan view:cache
          php artisan up
```

---

## Frontend Integration

### Next.js + Laravel API

✅ **CORS configuration**
```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

✅ **API client setup (Next.js)**
```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Important for Sanctum
});

// Get CSRF cookie before login
export const getCsrfCookie = () =>
  api.get('/sanctum/csrf-cookie');

// API calls
export const toolsApi = {
  getAll: () => api.get('/api/tools'),
  getOne: (id: string) => api.get(`/api/tools/${id}`),
  create: (data: ToolData) => api.post('/api/tools', data),
  update: (id: string, data: ToolData) =>
    api.put(`/api/tools/${id}`, data),
  delete: (id: string) => api.delete(`/api/tools/${id}`),
};
```

---

## Performance & Optimization

### Query Optimization

✅ **Eager loading to prevent N+1**
```php
// Bad - N+1 query problem
$tools = Tool::all();
foreach ($tools as $tool) {
    echo $tool->category->name; // Query for each tool!
}

// Good - Eager load
$tools = Tool::with('category')->get();
foreach ($tools as $tool) {
    echo $tool->category->name; // No extra queries
}

// Best - Load only what you need
$tools = Tool::with('category:id,name')->get();
```

✅ **Use chunking for large datasets**
```php
// Bad - loads all records into memory
Tool::all()->each(function ($tool) {
    // Process
});

// Good - processes in chunks
Tool::chunk(100, function ($tools) {
    foreach ($tools as $tool) {
        // Process
    }
});

// Or use lazy collections
Tool::lazy()->each(function ($tool) {
    // Process one at a time
});
```

✅ **Cache expensive queries**
```php
// Cache for 1 hour
$tools = Cache::remember('tools.popular', 3600, function () {
    return Tool::where('views', '>', 1000)
        ->with(['categories', 'tags'])
        ->orderBy('views', 'desc')
        ->limit(10)
        ->get();
});

// Cache tags for easier invalidation
Cache::tags(['tools'])->remember('tools.all', 3600, fn() => Tool::all());

// Invalidate on update
Cache::tags(['tools'])->flush();
```

### Queue Jobs

✅ **Use queues for slow operations**
```php
// app/Jobs/ProcessToolImport.php
class ProcessToolImport implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public array $toolData
    ) {}

    public function handle(): void
    {
        foreach ($this->toolData as $data) {
            Tool::create($data);
        }
    }

    // Retry failed jobs
    public int $tries = 3;
    public int $backoff = 60; // seconds
}

// Dispatch
ProcessToolImport::dispatch($toolData);

// Or dispatch after response (faster user experience)
ProcessToolImport::dispatchAfterResponse($toolData);
```

---

## Code Quality

### PHP CodeSniffer & Pint

✅ **Use Laravel Pint (built-in code formatter)**
```bash
# Install (included in Laravel 9+)
composer require laravel/pint --dev

# Run
./vendor/bin/pint

# Configure
# pint.json
{
    "preset": "laravel",
    "rules": {
        "no_unused_imports": true,
        "not_operator_with_successor_space": true
    }
}
```

### PHPStan (Static Analysis)

✅ **Use PHPStan for type safety**
```bash
composer require --dev phpstan/phpstan

# phpstan.neon
parameters:
    level: 8
    paths:
        - app
    ignoreErrors:
        - '#Unsafe usage of new static#'
```

### IDE Helper

✅ **Generate IDE autocompletion**
```bash
composer require --dev barryvdh/laravel-ide-helper

php artisan ide-helper:generate
php artisan ide-helper:models
php artisan ide-helper:meta
```

---

## Project Structure

### Recommended Directory Structure

```
app/
├── Actions/           # Single-purpose action classes
│   └── Tools/
│       ├── CreateToolAction.php
│       └── UpdateToolAction.php
├── Console/
├── Data/             # Data Transfer Objects (DTOs)
│   └── ToolData.php
├── Enums/            # PHP 8.1+ Enums
│   └── ToolStatus.php
├── Events/
│   └── ToolCreated.php
├── Exceptions/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Requests/     # Form Requests
│   └── Resources/    # API Resources
├── Jobs/
├── Listeners/
├── Models/
├── Policies/
├── Providers/
├── Repositories/     # Optional: for complex queries
│   └── ToolRepository.php
└── Services/         # Business logic
    └── ToolService.php
```

---

## Summary Checklist

### Must-Have
- ✅ PHP 8.3+ with strict types
- ✅ Laravel 11.x
- ✅ Form Requests for validation
- ✅ API Resources for transformations
- ✅ Policies for authorization
- ✅ Database indexes on foreign keys and frequently queried columns
- ✅ Eager loading to prevent N+1 queries
- ✅ Feature tests for all API endpoints
- ✅ Rate limiting on API routes
- ✅ Dockerized development environment
- ✅ `.env` configuration per environment
- ✅ Idempotent database seeders

### Recommended
- ✅ Service layer for business logic
- ✅ Action classes for single-purpose operations
- ✅ Enums for status fields
- ✅ Queue jobs for slow operations
- ✅ Cache expensive queries
- ✅ Laravel Pint for code formatting
- ✅ PHPStan for static analysis
- ✅ Pest for testing
- ✅ Multi-stage Docker builds
- ✅ Health checks in Docker

### Advanced
- ✅ Repository pattern (only when needed)
- ✅ Event sourcing for audit trails
- ✅ CQRS pattern for complex domains
- ✅ GraphQL API (Laravel Lighthouse)
- ✅ OpenAPI/Swagger documentation
- ✅ CI/CD with GitHub Actions
- ✅ Monitoring with Laravel Telescope
- ✅ Performance monitoring with Laravel Pulse

---

## Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Best Practices](https://github.com/alexeymezenin/laravel-best-practices)
- [Laravel News](https://laravel-news.com)
- [Spatie Packages](https://spatie.be/open-source/packages)
- [Laravel Daily](https://laraveldaily.com)
- [Pest PHP](https://pestphp.com)
- [Laravel Pint](https://laravel.com/docs/pint)

---

**Last Updated:** December 2025
