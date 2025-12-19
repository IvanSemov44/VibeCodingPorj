<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

final class NotificationService
{
    /**
     * Create a notification for a user.
     *
     * @param array<string, mixed> $data
     */
    public function createNotification(
        User $user,
        string $type,
        array $data,
    ): Notification {
        return Notification::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'type' => $type,
            'data' => $data,
        ]);
    }

    /**
     * Create notifications for multiple users.
     *
     * @param array<int, int> $userIds
     * @param array<string, mixed> $data
     * @return Collection<int, Notification>
     */
    public function createNotificationForUsers(
        array $userIds,
        string $type,
        array $data,
    ): Collection {
        $notifications = array_map(
            fn (int $userId) => [
                'id' => Str::uuid(),
                'user_id' => $userId,
                'type' => $type,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            $userIds
        );

        Notification::insert($notifications);

        return Notification::whereIn('user_id', $userIds)
            ->where('type', $type)
            ->latest()
            ->limit(count($userIds))
            ->get();
    }

    /**
     * Get unread notifications for a user.
     *
     * @return Collection<int, Notification>
     */
    public function getUnreadNotifications(User $user, int $limit = 20): Collection
    {
        return $user->notifications()
            ->unread()
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get recent notifications for a user.
     *
     * @return Collection<int, Notification>
     */
    public function getRecentNotifications(User $user, int $days = 7, int $limit = 30): Collection
    {
        return $user->notifications()
            ->recent($days)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Notification $notification): void
    {
        $notification->markAsRead();
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllAsRead(User $user): void
    {
        $user->notifications()
            ->unread()
            ->update(['read_at' => now()]);
    }

    /**
     * Delete a notification.
     */
    public function deleteNotification(Notification $notification): bool
    {
        return (bool) $notification->delete();
    }

    /**
     * Delete all notifications for a user.
     */
    public function deleteAllNotifications(User $user): int
    {
        return $user->notifications()->delete();
    }

    /**
     * Get unread notification count.
     */
    public function getUnreadCount(User $user): int
    {
        return $user->notifications()->unread()->count();
    }

    /**
     * Get or create notification preference.
     */
    public function getOrCreatePreference(
        User $user,
        string $notificationType,
    ): NotificationPreference {
        return NotificationPreference::firstOrCreate(
            [
                'user_id' => $user->id,
                'notification_type' => $notificationType,
            ],
            [
                'email_enabled' => true,
                'in_app_enabled' => true,
                'push_enabled' => true,
            ]
        );
    }

    /**
     * Check if notification is enabled for user and channel.
     */
    public function isNotificationEnabled(
        User $user,
        string $type,
        string $channel = 'in_app',
    ): bool {
        $preference = NotificationPreference::where('user_id', $user->id)
            ->where('notification_type', $type)
            ->first();

        if ($preference === null) {
            // Default to enabled if no preference set
            return true;
        }

        return $preference->isEnabledForChannel($channel);
    }

    /**
     * Update notification preference.
     */
    public function updatePreference(
        User $user,
        string $notificationType,
        string $channel,
        bool $enabled,
    ): NotificationPreference {
        $preference = $this->getOrCreatePreference($user, $notificationType);

        $columnMap = [
            'email' => 'email_enabled',
            'in_app' => 'in_app_enabled',
            'push' => 'push_enabled',
        ];

        if (isset($columnMap[$channel])) {
            $preference->update([
                $columnMap[$channel] => $enabled,
            ]);
        }

        return $preference;
    }

    /**
     * Get all preferences for a user.
     *
     * @return Collection<int, NotificationPreference>
     */
    public function getUserPreferences(User $user): Collection
    {
        return NotificationPreference::where('user_id', $user->id)->get();
    }

    /**
     * Broadcast notification to WebSocket.
     */
    public function broadcastNotification(Notification $notification): void
    {
        broadcast(new \App\Events\NotificationCreated($notification))->toOthers();
    }
}
