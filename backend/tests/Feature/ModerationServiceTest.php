<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ContentReport;
use App\Models\ModerationAction;
use App\Models\ModerationAppeal;
use App\Models\User;
use App\Models\UserModerationStatus;
use App\Services\ModerationService;
use Tests\TestCase;

class ModerationServiceTest extends TestCase
{
    private ModerationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ModerationService::class);
    }

    public function test_create_report(): void
    {
        $reporter = User::factory()->create();
        $reportedUser = User::factory()->create();

        $report = $this->service->createReport(
            reporter: $reporter,
            reportableType: 'Tool',
            reportableId: 1,
            reason: 'spam',
            description: 'Test report',
            reportedUser: $reportedUser
        );

        $this->assertInstanceOf(ContentReport::class, $report);
        $this->assertEquals($reporter->id, $report->user_id);
        $this->assertEquals($reportedUser->id, $report->reported_user_id);
        $this->assertEquals('spam', $report->reason);
        $this->assertEquals('pending', $report->status);
        $this->assertDatabaseHas('content_reports', [
            'id' => $report->id,
            'user_id' => $reporter->id,
        ]);
    }

    public function test_urgent_reports_get_high_priority(): void
    {
        $reporter = User::factory()->create();

        $report = $this->service->createReport(
            reporter: $reporter,
            reportableType: 'Comment',
            reportableId: 1,
            reason: 'hate_speech',
        );

        $queueItem = $report->queueItem();
        $this->assertEquals('urgent', $queueItem->priority);
    }

    public function test_get_pending_reports(): void
    {
        $reporter = User::factory()->create();

        for ($i = 0; $i < 3; $i++) {
            $this->service->createReport(
                reporter: $reporter,
                reportableType: 'Tool',
                reportableId: $i,
                reason: 'spam'
            );
        }

        $pending = $this->service->getPendingReports();

        $this->assertCount(3, $pending);
        $this->assertTrue($pending->every(fn ($r) => $r->status === 'pending'));
    }

    public function test_filter_reports_by_status(): void
    {
        $reporter = User::factory()->create();

        $report1 = $this->service->createReport(
            reporter: $reporter,
            reportableType: 'Tool',
            reportableId: 1,
            reason: 'spam'
        );

        $report2 = $this->service->createReport(
            reporter: $reporter,
            reportableType: 'Tool',
            reportableId: 2,
            reason: 'spam'
        );

        $report1->update(['status' => 'resolved']);

        $pending = $this->service->getReports(status: 'pending');

        $this->assertCount(1, $pending);
        $this->assertEquals($report2->id, $pending->first()->id);
    }

    public function test_assign_report_to_moderator(): void
    {
        $reporter = User::factory()->create();
        $moderator = User::factory()->create();

        $report = $this->service->createReport(
            reporter: $reporter,
            reportableType: 'Tool',
            reportableId: 1,
            reason: 'spam'
        );

        $this->service->assignReport($report, $moderator);

        $this->assertEquals('under_review', $report->fresh()->status);
        $this->assertEquals($moderator->id, $report->queueItem()->assigned_to);
    }

    public function test_make_moderation_decision(): void
    {
        $reporter = User::factory()->create();
        $moderator = User::factory()->create();

        $report = $this->service->createReport(
            reporter: $reporter,
            reportableType: 'Tool',
            reportableId: 1,
            reason: 'spam'
        );

        $decision = $this->service->makeDecision(
            report: $report,
            moderator: $moderator,
            decision: 'approve_action',
            reasoning: 'Content violates policy'
        );

        $this->assertInstanceOf(\App\Models\ModerationDecision::class, $decision);
        $this->assertEquals('approve_action', $decision->decision);
        $this->assertEquals('resolved', $report->fresh()->status);
    }

    public function test_remove_content(): void
    {
        $moderator = User::factory()->create();

        $action = $this->service->removeContent(
            moderator: $moderator,
            contentType: 'Tool',
            contentId: 1,
            reason: 'Policy violation'
        );

        $this->assertInstanceOf(ModerationAction::class, $action);
        $this->assertEquals('content_remove', $action->action);
        $this->assertEquals($moderator->id, $action->moderator_id);
    }

    public function test_hide_content(): void
    {
        $moderator = User::factory()->create();

        $action = $this->service->hideContent(
            moderator: $moderator,
            contentType: 'Comment',
            contentId: 5,
            reason: 'Inappropriate content'
        );

        $this->assertEquals('content_hide', $action->action);
        $this->assertDatabaseHas('moderation_actions', [
            'id' => $action->id,
            'action' => 'content_hide',
        ]);
    }

    public function test_warn_user(): void
    {
        $moderator = User::factory()->create();
        $targetUser = User::factory()->create();

        $action = $this->service->warnUser(
            moderator: $moderator,
            targetUser: $targetUser,
            reason: 'Behavior warning'
        );

        $this->assertEquals('user_warn', $action->action);

        $status = UserModerationStatus::where('user_id', $targetUser->id)->first();
        $this->assertEquals(1, $status->warning_count);
    }

    public function test_suspend_user(): void
    {
        $moderator = User::factory()->create();
        $targetUser = User::factory()->create();

        $action = $this->service->suspendUser(
            moderator: $moderator,
            targetUser: $targetUser,
            durationDays: 7,
            reason: 'Policy violation'
        );

        $this->assertEquals('user_suspend', $action->action);
        $this->assertEquals(7, $action->duration_days);

        $status = UserModerationStatus::where('user_id', $targetUser->id)->first();
        $this->assertTrue($status->isSuspended());
    }

    public function test_ban_user(): void
    {
        $moderator = User::factory()->create();
        $targetUser = User::factory()->create();

        $action = $this->service->banUser(
            moderator: $moderator,
            targetUser: $targetUser,
            reason: 'Permanent ban'
        );

        $this->assertEquals('user_ban', $action->action);

        $status = UserModerationStatus::where('user_id', $targetUser->id)->first();
        $this->assertTrue($status->isBanned());
        $this->assertFalse($status->canAccess());
    }

    public function test_restore_user(): void
    {
        $moderator = User::factory()->create();
        $targetUser = User::factory()->create();

        $this->service->suspendUser(
            moderator: $moderator,
            targetUser: $targetUser,
            durationDays: 7,
            reason: 'Test'
        );

        $this->service->restoreUser(
            moderator: $moderator,
            targetUser: $targetUser,
            reason: 'Appeal approved'
        );

        $status = UserModerationStatus::where('user_id', $targetUser->id)->first();
        $this->assertFalse($status->isSuspended());
        $this->assertTrue($status->canAccess());
    }

    public function test_get_user_actions(): void
    {
        $moderator = User::factory()->create();
        $targetUser = User::factory()->create();

        $this->service->warnUser($moderator, $targetUser, 'Test 1');
        $this->service->warnUser($moderator, $targetUser, 'Test 2');

        $actions = $this->service->getUserActions($targetUser);

        $this->assertCount(2, $actions);
    }

    public function test_get_user_status(): void
    {
        $moderator = User::factory()->create();
        $targetUser = User::factory()->create();

        $this->service->suspendUser($moderator, $targetUser, 7, 'Test');

        $status = $this->service->getUserStatus($targetUser);

        $this->assertNotNull($status);
        $this->assertTrue($status->isSuspended());
    }

    public function test_create_appeal(): void
    {
        $moderator = User::factory()->create();
        $targetUser = User::factory()->create();

        $action = $this->service->suspendUser(
            $moderator,
            $targetUser,
            7,
            'Test'
        );

        $appeal = $this->service->createAppeal(
            user: $targetUser,
            action: $action,
            reason: 'Unfair suspension'
        );

        $this->assertInstanceOf(ModerationAppeal::class, $appeal);
        $this->assertEquals('pending', $appeal->status);
    }

    public function test_approve_appeal(): void
    {
        $moderator = User::factory()->create();
        $reviewer = User::factory()->create();
        $targetUser = User::factory()->create();

        $action = $this->service->suspendUser(
            $moderator,
            $targetUser,
            7,
            'Test'
        );

        $appeal = $this->service->createAppeal($targetUser, $action, 'Unfair');

        $this->service->approveAppeal($appeal, $reviewer, 'Valid appeal');

        $this->assertTrue($appeal->fresh()->isApproved());
    }

    public function test_reject_appeal(): void
    {
        $moderator = User::factory()->create();
        $reviewer = User::factory()->create();
        $targetUser = User::factory()->create();

        $action = $this->service->suspendUser(
            $moderator,
            $targetUser,
            7,
            'Test'
        );

        $appeal = $this->service->createAppeal($targetUser, $action, 'Unfair');

        $this->service->rejectAppeal($appeal, $reviewer, 'Not valid');

        $this->assertTrue($appeal->fresh()->isRejected());
    }

    public function test_get_statistics(): void
    {
        $reporter = User::factory()->create();
        $moderator = User::factory()->create();
        $targetUser = User::factory()->create();

        $this->service->createReport($reporter, 'Tool', 1, 'spam');
        $this->service->warnUser($moderator, $targetUser, 'Test');
        $this->service->banUser($moderator, $targetUser, 'Test');

        $stats = $this->service->getStatistics();

        $this->assertArrayHasKey('pending_reports', $stats);
        $this->assertArrayHasKey('banned_users', $stats);
        $this->assertGreater($stats['banned_users'], 0);
    }

    public function test_process_expired_suspensions(): void
    {
        $moderator = User::factory()->create();
        $targetUser = User::factory()->create();

        $this->service->suspendUser(
            $moderator,
            $targetUser,
            0, // Expires immediately
            'Test'
        );

        // Manually set ended date to past
        UserModerationStatus::where('user_id', $targetUser->id)
            ->update(['suspension_ends_at' => now()->subDay()]);

        $count = $this->service->processExpiredSuspensions();

        $this->assertGreater($count, 0);
        $status = UserModerationStatus::where('user_id', $targetUser->id)->first();
        $this->assertFalse($status->isSuspended());
    }

    public function test_get_moderation_queue(): void
    {
        $reporter = User::factory()->create();

        $this->service->createReport($reporter, 'Tool', 1, 'hate_speech');
        $this->service->createReport($reporter, 'Tool', 2, 'spam');

        $queue = $this->service->getQueue();

        $this->assertCount(2, $queue);
        // Urgent items should come first
        $this->assertEquals('urgent', $queue->first()->priority);
    }
}
