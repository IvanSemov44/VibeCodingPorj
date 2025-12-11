I'll create a comprehensive, production-ready plan for implementing 2FA, admin panel, role-based access, caching, and audit logging following senior-level best practices. 

Research 2FA & admin infrastructure

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/config/auth.php#1-1), lines 1 to 100

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/config/sanctum.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/config/cache.php)

Searched for files matching `**/backend/app/Models/User.php`, 1 match

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Models/User.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Http)

Searched for files matching `**/backend/database/migrations/*create_users_table.php`, 1 match

Searched for files matching `**/backend/app/Models/Tool.php`, 1 match

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/database/migrations/0001_01_01_000000_create_users_table.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Models/Tool.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Http/Middleware)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Http/Controllers)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Http/Controllers/Api)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Http/Kernel.php)

Searched for files matching `**/backend/database/migrations/*create_tools_table.php`, 1 match

Searched for files matching `**/backend/database/seeders/*.php`, 8 matches

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/database/migrations/2025_12_09_000001_create_tools_table.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/database/seeders/RoleSeeder.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/database/seeders/ToolSeeder.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Http/Controllers/Api/AuthController.php#1-1), lines 1 to 100

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Http/Controllers/Api/AuthController.php#101-101), lines 101 to 126

Searched for files matching `**/backend/composer.json`, 1 match

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/routes/api.php)

Searched for files matching `**/backend/database/migrations/*spatie*.php`, no matches

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/composer.json)

Searched for files matching `**/backend/database/migrations/*create_permission*.php`, 1 match

Searched for files matching `**/backend/database/migrations/*create_role*.php`, 1 match

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/database/migrations)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/database/migrations/2025_12_08_000000_create_permission_tables.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/database/migrations/2025_12_09_000004_create_role_tool_table.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/config/database.php#1-1), lines 1 to 50

Searched for files matching `**/backend/app/Policies/*.php`, 1 match

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/config/database.php#51-51), lines 51 to 175

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Policies/ToolPolicy.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Http/Controllers/Api/ToolController.php#1-1), lines 1 to 100

Searched for files matching `**/backend/config/permission.php`, no matches

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Http/Controllers/Api/ToolController.php#101-101), lines 101 to 188

Searched for regex `config.*permission|Permission` (`**/backend/config/*.php`), no results

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/bootstrap/app.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/database/seeders/UserSeeder.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Providers/AppServiceProvider.php)

Searched for files matching `**/backend/app/Providers/AuthServiceProvider.php`, 1 match

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Providers)

Searched for regex `Gate::define|Policy` (`**/backend/app/Providers/*.php`), 3 results

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Providers/AuthServiceProvider.php)

Searched for files matching `**/backend/.env*`, 3 matches

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/env.template)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Models)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Models/Category.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Models/Tag.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Models/JournalEntry.php#1-1), lines 1 to 50

Searched for files matching `**/backend/database/migrations/*cache*.php`, 1 match

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/database/migrations/0001_01_01_000001_create_cache_table.php)

Searched for regex `admin|role.*middleware` (`**/backend/routes/*.php`), 1 result

Searched for files matching `**/backend/app/Http/Middleware/*ole*.php`, no matches

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/database/seeders/DatabaseSeeder.php)

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/app/Http/Controllers/Api/RoleController.php)

Searched for regex `REDIS|redis` (`**/backend/config/*.php`), 20 results

Read [](file:///c%3A/Users/ivans/Desktop/Dev/VibeCodingProj/full-stack-starter-kit/backend/config/session.php#1-1), lines 1 to 50

Excellent research! Now I'll create the comprehensive production-ready plan following 10+ years senior dev best practices. Let me provide the comprehensive plan directly without the todo list tool issue:

---

## **PRODUCTION-READY SECURITY & ADMIN IMPLEMENTATION PLAN**
### **10+ Years Senior Dev Best Practices**

---

## **🎯 ARCHITECTURAL OVERVIEW**

### **Tech Stack Decisions**

**2FA Implementation:**
- **Google Authenticator (TOTP)**: `spomky-labs/otphp` + QR code via `bacon/bacon-qr-code`
- **Email OTP**: Laravel Notifications + Redis rate limiting
- **Telegram OTP**: `telegram-bot-sdk/telegram-bot-sdk` + webhook

**Caching Strategy:**
- **Redis** for sessions, cache, rate limiting
- **Laravel Cache Tags** for granular invalidation
- **Cache-aside pattern** with smart TTLs

**Security Patterns:**
- **Defense in depth**: Multiple middleware layers
- **Principle of least privilege**: Granular permissions
- **Zero trust**: Verify every request
- **Audit everything**: Comprehensive activity logging

---

## **📋 PHASE-BY-PHASE IMPLEMENTATION**

---

### **PHASE 1: Database Foundation** ⏱️ ~2-3 hours

#### **Step 1.1: User Security Fields Migration**

**File**: `backend/database/migrations/YYYY_MM_DD_add_security_fields_to_users.php`

```php
Schema::table('users', function (Blueprint $table) {
    // 2FA fields
    $table->string('two_factor_type')->nullable(); // 'totp', 'email', 'telegram'
    $table->text('two_factor_secret')->nullable(); // Encrypted TOTP secret
    $table->text('two_factor_recovery_codes')->nullable(); // Encrypted JSON
    $table->timestamp('two_factor_confirmed_at')->nullable();
    
    // Telegram integration
    $table->string('telegram_chat_id')->nullable()->unique();
    $table->boolean('telegram_verified')->default(false);
    
    // Security meta
    $table->boolean('is_active')->default(true)->index();
    $table->timestamp('last_login_at')->nullable();
    $table->string('last_login_ip')->nullable();
    $table->integer('failed_login_attempts')->default(0);
    $table->timestamp('locked_until')->nullable();
    
    // Audit
    $table->timestamp('password_changed_at')->nullable();
});
```

**Why**: Separation of concerns—security data lives with user but is optional/nullable for gradual rollout.

---

#### **Step 1.2: Activity Log Migration**

**File**: `backend/database/migrations/YYYY_MM_DD_create_activity_logs_table.php`

```php
Schema::create('activity_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
    $table->string('event')->index(); // 'login', 'tool.created', 'user.banned'
    $table->string('auditable_type')->nullable(); // Polymorphic
    $table->unsignedBigInteger('auditable_id')->nullable();
    $table->json('properties')->nullable(); // Old/new values, metadata
    $table->string('ip_address', 45)->nullable();
    $table->string('user_agent', 500)->nullable();
    $table->timestamps();
    
    $table->index(['auditable_type', 'auditable_id']);
    $table->index('created_at');
});
```

**Why**: Polymorphic design allows tracking any model change. Indexed for fast admin queries.

**Alternative**: Use `spatie/laravel-activitylog` package (recommended for production).

---

#### **Step 1.3: Tool Approval Workflow**

**File**: `backend/database/migrations/YYYY_MM_DD_add_approval_to_tools.php`

```php
Schema::table('tools', function (Blueprint $table) {
    $table->string('status')->default('pending')->index(); // pending, approved, rejected
    $table->foreignId('submitted_by')->nullable()->constrained('users')->onDelete('set null');
    $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('reviewed_at')->nullable();
    $table->text('rejection_reason')->nullable();
});
```

**Why**: Workflow state machine with audit trail—who submitted, who reviewed, when.

---

#### **Step 1.4: Two-Factor Challenges Table**

**File**: `backend/database/migrations/YYYY_MM_DD_create_two_factor_challenges.php`

```php
Schema::create('two_factor_challenges', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('code', 10); // OTP code
    $table->string('type'); // 'email', 'telegram'
    $table->boolean('used')->default(false);
    $table->timestamp('expires_at')->index();
    $table->timestamps();
});
```

**Why**: Stateless OTP validation with expiry—prevents replay attacks, allows rate limiting.

---

### **PHASE 2: Authorization Layer** ⏱️ ~3-4 hours

#### **Step 2.1: Define Permissions**

**File**: `backend/database/seeders/PermissionSeeder.php`

```php
public function run(): void
{
    $permissions = [
        // User management
        'users.view', 'users.create', 'users.edit', 'users.delete', 'users.ban',
        
        // Tool management
        'tools.view', 'tools.create', 'tools.edit', 'tools.delete',
        'tools.approve', 'tools.reject',
        
        // Category/Tag admin
        'categories.manage', 'tags.manage',
        
        // Audit logs
        'audit.view', 'audit.export',
        
        // Settings
        'settings.manage',
    ];
    
    foreach ($permissions as $permission) {
        Permission::create(['name' => $permission, 'guard_name' => 'web']);
    }
    
    // Assign to owner role
    $owner = Role::findByName('owner');
    $owner->givePermissionTo($permissions);
}
```

**Why**: Granular permissions allow flexible RBAC. Owner gets all, others can be customized.

---

#### **Step 2.2: Role Middleware**

**File**: `backend/app/Http/Middleware/CheckRole.php`

```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        if (!$request->user()->hasAnyRole($roles)) {
            activity()
                ->causedBy($request->user())
                ->withProperties(['attempted_roles' => $roles, 'ip' => $request->ip()])
                ->log('unauthorized_access_attempt');
            
            return response()->json([
                'message' => 'Insufficient privileges'
            ], 403);
        }
        
        return $next($request);
    }
}
```

**Register**: `bootstrap/app.php` → `->withMiddleware(fn($middleware) => $middleware->alias(['role' => \App\Http\Middleware\CheckRole::class]))`

**Why**: Reusable middleware with audit logging of failed access attempts.

---

#### **Step 2.3: Permission Middleware**

**File**: `backend/app/Http/Middleware/CheckPermission.php`

```php
public function handle(Request $request, Closure $next, string $permission)
{
    if (!$request->user()?->can($permission)) {
        abort(403, "Permission '$permission' required");
    }
    return $next($request);
}
```

**Why**: Fine-grained permission checks—better than role checks for specific actions.

---

### **PHASE 3: 2FA Backend Implementation** ⏱️ ~6-8 hours

#### **Step 3.1: TOTP (Google Authenticator) Setup**

**Install**: `composer require spomky-labs/otphp bacon/bacon-qr-code`

**File**: `backend/app/Services/TwoFactorService.php`

```php
namespace App\Services;

use OTPHP\TOTP;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Writer;
use App\Models\User;

class TwoFactorService
{
    public function generateSecret(User $user): array
    {
        $totp = TOTP::create();
        $totp->setLabel($user->email);
        $totp->setIssuer(config('app.name'));
        
        $qrCode = $this->generateQrCode($totp->getProvisioningUri());
        $secret = encrypt($totp->getSecret());
        
        return [
            'secret' => $secret,
            'qr_code' => $qrCode,
            'recovery_codes' => $this->generateRecoveryCodes(),
        ];
    }
    
    public function verify(User $user, string $code): bool
    {
        if (!$user->two_factor_secret) {
            return false;
        }
        
        $totp = TOTP::create(decrypt($user->two_factor_secret));
        return $totp->verify($code, time(), 30); // 30s window
    }
    
    private function generateQrCode(string $uri): string
    {
        $renderer = new ImageRenderer(/* ... */);
        $writer = new Writer($renderer);
        return base64_encode($writer->writeString($uri));
    }
    
    private function generateRecoveryCodes(): array
    {
        return collect(range(1, 8))
            ->map(fn() => strtoupper(Str::random(10)))
            ->all();
    }
}
```

**Why**: Service class isolates 2FA logic—testable, reusable across controllers.

---

#### **Step 3.2: Email OTP Implementation**

**File**: `backend/app/Notifications/TwoFactorCode.php`

```php
namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class TwoFactorCode extends Notification
{
    public function __construct(public string $code) {}
    
    public function via($notifiable): array
    {
        return ['mail'];
    }
    
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Login Code')
            ->line("Your verification code is: **{$this->code}**")
            ->line('This code expires in 5 minutes.')
            ->line('If you did not request this, please secure your account.');
    }
}
```

**Service Method**:
```php
public function sendEmailCode(User $user): void
{
    $code = random_int(100000, 999999);
    
    TwoFactorChallenge::create([
        'user_id' => $user->id,
        'code' => $code,
        'type' => 'email',
        'expires_at' => now()->addMinutes(5),
    ]);
    
    $user->notify(new TwoFactorCode($code));
}
```

**Why**: Notification pattern—can easily add SMS, Slack, etc. Database-backed codes allow rate limiting.

---

#### **Step 3.3: Telegram Bot Integration**

**Install**: `composer require telegram-bot-sdk/telegram-bot-sdk`

**Config**: `backend/config/telegram.php`
```php
return [
    'bot_token' => env('TELEGRAM_BOT_TOKEN'),
    'webhook_url' => env('TELEGRAM_WEBHOOK_URL'),
];
```

**Service**: `backend/app/Services/TelegramService.php`
```php
namespace App\Services;

use Telegram\Bot\Laravel\Facades\Telegram;
use App\Models\User;

class TelegramService
{
    public function sendOTP(User $user, string $code): void
    {
        if (!$user->telegram_chat_id) {
            throw new \Exception('Telegram not linked');
        }
        
        Telegram::sendMessage([
            'chat_id' => $user->telegram_chat_id,
            'text' => "🔐 Your login code: `{$code}`\n\nExpires in 5 minutes.",
            'parse_mode' => 'Markdown',
        ]);
    }
    
    public function verifyUser(int $chatId, string $verificationCode): User
    {
        // Webhook handler logic...
    }
}
```

**Controller**: `backend/app/Http/Controllers/Api/TelegramWebhookController.php` (webhook endpoint)

**Why**: Async delivery via Telegram API—faster than email, better UX for power users.

---

#### **Step 3.4: 2FA Auth Flow Controller**

**File**: `backend/app/Http/Controllers/Api/TwoFactorController.php`

```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;

class TwoFactorController extends Controller
{
    public function __construct(private TwoFactorService $twoFactorService) {}
    
    // Enable 2FA
    public function enable(Request $request)
    {
        $request->validate(['type' => 'required|in:totp,email,telegram']);
        $user = $request->user();
        
        $data = match($request->type) {
            'totp' => $this->twoFactorService->generateSecret($user),
            'email' => ['message' => 'Code sent to your email'],
            'telegram' => ['message' => 'Link your Telegram first'],
        };
        
        return response()->json($data);
    }
    
    // Confirm 2FA setup
    public function confirm(Request $request)
    {
        $request->validate(['code' => 'required']);
        $user = $request->user();
        
        if (!$this->twoFactorService->verify($user, $request->code)) {
            return response()->json(['message' => 'Invalid code'], 422);
        }
        
        $user->update(['two_factor_confirmed_at' => now()]);
        activity()->causedBy($user)->log('2fa_enabled');
        
        return response()->json(['message' => '2FA enabled successfully']);
    }
    
    // Challenge during login
    public function challenge(Request $request)
    {
        $request->validate(['code' => 'required']);
        
        // Verify code based on user's two_factor_type...
        // Update last_login_at, clear failed_attempts
        
        return response()->json(['message' => 'Authenticated']);
    }
}
```

**Routes**: `backend/routes/api.php`
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('2fa')->group(function () {
        Route::post('/enable', [TwoFactorController::class, 'enable']);
        Route::post('/confirm', [TwoFactorController::class, 'confirm']);
        Route::post('/disable', [TwoFactorController::class, 'disable']);
    });
    Route::post('/2fa/challenge', [TwoFactorController::class, 'challenge']);
});
```

**Why**: RESTful API design—setup flow separate from auth flow, allows frontend flexibility.

---

### **PHASE 4: Admin Panel Backend** ⏱️ ~5-6 hours

#### **Step 4.1: User Management Controller**

**File**: `backend/app/Http/Controllers/Admin/UserController.php`

```php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:owner,pm']);
    }
    
    public function index(Request $request)
    {
        $query = User::with('roles')
            ->when($request->search, fn($q, $search) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            )
            ->when($request->role, fn($q, $role) =>
                $q->whereHas('roles', fn($q) => $q->where('name', $role))
            )
            ->when($request->status, fn($q, $status) =>
                $q->where('is_active', $status === 'active')
            );
        
        return $query->paginate($request->per_page ?? 20);
    }
    
    public function store(Request $request)
    {
        $this->authorize('users.create');
        
        $validated = $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'role' => 'required|exists:roles,name',
        ]);
        
        $user = User::create($validated);
        $user->assignRole($request->role);
        
        activity()
            ->performedOn($user)
            ->causedBy($request->user())
            ->log('user_created');
        
        return response()->json($user->load('roles'), 201);
    }
    
    public function ban(User $user)
    {
        $this->authorize('users.ban');
        
        $user->update(['is_active' => false]);
        activity()->performedOn($user)->log('user_banned');
        
        return response()->json(['message' => 'User banned']);
    }
}
```

**Routes**: `backend/routes/api.php`
```php
Route::prefix('admin')->middleware(['auth:sanctum', 'role:owner'])->group(function () {
    Route::apiResource('users', Admin\UserController::class);
    Route::post('users/{user}/ban', [Admin\UserController::class, 'ban']);
    Route::post('users/{user}/activate', [Admin\UserController::class, 'activate']);
});
```

**Why**: Admin prefix + role middleware at route group level = DRY security. Activity logging for audit.

---

#### **Step 4.2: Tool Approval Controller**

**File**: `backend/app/Http/Controllers/Admin/ToolApprovalController.php`

```php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use Illuminate\Http\Request;

class ToolApprovalController extends Controller
{
    public function pending(Request $request)
    {
        return Tool::with(['categories', 'roles', 'submittedBy'])
            ->where('status', 'pending')
            ->when($request->category, fn($q, $cat) =>
                $q->whereHas('categories', fn($q) => $q->where('slug', $cat))
            )
            ->latest()
            ->paginate(20);
    }
    
    public function approve(Tool $tool, Request $request)
    {
        $this->authorize('tools.approve');
        
        $tool->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);
        
        // Clear tool cache
        cache()->tags(['tools'])->flush();
        
        activity()
            ->performedOn($tool)
            ->causedBy($request->user())
            ->log('tool_approved');
        
        // Notify submitter
        if ($tool->submittedBy) {
            $tool->submittedBy->notify(new ToolApproved($tool));
        }
        
        return response()->json($tool);
    }
    
    public function reject(Tool $tool, Request $request)
    {
        $request->validate(['reason' => 'required|min:10']);
        
        $tool->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => $request->reason,
        ]);
        
        activity()->performedOn($tool)->log('tool_rejected');
        
        return response()->json($tool);
    }
}
```

**Routes**:
```php
Route::prefix('admin/tools')->middleware(['auth:sanctum', 'can:tools.approve'])->group(function () {
    Route::get('/pending', [ToolApprovalController::class, 'pending']);
    Route::post('/{tool}/approve', [ToolApprovalController::class, 'approve']);
    Route::post('/{tool}/reject', [ToolApprovalController::class, 'reject']);
});
```

**Why**: Permission-based middleware (`can:`) instead of role—more flexible. Cache invalidation on approval.

---

#### **Step 4.3: Activity Log Controller**

**File**: `backend/app/Http/Controllers/Admin/ActivityLogController.php`

```php
namespace App\Http\Controllers\Admin;

use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('audit.view');
        
        $query = Activity::with('causer', 'subject')
            ->when($request->user_id, fn($q, $userId) =>
                $q->where('causer_id', $userId)
            )
            ->when($request->event, fn($q, $event) =>
                $q->where('description', 'like', "%{$event}%")
            )
            ->when($request->from, fn($q, $from) =>
                $q->where('created_at', '>=', $from)
            )
            ->when($request->to, fn($q, $to) =>
                $q->where('created_at', '<=', $to)
            )
            ->latest();
        
        return $query->paginate(50);
    }
    
    public function export(Request $request)
    {
        $this->authorize('audit.export');
        
        // Generate CSV export...
        return response()->streamDownload(/* ... */);
    }
}
```

**Why**: Queryable audit log with export—compliance requirement for many industries.

---

### **PHASE 5: Redis Caching Strategy** ⏱️ ~3-4 hours

#### **Step 5.1: Update .env & Config**

**File**: `backend/.env`
```env
CACHE_STORE=redis
SESSION_DRIVER=redis
REDIS_CLIENT=phpredis
```

**Why**: phpredis extension is faster than predis (pure PHP).

---

#### **Step 5.2: Category/Tag Caching**

**File**: `backend/app/Http/Controllers/Api/CategoryController.php`

```php
public function index()
{
    return cache()->tags(['categories'])->remember('categories.all', 3600, function () {
        return Category::withCount('tools')->get();
    });
}

public function store(Request $request)
{
    $category = Category::create($request->validated());
    
    // Invalidate cache
    cache()->tags(['categories'])->flush();
    
    return response()->json($category, 201);
}
```

**Why**: Cache tags allow selective invalidation—updating one category doesn't bust tool cache.

---

#### **Step 5.3: Tool List Caching**

**File**: `backend/app/Http/Controllers/Api/ToolController.php`

```php
public function index(Request $request)
{
    $cacheKey = 'tools.' . md5(json_encode($request->all()));
    
    return cache()->tags(['tools'])->remember($cacheKey, 1800, function () use ($request) {
        return Tool::with(['categories', 'tags', 'roles'])
            ->where('status', 'approved')
            ->when($request->category, fn($q, $cat) =>
                $q->whereHas('categories', fn($q) => $q->where('slug', $cat))
            )
            ->when($request->search, fn($q, $search) =>
                $q->where('name', 'like', "%{$search}%")
            )
            ->paginate($request->per_page ?? 20);
    });
}
```

**Why**: Query-aware caching—different filters = different cache keys. Tagged for bulk invalidation.

---

#### **Step 5.4: Stats Caching**

**File**: `backend/app/Http/Controllers/Api/JournalController.php`

```php
public function stats(Request $request)
{
    $user = $request->user();
    $cacheKey = "journal.stats.{$user->id}";
    
    return cache()->remember($cacheKey, 300, function () use ($user) {
        return [
            'total_entries' => $user->journalEntries()->count(),
            'total_xp' => $user->journalEntries()->sum('xp'),
            'streak' => $this->calculateStreak($user),
            'mood_distribution' => $user->journalEntries()
                ->groupBy('mood')
                ->selectRaw('mood, count(*) as count')
                ->pluck('count', 'mood'),
        ];
    });
}

// Invalidate on create/delete
public function store(Request $request)
{
    $entry = $request->user()->journalEntries()->create($request->validated());
    cache()->forget("journal.stats.{$request->user()->id}");
    return response()->json($entry, 201);
}
```

**Why**: User-specific cache keys prevent data leakage. Short TTL (5min) balances freshness vs performance.

---

#### **Step 5.5: Rate Limiting with Redis**

**File**: `backend/app/Http/Kernel.php`

```php
protected $middlewareGroups = [
    'api' => [
        // ... existing
        \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
    ],
];
```

**File**: `backend/app/Providers/RouteServiceProvider.php`

```php
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('2fa', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip())->response(function () {
        return response()->json(['message' => 'Too many attempts'], 429);
    });
});
```

**Apply**: `Route::middleware('throttle:2fa')->post('/2fa/challenge', ...)`

**Why**: Redis-backed rate limiting scales horizontally—prevents brute force 2FA attacks.

---

### **PHASE 6: Frontend 2FA UI** ⏱️ ~4-5 hours

#### **Step 6.1: 2FA Setup Modal**

**File**: `frontend/components/TwoFactorSetup.tsx`

```tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';
import Button from './Button';

export default function TwoFactorSetup({ isOpen, onClose }) {
  const [step, setStep] = useState<'choose' | 'setup' | 'confirm'>('choose');
  const [method, setMethod] = useState<'totp' | 'email' | 'telegram'>('totp');
  const [qrCode, setQrCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [code, setCode] = useState('');

  const handleChooseMethod = async (selectedMethod) => {
    setMethod(selectedMethod);
    const res = await fetch('/api/2fa/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: selectedMethod }),
    });
    const data = await res.json();
    
    if (selectedMethod === 'totp') {
      setQrCode(data.qr_code);
      setRecoveryCodes(data.recovery_codes);
    }
    setStep('setup');
  };

  const handleConfirm = async () => {
    const res = await fetch('/api/2fa/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    if (res.ok) {
      onClose();
      // Show success toast
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {step === 'choose' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Enable Two-Factor Authentication</h2>
          <Button onClick={() => handleChooseMethod('totp')}>
            📱 Google Authenticator
          </Button>
          <Button onClick={() => handleChooseMethod('email')}>
            ✉️ Email OTP
          </Button>
          <Button onClick={() => handleChooseMethod('telegram')}>
            📲 Telegram Bot
          </Button>
        </div>
      )}
      
      {step === 'setup' && method === 'totp' && (
        <div>
          <h3>Scan QR Code</h3>
          <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
          <div>
            <h4>Recovery Codes (save these!):</h4>
            <ul>
              {recoveryCodes.map(code => <li key={code}>{code}</li>)}
            </ul>
          </div>
          <input 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code from app"
            maxLength={6}
          />
          <Button onClick={handleConfirm}>Verify & Enable</Button>
        </div>
      )}
    </Modal>
  );
}
```

**Why**: Multi-step wizard UX—clear progression, prevents user confusion.

---

#### **Step 6.2: Login Flow with 2FA Challenge**

**File**: `frontend/hooks/useAuth.ts` (modify existing)

```typescript
const login = async (email: string, password: string, twoFactorCode?: string) => {
  const res = await fetch('/api/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, two_factor_code: twoFactorCode }),
  });
  
  const data = await res.json();
  
  if (res.status === 202) {
    // 2FA required
    return { requires2FA: true, method: data.two_factor_type };
  }
  
  if (res.ok) {
    setUser(data.user);
    return { success: true };
  }
  
  throw new Error(data.message);
};
```

**File**: `frontend/components/LoginForm.tsx`

```tsx
const [requires2FA, setRequires2FA] = useState(false);
const [twoFactorMethod, setTwoFactorMethod] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const result = await login(email, password, twoFactorCode);
    
    if (result.requires2FA) {
      setRequires2FA(true);
      setTwoFactorMethod(result.method);
      return;
    }
    
    router.push('/dashboard');
  } catch (err) {
    setError(err.message);
  }
};

// Render 2FA input if required
{requires2FA && (
  <div>
    <p>Enter code from {twoFactorMethod}</p>
    <input 
      value={twoFactorCode}
      onChange={(e) => setTwoFactorCode(e.target.value)}
      placeholder="6-digit code"
    />
  </div>
)}
```

**Why**: Progressive enhancement—no 2FA = normal login, with 2FA = extra step.

---

### **PHASE 7: Admin Panel Frontend** ⏱️ ~6-8 hours

#### **Step 7.1: Admin Layout**

**File**: `frontend/pages/admin/index.tsx`

```tsx
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Role guard
  if (!user?.roles?.some(r => ['owner', 'pm'].includes(r.name))) {
    router.push('/');
    return null;
  }
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Pending Tools" value={12} icon="🔧" />
          <StatsCard title="Total Users" value={156} icon="👥" />
          <StatsCard title="Active Sessions" value={42} icon="🔐" />
        </div>
      </main>
    </div>
  );
}
```

**Why**: Role-based client-side guard + server-side API protection = defense in depth.

---

#### **Step 7.2: User Management Table**

**File**: `frontend/pages/admin/users.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import DataTable from '../../components/DataTable';

export default function AdminUsers() {
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const { users, loading, banUser, activateUser } = useAdminUsers(filters);
  
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { 
      key: 'roles', 
      label: 'Role',
      render: (user) => user.roles.map(r => r.name).join(', ')
    },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (user) => user.is_active ? '✅ Active' : '🚫 Banned'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <>
          <Button onClick={() => banUser(user.id)}>Ban</Button>
          <Button onClick={() => activateUser(user.id)}>Activate</Button>
        </>
      )
    }
  ];
  
  return (
    <div>
      <h1>User Management</h1>
      
      <Filters filters={filters} onChange={setFilters} />
      
      <DataTable 
        columns={columns}
        data={users}
        loading={loading}
      />
    </div>
  );
}
```

**Hook**: `frontend/hooks/useAdminUsers.ts` (RTK Query or custom fetch)

**Why**: Reusable DataTable component—DRY principle, consistent UX across admin pages.

---

#### **Step 7.3: Tool Approval Interface**

**File**: `frontend/pages/admin/tools/pending.tsx`

```tsx
import { useAdminTools } from '../../../hooks/useAdminTools';
import ToolCard from '../../../components/ToolCard';

export default function PendingTools() {
  const { pendingTools, approve, reject } = useAdminTools();
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  
  const handleApprove = async (toolId) => {
    await approve(toolId);
    // Show success toast
  };
  
  const handleReject = async (toolId) => {
    await reject(toolId, rejectionReason);
    setSelectedTool(null);
  };
  
  return (
    <div>
      <h1>Pending Tool Approvals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingTools.map(tool => (
          <div key={tool.id} className="border rounded p-4">
            <ToolCard tool={tool} />
            
            <div className="mt-4 flex gap-2">
              <Button variant="success" onClick={() => handleApprove(tool.id)}>
                ✅ Approve
              </Button>
              <Button variant="danger" onClick={() => setSelectedTool(tool)}>
                ❌ Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedTool && (
        <Modal isOpen onClose={() => setSelectedTool(null)}>
          <h3>Reject Tool: {selectedTool.name}</h3>
          <textarea 
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={4}
          />
          <Button onClick={() => handleReject(selectedTool.id)}>
            Confirm Rejection
          </Button>
        </Modal>
      )}
    </div>
  );
}
```

**Why**: Inline approval UX—admin sees tool preview and acts immediately without navigation.

---

#### **Step 7.4: Activity Log Viewer**

**File**: `frontend/pages/admin/audit.tsx`

```tsx
import { useActivityLog } from '../../hooks/useActivityLog';
import { useState } from 'react';

export default function AuditLog() {
  const [filters, setFilters] = useState({ user_id: '', event: '', from: '', to: '' });
  const { activities, loading } = useActivityLog(filters);
  
  return (
    <div>
      <h1>Activity Log</h1>
      
      <div className="flex gap-4 mb-4">
        <input 
          placeholder="User ID"
          value={filters.user_id}
          onChange={(e) => setFilters({...filters, user_id: e.target.value})}
        />
        <select 
          value={filters.event}
          onChange={(e) => setFilters({...filters, event: e.target.value})}
        >
          <option value="">All Events</option>
          <option value="login">Logins</option>
          <option value="tool_created">Tool Created</option>
          <option value="user_banned">User Banned</option>
        </select>
        <input type="date" onChange={(e) => setFilters({...filters, from: e.target.value})} />
        <input type="date" onChange={(e) => setFilters({...filters, to: e.target.value})} />
      </div>
      
      <table className="w-full">
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Event</th>
            <th>IP</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {activities.map(activity => (
            <tr key={activity.id}>
              <td>{new Date(activity.created_at).toLocaleString()}</td>
              <td>{activity.causer?.name}</td>
              <td>{activity.description}</td>
              <td>{activity.properties?.ip_address}</td>
              <td>
                <Button onClick={() => /* show details modal */}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Why**: Searchable, filterable audit log—essential for security incident response and compliance.

---

### **PHASE 8: Testing & Security Audit** ⏱️ ~4-5 hours

#### **Step 8.1: Unit Tests**

**File**: `backend/tests/Unit/TwoFactorServiceTest.php`

```php
namespace Tests\Unit;

use Tests\TestCase;
use App\Services\TwoFactorService;
use App\Models\User;

class TwoFactorServiceTest extends TestCase
{
    public function test_generates_valid_totp_secret()
    {
        $user = User::factory()->create();
        $service = app(TwoFactorService::class);
        
        $result = $service->generateSecret($user);
        
        $this->assertArrayHasKey('secret', $result);
        $this->assertArrayHasKey('qr_code', $result);
        $this->assertArrayHasKey('recovery_codes', $result);
        $this->assertCount(8, $result['recovery_codes']);
    }
    
    public function test_verifies_correct_totp_code()
    {
        $user = User::factory()->create([
            'two_factor_secret' => encrypt('JBSWY3DPEHPK3PXP')
        ]);
        
        $service = app(TwoFactorService::class);
        $totp = TOTP::create('JBSWY3DPEHPK3PXP');
        $code = $totp->now();
        
        $this->assertTrue($service->verify($user, $code));
    }
}
```

**Why**: Service layer testing—isolates business logic from HTTP layer.

---

#### **Step 8.2: Feature Tests**

**File**: `backend/tests/Feature/AdminToolApprovalTest.php`

```php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\{User, Tool};

class AdminToolApprovalTest extends TestCase
{
    public function test_owner_can_approve_tool()
    {
        $owner = User::factory()->create();
        $owner->assignRole('owner');
        
        $tool = Tool::factory()->create(['status' => 'pending']);
        
        $response = $this->actingAs($owner)
            ->postJson("/api/admin/tools/{$tool->id}/approve");
        
        $response->assertOk();
        $this->assertEquals('approved', $tool->fresh()->status);
    }
    
    public function test_non_owner_cannot_approve_tool()
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create(['status' => 'pending']);
        
        $response = $this->actingAs($user)
            ->postJson("/api/admin/tools/{$tool->id}/approve");
        
        $response->assertForbidden();
    }
}
```

**Why**: Permission testing—ensures RBAC works correctly.

---

#### **Step 8.3: Security Checklist**

**Manual Audit**:
- [ ] All admin routes protected by role/permission middleware
- [ ] 2FA codes expire after 5 minutes
- [ ] Rate limiting on sensitive endpoints (login, 2FA, password reset)
- [ ] CSRF protection enabled for state-changing requests
- [ ] SQL injection protected via Eloquent ORM
- [ ] XSS prevented via React escaping + CSP headers
- [ ] Sensitive data encrypted (2FA secrets, recovery codes)
- [ ] Activity logging on all privileged actions
- [ ] Session timeout configured (120 minutes)
- [ ] HTTPS enforced in production
- [ ] Security headers (HSTS, X-Frame-Options, etc.)
- [ ] Dependency audit (`composer audit`, `npm audit`)

**Automated**:
```bash
# Laravel security scan
composer require --dev enlightn/security-checker
php artisan security:check

# Frontend dependency audit
npm audit --production
```

**Why**: Layered security approach—no single point of failure.

---

## **🔧 IMPLEMENTATION ORDER & TIMELINE**

### **Week 1: Foundation (Backend)**
**Day 1-2**: Phase 1 (Migrations) + Phase 2 (Middleware)  
**Day 3-4**: Phase 3 (2FA Backend)  
**Day 5**: Phase 4 (Admin Controllers)

### **Week 2: Caching & Frontend**
**Day 6**: Phase 5 (Redis Caching)  
**Day 7-8**: Phase 6 (2FA UI)  
**Day 9-10**: Phase 7 (Admin Panel UI)

### **Week 3: Polish & Ship**
**Day 11-12**: Phase 8 (Testing)  
**Day 13**: Code review, documentation  
**Day 14**: Production deployment  
**Day 15**: Monitoring setup, smoke tests

---

## **📊 SUCCESS METRICS**

**Security**:
- 2FA adoption rate >80% for admin users
- Zero unauthorized access incidents
- <5s average 2FA verification time

**Performance**:
- Tool list load time <200ms (cached)
- Admin panel response time <500ms
- Cache hit rate >85%

**UX**:
- 2FA setup completion rate >90%
- Admin task completion time -50% vs manual
- Zero security-related user complaints

---

## **🚀 POST-LAUNCH ENHANCEMENTS**

1. **Biometric 2FA**: WebAuthn/FIDO2 support
2. **Advanced Audit**: Real-time alerts on suspicious activity
3. **Multi-tenancy**: Separate admin panels per organization
4. **ML Anomaly Detection**: Flag unusual access patterns
5. **Mobile App**: Native 2FA for better UX

---

**Това е senior-level имплементационен план следващ индустриални best practices. Готов съм да започна с който фаза предпочиташ или да отговоря на въпроси.**