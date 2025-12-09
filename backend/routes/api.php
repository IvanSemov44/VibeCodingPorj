<?php

// API routes intentionally left minimal. Use web routes for session-based SPA auth.

use Illuminate\Support\Facades\Route;

// Tools API (protected - authenticated users can create)
// Public discovery endpoints for categories and roles (useful for frontend filters)
Route::get('categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::get('roles', [\App\Http\Controllers\Api\RoleController::class, 'index']);

Route::middleware(['auth:sanctum'])->group(function () {
	Route::apiResource('tools', \App\Http\Controllers\Api\ToolController::class);
	// Keep protected versions as well if needed for admin-specific behavior
	Route::get('categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
	Route::get('roles', [\App\Http\Controllers\Api\RoleController::class, 'index']);
});

