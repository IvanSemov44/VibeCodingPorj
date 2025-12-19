<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class NotificationEndpointTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_get_notifications_requires_authentication(): void
    {
        $response = $this->getJson('/api/notifications');

        $response->assertStatus(401);
    }

    public function test_get_notifications(): void
    {
        $notificationService = app(\App\Services\NotificationService::class);
        $notificationService->createNotification(
            user: $this->user,
            type: 'comment_created',
            data: ['comment_id' => 1]
        );

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/notifications');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'unread_count',
            'timestamp',
        ]);
    }

    public function test_get_unread_notifications(): void
    {
        $notificationService = app(\App\Services\NotificationService::class);
        $notificationService->createNotification($this->user, 'comment_created', []);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/notifications/unread');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'count',
            'timestamp',
        ]);
    }

    public function test_mark_notification_as_read(): void
    {
        $notificationService = app(\App\Services\NotificationService::class);
        $notification = $notificationService->createNotification(
            user: $this->user,
            type: 'comment_created',
            data: []
        );

        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(200);
    }

    public function test_mark_all_as_read(): void
    {
        $notificationService = app(\App\Services\NotificationService::class);
        $notificationService->createNotification($this->user, 'comment_created', []);

        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson('/api/notifications/read-all');

        $response->assertStatus(200);
    }

    public function test_delete_notification(): void
    {
        $notificationService = app(\App\Services\NotificationService::class);
        $notification = $notificationService->createNotification(
            user: $this->user,
            type: 'comment_created',
            data: []
        );

        $response = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/notifications/{$notification->id}");

        $response->assertStatus(200);
    }

    public function test_delete_all_notifications(): void
    {
        $notificationService = app(\App\Services\NotificationService::class);
        $notificationService->createNotification($this->user, 'comment_created', []);

        $response = $this->actingAs($this->user, 'sanctum')
            ->deleteJson('/api/notifications');

        $response->assertStatus(200);
    }

    public function test_get_preferences(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/notifications/preferences');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data', 'timestamp']);
    }

    public function test_update_preference(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/notifications/preferences', [
                'type' => 'comment_created',
                'channel' => 'email',
                'enabled' => false,
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('notification_preferences', [
            'user_id' => $this->user->id,
            'notification_type' => 'comment_created',
            'email_enabled' => false,
        ]);
    }

    public function test_notifications_pagination(): void
    {
        $notificationService = app(\App\Services\NotificationService::class);
        for ($i = 0; $i < 5; $i++) {
            $notificationService->createNotification($this->user, 'comment_created', []);
        }

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/notifications?limit=2');

        $response->assertStatus(200);
    }

    public function test_notifications_by_days_filter(): void
    {
        $notificationService = app(\App\Services\NotificationService::class);
        $notificationService->createNotification($this->user, 'comment_created', []);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/notifications?days=7');

        $response->assertStatus(200);
    }
}
