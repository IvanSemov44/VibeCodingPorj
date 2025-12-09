<?php

// API routes intentionally left minimal. Use web routes for session-based SPA auth.

use Illuminate\Support\Facades\Route;

// Tools API (protected - authenticated users can create)
Route::middleware(['auth:sanctum'])->group(function () {
	Route::apiResource('tools', \App\Http\Controllers\Api\ToolController::class);
	Route::get('categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
	Route::get('roles', [\App\Http\Controllers\Api\RoleController::class, 'index']);
});

