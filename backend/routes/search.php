<?php

declare(strict_types=1);

use App\Http\Controllers\Api\SearchController;
use Illuminate\Support\Facades\Route;

/**
 * Search Routes
 */
Route::middleware(['api'])->prefix('search')->group(function () {
    Route::get('/', [SearchController::class, 'search'])->name('search.search');
    Route::get('/suggestions', [SearchController::class, 'suggestions'])->name('search.suggestions');
    Route::get('/trending', [SearchController::class, 'trending'])->name('search.trending');
    Route::get('/popular', [SearchController::class, 'popular'])->name('search.popular');
});
