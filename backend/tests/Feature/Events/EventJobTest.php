<?php

declare(strict_types=1);

namespace Tests\Feature\Events;

use App\Jobs\SendCommentNotificationJob;
use App\Jobs\UpdateAnalyticsJob;
use App\Jobs\SendWelcomeEmailJob;
use App\Jobs\ExportActivityLogsJob;
use App\Models\Comment;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

final class EventJobTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that SendCommentNotificationJob can be queued.
     */
    public function test_send_comment_notification_job_can_be_queued(): void
    {
        Queue::fake();

        $comment = Comment::factory()->create();

        SendCommentNotificationJob::dispatch($comment);

        Queue::assertPushed(SendCommentNotificationJob::class);
    }

    /**
     * Test that UpdateAnalyticsJob can be queued.
     */
    public function test_update_analytics_job_can_be_queued(): void
    {
        Queue::fake();

        $rating = Rating::factory()->create();

        UpdateAnalyticsJob::dispatch($rating);

        Queue::assertPushed(UpdateAnalyticsJob::class);
    }

    /**
     * Test that SendWelcomeEmailJob can be queued.
     */
    public function test_send_welcome_email_job_can_be_queued(): void
    {
        Queue::fake();

        $user = User::factory()->create();

        SendWelcomeEmailJob::dispatch($user);

        Queue::assertPushed(SendWelcomeEmailJob::class);
    }

    /**
     * Test that ExportActivityLogsJob can be queued.
     */
    public function test_export_activity_logs_job_can_be_queued(): void
    {
        Queue::fake();

        ExportActivityLogsJob::dispatch(
            startDate: now()->subDays(7),
            endDate: now(),
            format: 'csv'
        );

        Queue::assertPushed(ExportActivityLogsJob::class);
    }

    /**
     * Test that SendCommentNotificationJob executes handle method.
     */
    public function test_send_comment_notification_job_executes_handle(): void
    {
        $comment = Comment::factory()->create();
        $job = new SendCommentNotificationJob($comment);

        // Job should execute without errors
        $this->expectNotToPerformAssertions();
        $job->handle();
    }

    /**
     * Test that UpdateAnalyticsJob executes handle method.
     */
    public function test_update_analytics_job_executes_handle(): void
    {
        $rating = Rating::factory()->create();
        $job = new UpdateAnalyticsJob($rating);

        // Job should execute without errors
        $this->expectNotToPerformAssertions();
        $job->handle();
    }

    /**
     * Test that SendWelcomeEmailJob executes handle method.
     */
    public function test_send_welcome_email_job_executes_handle(): void
    {
        $user = User::factory()->create();
        $job = new SendWelcomeEmailJob($user);

        // Job should execute without errors
        $this->expectNotToPerformAssertions();
        $job->handle();
    }

    /**
     * Test that ExportActivityLogsJob executes handle method.
     */
    public function test_export_activity_logs_job_executes_handle(): void
    {
        $job = new ExportActivityLogsJob(
            startDate: now()->subDays(7),
            endDate: now(),
            format: 'csv'
        );

        // Job should execute without errors
        $this->expectNotToPerformAssertions();
        $job->handle();
    }

    /**
     * Test that jobs can be serialized for queue.
     */
    public function test_jobs_can_be_serialized_for_queue(): void
    {
        $comment = Comment::factory()->create();
        $job = new SendCommentNotificationJob($comment);

        $serialized = serialize($job);

        $this->assertIsString($serialized);
        $this->assertNotEmpty($serialized);
    }

    /**
     * Test that jobs implement proper interfaces.
     */
    public function test_jobs_implement_queueable(): void
    {
        $jobs = [
            SendCommentNotificationJob::class,
            UpdateAnalyticsJob::class,
            SendWelcomeEmailJob::class,
            ExportActivityLogsJob::class,
        ];

        foreach ($jobs as $job) {
            $traits = class_uses($job);
            $this->assertArrayHasKey(
                \Illuminate\Bus\Queueable::class,
                $traits,
                "$job does not use Queueable"
            );
        }
    }

    /**
     * Test that jobs can be dispatched to queue.
     */
    public function test_jobs_can_be_dispatched_to_queue(): void
    {
        Queue::fake();

        $comment = Comment::factory()->create();
        $rating = Rating::factory()->create();
        $user = User::factory()->create();

        SendCommentNotificationJob::dispatch($comment);
        UpdateAnalyticsJob::dispatch($rating);
        SendWelcomeEmailJob::dispatch($user);
        ExportActivityLogsJob::dispatch(now()->subDays(7), now(), 'csv');

        Queue::assertCount(4);
    }

    /**
     * Test that UpdateAnalyticsJob handles different types.
     */
    public function test_update_analytics_job_handles_rating_type(): void
    {
        $rating = Rating::factory()->create(['rating' => 5]);
        $job = new UpdateAnalyticsJob($rating);

        // Should process without errors
        $this->expectNotToPerformAssertions();
        $job->handle();
    }
}
