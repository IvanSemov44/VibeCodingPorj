<?php

// API routes intentionally left minimal. Use web routes for session-based SPA auth.

use App\Models\User;
use Illuminate\Support\Facades\Route;

// Tools API (protected - authenticated users can create)
// Public discovery endpoints for categories and roles (useful for frontend filters)
// Health endpoints
Route::get('health', [\App\Http\Controllers\HealthController::class, 'health']);
Route::get('ready', [\App\Http\Controllers\HealthController::class, 'ready']);

Route::get('categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::get('roles', [\App\Http\Controllers\Api\RoleController::class, 'index']);
Route::get('tags', [\App\Http\Controllers\Api\TagController::class, 'index']);
// Public tools read endpoints for discovery (index + show).
// Keep the index (and show) public so frontend discovery works without auth.
Route::get('tools', [\App\Http\Controllers\Api\ToolController::class, 'index']);
Route::get('tools/{tool}', [\App\Http\Controllers\Api\ToolController::class, 'show']);

// -------------------------
// Auth + All Protected API endpoints (session-based)
// -------------------------
// Use explicit middleware for session-supporting API endpoints instead of
// referring to the group name. This avoids Laravel attempting to resolve
// the group string as a container binding in some environments.
Route::middleware([
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    \Illuminate\Session\Middleware\StartSession::class,
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    \Illuminate\View\Middleware\ShareErrorsFromSession::class,
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
])->group(function () {
    // Auth endpoints with rate limiting
    Route::post('register', [\App\Http\Controllers\Api\AuthController::class, 'register'])
        ->middleware('throttle:5,1'); // 5 attempts per minute
    Route::post('login', [\App\Http\Controllers\Api\AuthController::class, 'login'])
        ->middleware('throttle:5,1'); // 5 attempts per minute
    Route::post('logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::match(['get', 'post'], 'user', [\App\Http\Controllers\Api\AuthController::class, 'user']);

    // Protected routes - require authentication (session + sanctum)
    Route::middleware(['auth:sanctum'])->group(function () {
        // Tools CRUD (protected)
        Route::apiResource('tools', \App\Http\Controllers\Api\ToolController::class)->except(['index', 'show']);
        Route::post('tools/{tool}/screenshots', [\App\Http\Controllers\Api\ToolScreenshotController::class, 'store']);
        Route::delete('tools/{tool}/screenshots', [\App\Http\Controllers\Api\ToolScreenshotController::class, 'destroy']);

        // Admin: manage categories and tags (protected)
        Route::post('categories', [\App\Http\Controllers\Api\CategoryController::class, 'store']);
        Route::put('categories/{category}', [\App\Http\Controllers\Api\CategoryController::class, 'update']);
        Route::delete('categories/{category}', [\App\Http\Controllers\Api\CategoryController::class, 'destroy']);

        Route::post('tags', [\App\Http\Controllers\Api\TagController::class, 'store']);
        Route::put('tags/{tag}', [\App\Http\Controllers\Api\TagController::class, 'update']);
        Route::delete('tags/{tag}', [\App\Http\Controllers\Api\TagController::class, 'destroy']);

        // Comments (authenticated)
        Route::get('tools/{tool}/comments', [\App\Http\Controllers\Api\CommentController::class, 'index']);
        Route::post('tools/{tool}/comments', [\App\Http\Controllers\Api\CommentController::class, 'store'])
            ->middleware('throttle:10,60'); // 10 comments per hour
        Route::delete('comments/{comment}', [\App\Http\Controllers\Api\CommentController::class, 'destroy']);

        // Ratings
        Route::post('tools/{tool}/rating', [\App\Http\Controllers\Api\RatingController::class, 'store'])
            ->middleware('throttle:30,60'); // 30 ratings per hour (increased for testing)
        Route::delete('tools/{tool}/rating', [\App\Http\Controllers\Api\RatingController::class, 'destroy']);

        // Journal routes
        Route::get('journal', [\App\Http\Controllers\Api\JournalController::class, 'index']);
        Route::post('journal', [\App\Http\Controllers\Api\JournalController::class, 'store']);
        Route::get('journal/stats', [\App\Http\Controllers\Api\JournalController::class, 'stats']);
        Route::get('journal/{id}', [\App\Http\Controllers\Api\JournalController::class, 'show']);
        Route::put('journal/{id}', [\App\Http\Controllers\Api\JournalController::class, 'update']);
        Route::delete('journal/{id}', [\App\Http\Controllers\Api\JournalController::class, 'destroy']);

        // Two-Factor endpoints (setup + confirm + disable) - protected
        Route::post('2fa/enable', [\App\Http\Controllers\Api\TwoFactorController::class, 'enable']);
        Route::post('2fa/confirm', [\App\Http\Controllers\Api\TwoFactorController::class, 'confirm']);
        Route::post('2fa/disable', [\App\Http\Controllers\Api\TwoFactorController::class, 'disable']);
        // Return provisioning URI for existing TOTP secret (authenticated)
        Route::get('2fa/secret', [\App\Http\Controllers\Api\TwoFactorController::class, 'secret']);
        Route::get('2fa/qr-svg', [\App\Http\Controllers\Api\TwoFactorController::class, 'qrSvg']);

        // Admin routes: user management and tool approvals
        // Protect admin API endpoints with explicit middleware so only
        // users with the `admin` or `owner` role can access them.
        Route::middleware('admin_or_owner')->prefix('admin')->group(function () {
            Route::apiResource('users', \App\Http\Controllers\Admin\UserController::class)->only(['index', 'store']);
            Route::post('users/{user}/ban', [\App\Http\Controllers\Admin\UserController::class, 'ban']);
            // Backwards-compatible alias used by frontend: /deactivate -> ban
            Route::post('users/{user}/deactivate', [\App\Http\Controllers\Admin\UserController::class, 'ban']);
            Route::post('users/{user}/activate', [\App\Http\Controllers\Admin\UserController::class, 'activate']);
            Route::post('users/{user}/roles', [\App\Http\Controllers\Admin\UserController::class, 'setRoles']);

            // Admin 2FA management for specific users
            Route::get('users/{user}/2fa', [\App\Http\Controllers\Admin\TwoFactorController::class, 'show']);
            Route::post('users/{user}/2fa', [\App\Http\Controllers\Admin\TwoFactorController::class, 'store']);
            Route::delete('users/{user}/2fa', [\App\Http\Controllers\Admin\TwoFactorController::class, 'destroy']);

            // Admin tool approval endpoints & dashboard
            Route::get('tools/pending', [\App\Http\Controllers\Api\ToolController::class, 'pending']);
            Route::post('tools/{tool}/approve', [\App\Http\Controllers\Api\ToolController::class, 'approve']);
            Route::post('tools/{tool}/reject', [\App\Http\Controllers\Api\ToolController::class, 'reject']);

            // Comment moderation
            Route::post('comments/{comment}/moderate', [\App\Http\Controllers\Api\CommentController::class, 'moderate']);

            // Admin dashboard stats
            Route::get('stats', [\App\Http\Controllers\Admin\AdminController::class, 'stats']);
            // Admin activity feed
            Route::get('activities', [\App\Http\Controllers\Admin\ActivityController::class, 'index']);
            Route::get('activities/stats', [\App\Http\Controllers\Admin\ActivityController::class, 'stats']);
            Route::post('activities/export', [\App\Http\Controllers\Admin\ActivityController::class, 'export']);
            Route::get('exports/activities/{filename}', [\App\Http\Controllers\Admin\ActivityController::class, 'downloadExport'])->name('admin.exports.download');

            // Admin categories & tags management
            Route::get('categories/stats', [\App\Http\Controllers\Admin\CategoryController::class, 'stats']);
            Route::apiResource('categories', \App\Http\Controllers\Admin\CategoryController::class);

            Route::get('tags/stats', [\App\Http\Controllers\Admin\TagController::class, 'stats']);
            Route::apiResource('tags', \App\Http\Controllers\Admin\TagController::class);
        });
    });
});

// 2FA challenge (public - rate limited)
Route::post('2fa/challenge', [\App\Http\Controllers\Api\TwoFactorController::class, 'challenge'])
    ->middleware('throttle:10,1'); // 10 attempts per minute

// Telegram webhook (public endpoint) - set your bot webhook to this URL
Route::post('telegram/webhook', [\App\Http\Controllers\Api\TelegramWebhookController::class, 'handle']);

// Simple status endpoint relocated to API
Route::get('status', function () {
    return response()->json([
        'status' => 'ok',
        'time' => now()->toDateTimeString(),
    ]);
});
