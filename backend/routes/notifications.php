<?php

declare(strict_types=1);

use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

/**
 * Notification Routes (Protected - Requires Authentication)
 */
Route::middleware(['api', 'auth:sanctum'])->prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/unread', [NotificationController::class, 'unread'])->name('notifications.unread');
    Route::put('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::put('/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/{notification}', [NotificationController::class, 'delete'])->name('notifications.delete');
    Route::delete('/', [NotificationController::class, 'deleteAll'])->name('notifications.delete-all');

    // Preferences
    Route::get('/preferences', [NotificationController::class, 'preferences'])->name('notifications.preferences');
    Route::post('/preferences', [NotificationController::class, 'updatePreference'])->name('notifications.update-preference');
});
