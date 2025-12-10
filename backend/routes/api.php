<?php

// API routes intentionally left minimal. Use web routes for session-based SPA auth.

use Illuminate\Support\Facades\Route;

// Tools API (protected - authenticated users can create)
// Public discovery endpoints for categories and roles (useful for frontend filters)
// Simple health check for quick verification from the frontend or curl
Route::get('health', function () {
	return response()->json(['ok' => true]);
});
Route::get('categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::get('roles', [\App\Http\Controllers\Api\RoleController::class, 'index']);
// Public tools read endpoints for discovery (index + show).
// Keep the index (and show) public so frontend discovery works without auth.
Route::get('tools', [\App\Http\Controllers\Api\ToolController::class, 'index']);
Route::get('tools/{tool}', [\App\Http\Controllers\Api\ToolController::class, 'show']);

// (Removed) `/api/public/tools` was redundant; use `/api/tools` (index/show public)

// Protected tool actions (store, update, destroy) live behind Sanctum
Route::middleware(['auth:sanctum'])->group(function () {
	// Create, update, delete are protected. Index & show remain public above.
	Route::apiResource('tools', \App\Http\Controllers\Api\ToolController::class)->except(['index', 'show']);

	// Protected discovery endpoints if needed for admin behavior
	Route::get('categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
	Route::get('roles', [\App\Http\Controllers\Api\RoleController::class, 'index']);
});

// -------------------------
// Auth + Journal endpoints
// -------------------------
// Use explicit middleware for session-supporting API endpoints instead of
// referring to the group name. This avoids Laravel attempting to resolve
// the group string as a container binding in some environments.
Route::middleware([
	\Illuminate\Cookie\Middleware\EncryptCookies::class,
	\Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
	\Illuminate\Session\Middleware\StartSession::class,
	\Illuminate\View\Middleware\ShareErrorsFromSession::class,
	\Illuminate\Routing\Middleware\SubstituteBindings::class,
])->group(function () {
	Route::post('register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
	Route::post('login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
	Route::post('logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
	Route::match(['get','post'], 'user', [\App\Http\Controllers\Api\AuthController::class, 'user']);

	// (debug route removed) programmatic login route used during troubleshooting

	// Journal routes - require authentication (session + sanctum)
	Route::middleware(['auth:sanctum'])->group(function () {
		Route::get('journal', [\App\Http\Controllers\Api\JournalController::class, 'index']);
		Route::post('journal', [\App\Http\Controllers\Api\JournalController::class, 'store']);
		Route::get('journal/stats', [\App\Http\Controllers\Api\JournalController::class, 'stats']);
		Route::get('journal/{id}', [\App\Http\Controllers\Api\JournalController::class, 'show']);
		Route::put('journal/{id}', [\App\Http\Controllers\Api\JournalController::class, 'update']);
		Route::delete('journal/{id}', [\App\Http\Controllers\Api\JournalController::class, 'destroy']);
	});
});

// Simple status endpoint relocated to API
Route::get('status', function () {
	return response()->json([
		'status' => 'ok',
		'time' => now()->toDateTimeString(),
	]);
});

