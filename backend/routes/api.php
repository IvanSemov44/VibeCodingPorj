<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Admin\AnalyticsController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\ToolController;
use App\Http\Controllers\Api\ToolScreenshotController;
use App\Http\Controllers\Api\TwoFactorController;
use App\Http\Controllers\Api\TelegramWebhookController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

// Public health endpoints
Route::get('health', [HealthController::class, 'health']);
Route::get('ready', [HealthController::class, 'ready']);

// Public discovery endpoints
Route::get('categories', [CategoryController::class, 'index']);
Route::get('roles', [RoleController::class, 'index']);
Route::get('tags', [TagController::class, 'index']);

// Public tools endpoints (read-only)
Route::get('tools', [ToolController::class, 'index']);
Route::get('tools/{tool}', [ToolController::class, 'show']);
Route::get('tools/{tool}/comments', [CommentController::class, 'index']);
Route::get('tools/{tool}/ratings', [RatingController::class, 'index']);
Route::get('tools/{tool}/ratings/summary', [RatingController::class, 'summary']);

// Session-based authenticated routes
Route::middleware([
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    \Illuminate\Session\Middleware\StartSession::class,
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    \Illuminate\View\Middleware\ShareErrorsFromSession::class,
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
])->group(function () {
    // Auth endpoints
    Route::post('register', [AuthController::class, 'register'])
        ->middleware('throttle:5,1');
    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');
    Route::post('logout', [AuthController::class, 'logout']);
    Route::match(['get', 'post'], 'user', [AuthController::class, 'user']);

    // 2FA challenge (public under session group)
    Route::post('2fa/challenge', [TwoFactorController::class, 'challenge'])
        ->middleware('throttle:10,1');

    // Protected authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        // Tools CRUD
        Route::post('tools', [ToolController::class, 'store']);
        Route::put('tools/{tool}', [ToolController::class, 'update']);
        Route::delete('tools/{tool}', [ToolController::class, 'destroy']);
        Route::post('tools/{tool}/screenshots', [ToolScreenshotController::class, 'store']);
        Route::delete('tools/{tool}/screenshots/{screenshot}', [ToolScreenshotController::class, 'destroy']);

        // Categories management
        Route::post('categories', [CategoryController::class, 'store']);
        Route::put('categories/{category}', [CategoryController::class, 'update']);
        Route::delete('categories/{category}', [CategoryController::class, 'destroy']);

        // Tags management
        Route::post('tags', [TagController::class, 'store']);
        Route::put('tags/{tag}', [TagController::class, 'update']);
        Route::delete('tags/{tag}', [TagController::class, 'destroy']);

        // Comments endpoints
        Route::post('tools/{tool}/comments', [CommentController::class, 'store'])
            ->middleware('throttle:10,60');
        Route::get('comments/{comment}', [CommentController::class, 'show']);
        Route::put('comments/{comment}', [CommentController::class, 'update']);
        Route::delete('comments/{comment}', [CommentController::class, 'destroy']);

        // Ratings endpoints
        Route::post('tools/{tool}/ratings', [RatingController::class, 'store'])
            ->middleware('throttle:30,60');
        Route::delete('ratings/{rating}', [RatingController::class, 'destroy']);

        // Journal endpoints
        Route::get('journal', [JournalController::class, 'index']);
        Route::post('journal', [JournalController::class, 'store']);
        Route::get('journal/stats', [JournalController::class, 'stats']);
        Route::get('journal/{entry}', [JournalController::class, 'show']);
        Route::put('journal/{entry}', [JournalController::class, 'update']);
        Route::delete('journal/{entry}', [JournalController::class, 'destroy']);

        // Two-Factor management
        Route::post('2fa/enable', [TwoFactorController::class, 'enable']);
        Route::post('2fa/confirm', [TwoFactorController::class, 'confirm']);
        Route::post('2fa/disable', [TwoFactorController::class, 'disable']);
        Route::get('2fa/secret', [TwoFactorController::class, 'secret']);
        Route::get('2fa/qr-svg', [TwoFactorController::class, 'qrSvg']);

        // Admin routes (protected by admin_or_owner middleware)
        Route::middleware('admin_or_owner')->prefix('admin')->group(function () {
            // User management
            Route::get('users', [AdminUserController::class, 'index']);
            Route::get('users/{user}', [AdminUserController::class, 'show']);
            Route::post('users/{user}/ban', [AdminUserController::class, 'ban']);
            Route::post('users/{user}/unban', [AdminUserController::class, 'unban']);
            Route::post('users/{user}/roles', [AdminUserController::class, 'setRoles']);
            Route::delete('users/{user}', [AdminUserController::class, 'destroy']);

            // Analytics endpoints
            Route::get('analytics/dashboard', [AnalyticsController::class, 'dashboard']);
            Route::get('analytics/tools', [AnalyticsController::class, 'tools']);
            Route::get('analytics/users', [AnalyticsController::class, 'users']);
            Route::get('analytics/activity', [AnalyticsController::class, 'activity']);

            // Comment moderation
            Route::post('comments/{comment}/moderate', [CommentController::class, 'moderate']);

            // Tool approval
            Route::get('tools/pending', [ToolController::class, 'pending']);
            Route::post('tools/{tool}/approve', [ToolController::class, 'approve']);
            Route::post('tools/{tool}/reject', [ToolController::class, 'reject']);
        });
    });
});

// Telegram webhook (public)
Route::post('telegram/webhook', [TelegramWebhookController::class, 'handle']);

// Status endpoint
Route::get('status', function () {
    return response()->json([
        'status' => 'ok',
        'time' => now()->toDateTimeString(),
    ]);
});

// Include monitoring routes
require __DIR__ . '/monitoring.php';
