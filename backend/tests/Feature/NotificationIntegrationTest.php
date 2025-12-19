<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_workflow(): void
    {
        $user = User::factory()->create();
        $user->updatePreference('notifications_enabled', true);

        $notification = Notification::factory()->create([
            'user_id' => $user->id,
            'type' => 'tool_created',
        ]);

        $response = $this->actingAs($user)->getJson('/api/notifications');

        $response->assertOk();
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_mark_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->create([
            'user_id' => $user->id,
            'read_at' => null,
        ]);

        $this->actingAs($user)->putJson(
            "/api/notifications/{$notification->id}",
            ['read' => true]
        )->assertOk();

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_unread_notification_count(): void
    {
        $user = User::factory()->create();

        Notification::factory(3)->create([
            'user_id' => $user->id,
            'read_at' => null,
        ]);

        $response = $this->actingAs($user)->getJson('/api/notifications/count');

        $response->assertOk();
        $this->assertEquals(3, $response->json('data.unread_count'));
    }

    public function test_notification_preferences_respected(): void
    {
        $user = User::factory()->create();
        $user->updatePreference('notifications_enabled', false);

        $response = $this->actingAs($user)->getJson('/api/notifications');

        $response->assertOk();
        // Should still have endpoint access, but check preferences
    }

    public function test_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create();

        Notification::factory(3)->create([
            'user_id' => $user->id,
            'read_at' => null,
        ]);

        $this->actingAs($user)->postJson('/api/notifications/mark-all-read')->assertOk();

        $unreadCount = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        $this->assertEquals(0, $unreadCount);
    }
}
