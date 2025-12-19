<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class NotificationServiceTest extends TestCase
{
    use RefreshDatabase;

    private NotificationService $notificationService;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->notificationService = app(NotificationService::class);
        $this->user = User::factory()->create();
    }

    public function test_create_notification(): void
    {
        $notification = $this->notificationService->createNotification(
            user: $this->user,
            type: 'comment_created',
            data: ['comment_id' => 1, 'content' => 'Test']
        );

        $this->assertNotNull($notification->id);
        $this->assertEquals('comment_created', $notification->type);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'type' => 'comment_created',
        ]);
    }

    public function test_create_notification_for_multiple_users(): void
    {
        $users = User::factory()->count(3)->create();
        $userIds = $users->pluck('id')->toArray();

        $notifications = $this->notificationService->createNotificationForUsers(
            userIds: $userIds,
            type: 'tool_liked',
            data: ['tool_id' => 1]
        );

        $this->assertCount(3, $notifications);
        $this->assertEquals(3, Notification::where('type', 'tool_liked')->count());
    }

    public function test_get_unread_notifications(): void
    {
        $this->notificationService->createNotification(
            user: $this->user,
            type: 'comment_created',
            data: []
        );
        $this->notificationService->createNotification(
            user: $this->user,
            type: 'comment_created',
            data: []
        );

        $unread = $this->notificationService->getUnreadNotifications($this->user);

        $this->assertCount(2, $unread);
    }

    public function test_get_recent_notifications(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->notificationService->createNotification(
                user: $this->user,
                type: 'comment_created',
                data: ['index' => $i]
            );
        }

        $recent = $this->notificationService->getRecentNotifications($this->user, limit: 3);

        $this->assertCount(3, $recent);
    }

    public function test_mark_notification_as_read(): void
    {
        $notification = $this->notificationService->createNotification(
            user: $this->user,
            type: 'comment_created',
            data: []
        );

        $this->assertTrue($notification->isUnread());

        $this->notificationService->markAsRead($notification);

        $this->assertTrue($notification->fresh()->isRead());
    }

    public function test_mark_all_notifications_as_read(): void
    {
        $this->notificationService->createNotification($this->user, 'comment_created', []);
        $this->notificationService->createNotification($this->user, 'tool_liked', []);

        $this->notificationService->markAllAsRead($this->user);

        $this->assertEquals(
            0,
            $this->notificationService->getUnreadCount($this->user)
        );
    }

    public function test_delete_notification(): void
    {
        $notification = $this->notificationService->createNotification(
            user: $this->user,
            type: 'comment_created',
            data: []
        );

        $result = $this->notificationService->deleteNotification($notification);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_delete_all_notifications(): void
    {
        $this->notificationService->createNotification($this->user, 'comment_created', []);
        $this->notificationService->createNotification($this->user, 'tool_liked', []);

        $deleted = $this->notificationService->deleteAllNotifications($this->user);

        $this->assertEquals(2, $deleted);
        $this->assertEquals(0, Notification::where('user_id', $this->user->id)->count());
    }

    public function test_get_unread_count(): void
    {
        $this->notificationService->createNotification($this->user, 'comment_created', []);
        $this->notificationService->createNotification($this->user, 'tool_liked', []);

        $count = $this->notificationService->getUnreadCount($this->user);

        $this->assertEquals(2, $count);
    }

    public function test_get_or_create_preference(): void
    {
        $preference = $this->notificationService->getOrCreatePreference(
            user: $this->user,
            notificationType: 'comment_created'
        );

        $this->assertNotNull($preference->id);
        $this->assertTrue($preference->email_enabled);
        $this->assertTrue($preference->in_app_enabled);
    }

    public function test_is_notification_enabled(): void
    {
        // Default should be true
        $enabled = $this->notificationService->isNotificationEnabled(
            user: $this->user,
            type: 'comment_created',
            channel: 'email'
        );

        $this->assertTrue($enabled);
    }

    public function test_update_preference(): void
    {
        $preference = $this->notificationService->updatePreference(
            user: $this->user,
            notificationType: 'comment_created',
            channel: 'email',
            enabled: false
        );

        $this->assertFalse($preference->email_enabled);
        $this->assertTrue($preference->in_app_enabled);
    }

    public function test_get_user_preferences(): void
    {
        $this->notificationService->getOrCreatePreference($this->user, 'comment_created');
        $this->notificationService->getOrCreatePreference($this->user, 'tool_liked');

        $preferences = $this->notificationService->getUserPreferences($this->user);

        $this->assertCount(2, $preferences);
    }
}
