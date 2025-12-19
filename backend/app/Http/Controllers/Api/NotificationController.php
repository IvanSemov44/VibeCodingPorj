<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    /**
     * Get user's notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'limit' => 'integer|min:1|max:50',
            'days' => 'integer|min:1|max:90',
        ]);

        $notifications = $this->notificationService->getRecentNotifications(
            user: auth()->user(),
            days: $validated['days'] ?? 7,
            limit: $validated['limit'] ?? 20,
        );

        return response()->json([
            'data' => $notifications,
            'unread_count' => $this->notificationService->getUnreadCount(auth()->user()),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get unread notifications.
     */
    public function unread(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'limit' => 'integer|min:1|max:50',
        ]);

        $notifications = $this->notificationService->getUnreadNotifications(
            user: auth()->user(),
            limit: $validated['limit'] ?? 20,
        );

        return response()->json([
            'data' => $notifications,
            'count' => $notifications->count(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Notification $notification): JsonResponse
    {
        $this->authorize('view', $notification);

        $this->notificationService->markAsRead($notification);

        return response()->json([
            'message' => 'Notification marked as read',
            'data' => $notification,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): JsonResponse
    {
        $this->notificationService->markAllAsRead(auth()->user());

        return response()->json([
            'message' => 'All notifications marked as read',
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Delete a notification.
     */
    public function delete(Notification $notification): JsonResponse
    {
        $this->authorize('delete', $notification);

        $this->notificationService->deleteNotification($notification);

        return response()->json([
            'message' => 'Notification deleted',
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Delete all notifications.
     */
    public function deleteAll(): JsonResponse
    {
        $count = $this->notificationService->deleteAllNotifications(auth()->user());

        return response()->json([
            'message' => 'All notifications deleted',
            'deleted_count' => $count,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get notification preferences.
     */
    public function preferences(): JsonResponse
    {
        $preferences = $this->notificationService->getUserPreferences(auth()->user());

        return response()->json([
            'data' => $preferences,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Update notification preference.
     */
    public function updatePreference(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'channel' => 'required|in:email,in_app,push',
            'enabled' => 'required|boolean',
        ]);

        $preference = $this->notificationService->updatePreference(
            user: auth()->user(),
            notificationType: $validated['type'],
            channel: $validated['channel'],
            enabled: $validated['enabled'],
        );

        return response()->json([
            'message' => 'Preference updated',
            'data' => $preference,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
