<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Admin\ModerationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', 'auth:sanctum'])->prefix('admin/moderation')->group(function () {
    // Public endpoints (authenticated users)
    Route::post('/report', [ModerationController::class, 'reportContent'])->name('report.content');
    Route::post('/appeal/{action}', [ModerationController::class, 'createAppeal'])->name('appeal.create');

    // Admin endpoints
    Route::middleware(['admin_or_owner'])->group(function () {
        Route::get('/reports', [ModerationController::class, 'getReports'])->name('reports.list');
        Route::get('/reports/pending', [ModerationController::class, 'getPendingReports'])->name('reports.pending');
        Route::post('/reports/{report}/assign', [ModerationController::class, 'assignReport'])->name('report.assign');
        Route::post('/reports/{report}/decide', [ModerationController::class, 'makeDecision'])->name('report.decide');

        Route::post('/content/remove', [ModerationController::class, 'removeContent'])->name('content.remove');
        Route::post('/content/hide', [ModerationController::class, 'hideContent'])->name('content.hide');

        Route::post('/users/{user}/warn', [ModerationController::class, 'warnUser'])->name('user.warn');
        Route::post('/users/{user}/suspend', [ModerationController::class, 'suspendUser'])->name('user.suspend');
        Route::post('/users/{user}/ban', [ModerationController::class, 'banUser'])->name('user.ban');
        Route::post('/users/{user}/restore', [ModerationController::class, 'restoreUser'])->name('user.restore');

        Route::get('/users/{user}/status', [ModerationController::class, 'getUserStatus'])->name('user.status');
        Route::get('/users/{user}/actions', [ModerationController::class, 'getUserActions'])->name('user.actions');

        Route::get('/appeals/pending', [ModerationController::class, 'getPendingAppeals'])->name('appeals.pending');
        Route::post('/appeals/{appeal}/approve', [ModerationController::class, 'approveAppeal'])->name('appeal.approve');
        Route::post('/appeals/{appeal}/reject', [ModerationController::class, 'rejectAppeal'])->name('appeal.reject');

        Route::get('/statistics', [ModerationController::class, 'getStatistics'])->name('statistics');
        Route::get('/queue', [ModerationController::class, 'getQueue'])->name('queue');
    });
});
