<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return view('welcome');
});

// Simple status endpoint for quick health checks
Route::get('/api/status', function () {
    return response()->json([
        'status' => 'ok',
        'time' => now()->toDateTimeString(),
    ]);
});

// The `/sanctum/csrf-cookie` route is provided by Laravel Sanctum
// and must not be overridden here. Sanctum's own route handler
// will set the `XSRF-TOKEN` cookie needed by SPA clients.
// If you added a custom route that returns JSON only, remove it —
// a JSON response will not set the cookie and SPA auth will fail.

// SPA auth routes - use web middleware
Route::middleware(['web'])->group(function () {
    Route::post('/api/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('/api/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('/api/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::match(['get', 'post'], '/api/user', [\App\Http\Controllers\Api\AuthController::class, 'user']);

    // Journal routes - require authentication
    Route::get('/api/journal', [\App\Http\Controllers\Api\JournalController::class, 'index']);
    Route::post('/api/journal', [\App\Http\Controllers\Api\JournalController::class, 'store']);
    Route::get('/api/journal/stats', [\App\Http\Controllers\Api\JournalController::class, 'stats']);
    Route::get('/api/journal/{id}', [\App\Http\Controllers\Api\JournalController::class, 'show']);
    Route::put('/api/journal/{id}', [\App\Http\Controllers\Api\JournalController::class, 'update']);
    Route::delete('/api/journal/{id}', [\App\Http\Controllers\Api\JournalController::class, 'destroy']);
});
