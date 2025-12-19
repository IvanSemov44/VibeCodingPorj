<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ContentReport;
use App\Models\ModerationAction;
use App\Models\ModerationAppeal;
use App\Models\User;
use Tests\TestCase;

class ModerationEndpointTest extends TestCase
{
    public function test_report_content_requires_auth(): void
    {
        $response = $this->postJson('/api/admin/moderation/report', [
            'reportable_type' => 'Tool',
            'reportable_id' => 1,
            'reason' => 'spam',
        ]);

        $response->assertUnauthorized();
    }

    public function test_report_content_validates_input(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/admin/moderation/report', [
            'reportable_type' => 'Invalid',
            'reportable_id' => 'not-an-int',
            'reason' => 'invalid-reason',
        ]);

        $response->assertUnprocessable();
    }

    public function test_user_can_report_content(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/admin/moderation/report', [
            'reportable_type' => 'Tool',
            'reportable_id' => 1,
            'reason' => 'spam',
            'description' => 'Test report',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('content_reports', [
            'user_id' => $user->id,
            'reason' => 'spam',
        ]);
    }

    public function test_get_reports_requires_admin(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/admin/moderation/reports');

        $response->assertForbidden();
    }

    public function test_admin_can_get_reports(): void
    {
        $admin = User::factory()->admin()->create();
        $reporter = User::factory()->create();

        ContentReport::factory()->create(['user_id' => $reporter->id]);

        $response = $this->actingAs($admin)->getJson('/api/admin/moderation/reports');

        $response->assertOk();
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_filter_reports_by_status(): void
    {
        $admin = User::factory()->admin()->create();

        ContentReport::factory()->create(['status' => 'pending']);
        ContentReport::factory()->create(['status' => 'resolved']);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/moderation/reports?status=pending');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertTrue(collect($data)->every(fn ($r) => $r['status'] === 'pending'));
    }

    public function test_get_pending_reports(): void
    {
        $admin = User::factory()->admin()->create();

        ContentReport::factory()->create(['status' => 'pending']);
        ContentReport::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)->getJson('/api/admin/moderation/reports/pending');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_assign_report(): void
    {
        $admin = User::factory()->admin()->create();
        $report = ContentReport::factory()->create();

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/moderation/reports/{$report->id}/assign");

        $response->assertOk();
        $this->assertTrue($report->fresh()->queueItem()->isAssigned());
    }

    public function test_make_moderation_decision(): void
    {
        $admin = User::factory()->admin()->create();
        $report = ContentReport::factory()->create();

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/moderation/reports/{$report->id}/decide", [
                'decision' => 'approve_action',
                'reasoning' => 'Content violates policy',
            ]);

        $response->assertOk();
        $this->assertEquals('resolved', $report->fresh()->status);
    }

    public function test_remove_content(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson('/api/admin/moderation/content/remove', [
            'content_type' => 'Tool',
            'content_id' => 1,
            'reason' => 'Policy violation',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('moderation_actions', [
            'action' => 'content_remove',
        ]);
    }

    public function test_hide_content(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson('/api/admin/moderation/content/hide', [
            'content_type' => 'Comment',
            'content_id' => 1,
            'reason' => 'Inappropriate content',
        ]);

        $response->assertCreated();
    }

    public function test_warn_user(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->create();

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/moderation/users/{$targetUser->id}/warn", [
                'reason' => 'Behavior warning',
            ]);

        $response->assertCreated();
    }

    public function test_suspend_user(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->create();

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/moderation/users/{$targetUser->id}/suspend", [
                'duration_days' => 7,
                'reason' => 'Policy violation',
            ]);

        $response->assertCreated();
        $this->assertTrue($targetUser->moderationStatus->isSuspended());
    }

    public function test_ban_user(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->create();

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/moderation/users/{$targetUser->id}/ban", [
                'reason' => 'Permanent ban',
            ]);

        $response->assertCreated();
        $this->assertTrue($targetUser->moderationStatus->isBanned());
    }

    public function test_restore_user(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->create();

        // First suspend
        $this->actingAs($admin)
            ->postJson("/api/admin/moderation/users/{$targetUser->id}/suspend", [
                'duration_days' => 7,
                'reason' => 'Test',
            ]);

        // Then restore
        $response = $this->actingAs($admin)
            ->postJson("/api/admin/moderation/users/{$targetUser->id}/restore", [
                'reason' => 'Appeal approved',
            ]);

        $response->assertCreated();
        $this->assertFalse($targetUser->moderationStatus->isSuspended());
    }

    public function test_get_user_status(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->create();

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/moderation/users/{$targetUser->id}/status");

        $response->assertOk();
    }

    public function test_get_user_actions(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->create();

        ModerationAction::factory()->create(['user_id' => $targetUser->id]);

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/moderation/users/{$targetUser->id}/actions");

        $response->assertOk();
    }

    public function test_user_can_create_appeal(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();

        $action = ModerationAction::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->postJson("/api/admin/moderation/appeal/{$action->id}", [
                'reason' => 'Unfair suspension',
            ]);

        $response->assertCreated();
    }

    public function test_get_pending_appeals(): void
    {
        $admin = User::factory()->admin()->create();

        ModerationAppeal::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/moderation/appeals/pending');

        $response->assertOk();
    }

    public function test_admin_can_approve_appeal(): void
    {
        $admin = User::factory()->admin()->create();
        $appeal = ModerationAppeal::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/moderation/appeals/{$appeal->id}/approve", [
                'notes' => 'Appeal is valid',
            ]);

        $response->assertOk();
        $this->assertTrue($appeal->fresh()->isApproved());
    }

    public function test_admin_can_reject_appeal(): void
    {
        $admin = User::factory()->admin()->create();
        $appeal = ModerationAppeal::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/moderation/appeals/{$appeal->id}/reject", [
                'notes' => 'Not valid',
            ]);

        $response->assertOk();
        $this->assertTrue($appeal->fresh()->isRejected());
    }

    public function test_get_statistics(): void
    {
        $admin = User::factory()->admin()->create();

        ContentReport::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/moderation/statistics');

        $response->assertOk();
        $this->assertArrayHasKey('pending_reports', $response->json('data'));
    }

    public function test_get_queue(): void
    {
        $admin = User::factory()->admin()->create();

        ContentReport::factory()->create();

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/moderation/queue');

        $response->assertOk();
    }

    public function test_filter_queue_by_priority(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/moderation/queue?priority=urgent');

        $response->assertOk();
    }

    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        $user = User::factory()->create();

        $endpoints = [
            'get' => [
                '/api/admin/moderation/reports',
                '/api/admin/moderation/statistics',
                '/api/admin/moderation/queue',
            ],
            'post' => [
                '/api/admin/moderation/content/remove',
                '/api/admin/moderation/users/1/ban',
            ],
        ];

        foreach ($endpoints['get'] as $endpoint) {
            $this->actingAs($user)->getJson($endpoint)->assertForbidden();
        }

        foreach ($endpoints['post'] as $endpoint) {
            $this->actingAs($user)->postJson($endpoint, [])->assertForbidden();
        }
    }
}
