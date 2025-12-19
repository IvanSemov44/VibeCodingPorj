<?php

declare(strict_types=1);

use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

/**
 * User Settings Routes
 * Prefix: /api/settings
 * Middleware: api, auth:sanctum
 */
Route::middleware(['api', 'auth:sanctum'])->prefix('settings')->group(function () {
    // Get user settings
    Route::get('/', [SettingsController::class, 'index'])->name('settings.index');

    // Update user settings
    Route::post('/', [SettingsController::class, 'update'])->name('settings.update');

    // Reset settings to defaults
    Route::post('/reset', [SettingsController::class, 'reset'])->name('settings.reset');

    // Manage saved filters
    Route::get('/filters', [SettingsController::class, 'getFilters'])->name('settings.filters.list');
    Route::post('/filters', [SettingsController::class, 'saveFilter'])->name('settings.filters.save');
    Route::delete('/filters/{name}', [SettingsController::class, 'deleteFilter'])->name('settings.filters.delete');
});
