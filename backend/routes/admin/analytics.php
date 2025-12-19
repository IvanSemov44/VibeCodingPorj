<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Admin\AnalyticsController;
use Illuminate\Support\Facades\Route;

/**
 * Analytics Routes
 * Prefix: /api/admin/analytics
 * Middleware: api, auth:sanctum, admin_or_owner
 */
Route::middleware(['api', 'auth:sanctum', 'admin_or_owner'])
    ->prefix('analytics')
    ->group(function () {
        Route::get('/dashboard', [AnalyticsController::class, 'dashboard'])->name('analytics.dashboard');
        Route::get('/health', [AnalyticsController::class, 'health'])->name('analytics.health');
        Route::get('/activity', [AnalyticsController::class, 'activity'])->name('analytics.activity');
        Route::get('/trending', [AnalyticsController::class, 'trending'])->name('analytics.trending');
        Route::get('/categories', [AnalyticsController::class, 'categories'])->name('analytics.categories');
        Route::get('/top-tools', [AnalyticsController::class, 'topTools'])->name('analytics.top-tools');
        Route::get('/top-pages', [AnalyticsController::class, 'topPages'])->name('analytics.top-pages');
        Route::get('/page-views', [AnalyticsController::class, 'pageViews'])->name('analytics.page-views');
        Route::get('/activities', [AnalyticsController::class, 'userActivities'])->name('analytics.activities');
        Route::get('/user/{user}/engagement', [AnalyticsController::class, 'userEngagement'])->name('analytics.user.engagement');
    });
