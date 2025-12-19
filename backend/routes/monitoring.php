<?php

declare(strict_types=1);

use App\Http\Controllers\Health\HealthCheckController;
use App\Http\Controllers\Monitoring\MetricsController;
use Illuminate\Support\Facades\Route;

/**
 * Health Check Routes
 */
Route::middleware(['api'])->prefix('health')->group(function () {
    Route::get('/', [HealthCheckController::class, 'index'])->name('health.index');
    Route::get('/database', [HealthCheckController::class, 'database'])->name('health.database');
    Route::get('/cache', [HealthCheckController::class, 'cache'])->name('health.cache');
    Route::get('/redis', [HealthCheckController::class, 'redis'])->name('health.redis');
    Route::get('/storage', [HealthCheckController::class, 'storage'])->name('health.storage');
});

/**
 * Metrics Routes
 */
Route::middleware(['api', 'auth:sanctum'])->prefix('metrics')->group(function () {
    Route::get('/', [MetricsController::class, 'index'])->name('metrics.index');
    Route::get('/requests', [MetricsController::class, 'requests'])->name('metrics.requests');
    Route::get('/database', [MetricsController::class, 'database'])->name('metrics.database');
    Route::get('/queue', [MetricsController::class, 'queue'])->name('metrics.queue');
    Route::get('/cache', [MetricsController::class, 'cache'])->name('metrics.cache');
    Route::get('/errors', [MetricsController::class, 'errors'])->name('metrics.errors');
    Route::get('/uptime', [MetricsController::class, 'uptime'])->name('metrics.uptime');
});
