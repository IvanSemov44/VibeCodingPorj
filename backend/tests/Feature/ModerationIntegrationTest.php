<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ContentReport;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModerationIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_moderation_workflow(): void
    {
        // Setup
        $reporter = User::factory()->create();
        $author = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();

        $tool = Tool::factory()->create([
            'user_id' => $author->id,
            'category_id' => $category->id,
        ]);

        // Step 1: User reports content
        $reportResponse = $this->actingAs($reporter)->postJson(
            '/api/admin/moderation/report',
            [
                'reportable_type' => 'Tool',
                'reportable_id' => $tool->id,
                'reason' => 'spam',
                'description' => 'This is spam content',
                'reported_user_id' => $author->id,
            ]
        );

        $reportResponse->assertCreated();
        $reportId = $reportResponse->json('data.id');

        // Step 2: Admin views pending reports
        $listResponse = $this->actingAs($admin)->getJson(
            '/api/admin/moderation/reports/pending'
        );

        $listResponse->assertOk();
        $this->assertNotEmpty($listResponse->json('data'));

        // Step 3: Admin assigns report
        $this->actingAs($admin)->postJson(
            "/api/admin/moderation/reports/{$reportId}/assign"
        )->assertOk();

        // Step 4: Admin makes decision
        $decisionResponse = $this->actingAs($admin)->postJson(
            "/api/admin/moderation/reports/{$reportId}/decide",
            [
                'decision' => 'approve_action',
                'reasoning' => 'Content violates policy',
            ]
        );

        $decisionResponse->assertOk();

        // Step 5: Admin removes content
        $this->actingAs($admin)->postJson(
            '/api/admin/moderation/content/remove',
            [
                'content_type' => 'Tool',
                'content_id' => $tool->id,
                'reason' => 'Policy violation',
            ]
        )->assertCreated();

        // Step 6: Check moderation status
        $statusResponse = $this->actingAs($admin)->getJson(
            "/api/admin/moderation/users/{$author->id}/status"
        );

        $statusResponse->assertOk();
    }

    public function test_user_suspension_workflow(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->create();

        // Step 1: Warn user
        $warnResponse = $this->actingAs($admin)->postJson(
            "/api/admin/moderation/users/{$targetUser->id}/warn",
            ['reason' => 'First warning']
        );

        $warnResponse->assertCreated();

        // Step 2: Suspend user
        $suspendResponse = $this->actingAs($admin)->postJson(
            "/api/admin/moderation/users/{$targetUser->id}/suspend",
            [
                'duration_days' => 7,
                'reason' => 'Continued violations',
            ]
        );

        $suspendResponse->assertCreated();

        // Step 3: Verify suspension status
        $statusResponse = $this->actingAs($admin)->getJson(
            "/api/admin/moderation/users/{$targetUser->id}/status"
        );

        $statusResponse->assertOk();
        $this->assertTrue($statusResponse->json('data.is_suspended'));

        // Step 4: User appeals
        $actionId = $suspendResponse->json('data.id');
        $appealResponse = $this->actingAs($targetUser)->postJson(
            "/api/admin/moderation/appeal/{$actionId}",
            ['reason' => 'I did not violate any policy']
        );

        $appealResponse->assertCreated();

        // Step 5: Admin reviews appeal
        $appealId = $appealResponse->json('data.id');
        $approveResponse = $this->actingAs($admin)->postJson(
            "/api/admin/moderation/appeals/{$appealId}/approve",
            ['notes' => 'Appeal is valid']
        );

        $approveResponse->assertOk();
    }

    public function test_moderation_queue_management(): void
    {
        $admin = User::factory()->admin()->create();
        $reporter = User::factory()->create();
        $category = Category::factory()->create();

        // Create multiple reports with different priorities
        Tool::factory()->create(['category_id' => $category->id]);
        Tool::factory()->create(['category_id' => $category->id]);

        $this->actingAs($reporter)->postJson(
            '/api/admin/moderation/report',
            [
                'reportable_type' => 'Tool',
                'reportable_id' => 1,
                'reason' => 'spam',
            ]
        );

        $this->actingAs($reporter)->postJson(
            '/api/admin/moderation/report',
            [
                'reportable_type' => 'Tool',
                'reportable_id' => 2,
                'reason' => 'hate_speech',
            ]
        );

        // View queue
        $queueResponse = $this->actingAs($admin)->getJson(
            '/api/admin/moderation/queue'
        );

        $queueResponse->assertOk();
        $queue = $queueResponse->json('data');

        // Verify priority ordering (hate_speech should be urgent)
        $this->assertEquals('urgent', $queue[0]['priority']);
    }

    public function test_moderation_statistics(): void
    {
        $admin = User::factory()->admin()->create();
        $reporter = User::factory()->create();
        $category = Category::factory()->create();

        Tool::factory()->create(['category_id' => $category->id]);

        $this->actingAs($reporter)->postJson(
            '/api/admin/moderation/report',
            [
                'reportable_type' => 'Tool',
                'reportable_id' => 1,
                'reason' => 'spam',
            ]
        );

        $statsResponse = $this->actingAs($admin)->getJson(
            '/api/admin/moderation/statistics'
        );

        $statsResponse->assertOk();
        $stats = $statsResponse->json('data');

        $this->assertArrayHasKey('pending_reports', $stats);
        $this->assertGreaterThan(0, $stats['pending_reports']);
    }
}
