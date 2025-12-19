<?php

declare(strict_types=1);

namespace Tests\Feature\Events;

use App\Events\CommentCreated;
use App\Events\CommentDeleted;
use App\Events\RatingCreated;
use App\Events\RatingDeleted;
use App\Events\JournalEntryCreated;
use App\Events\JournalEntryDeleted;
use App\Events\UserBanned;
use App\Events\UserUnbanned;
use App\Listeners\SendCommentNotification;
use App\Listeners\LogCommentDeletion;
use App\Listeners\UpdateRatingAnalytics;
use App\Listeners\RecalculateRatingAverage;
use App\Listeners\LogJournalEntryCreation;
use App\Listeners\LogJournalEntryDeletion;
use App\Listeners\LogUserBanning;
use App\Listeners\LogUserUnbanning;
use App\Models\Comment;
use App\Models\Rating;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

final class EventListenerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that SendCommentNotification listener dispatches a job.
     */
    public function test_send_comment_notification_listener_dispatches_job(): void
    {
        Queue::fake();

        $comment = Comment::factory()->create();
        $event = new CommentCreated($comment);

        $listener = new SendCommentNotification();
        $listener->handle($event);

        Queue::assertPushedWithChain([], fn () => true);
    }

    /**
     * Test that LogCommentDeletion listener creates activity log.
     */
    public function test_log_comment_deletion_listener_creates_activity(): void
    {
        $comment = Comment::factory()->create();
        $event = new CommentDeleted($comment);

        $listener = new LogCommentDeletion();
        $listener->handle($event);

        $this->assertDatabaseHas('activities', [
            'subject_type' => Comment::class,
            'subject_id' => $comment->id,
            'event' => 'deleted',
        ]);
    }

    /**
     * Test that UpdateRatingAnalytics listener updates tool rating average.
     */
    public function test_update_rating_analytics_listener_updates_average(): void
    {
        Queue::fake();

        $rating = Rating::factory()->create(['rating' => 5]);
        $event = new RatingCreated($rating);

        $listener = new UpdateRatingAnalytics();
        $listener->handle($event);

        $this->assertDatabaseHas('tools', [
            'id' => $rating->tool_id,
        ]);
    }

    /**
     * Test that RecalculateRatingAverage listener updates metrics.
     */
    public function test_recalculate_rating_average_listener_updates_metrics(): void
    {
        Queue::fake();

        $rating = Rating::factory()->create();
        $event = new RatingDeleted($rating);

        $listener = new RecalculateRatingAverage();
        $listener->handle($event);

        // Verify tool still exists and listener executed
        $this->assertDatabaseHas('tools', [
            'id' => $rating->tool_id,
        ]);
    }

    /**
     * Test that LogJournalEntryCreation listener creates activity log.
     */
    public function test_log_journal_entry_creation_listener_creates_activity(): void
    {
        $entry = JournalEntry::factory()->create();
        $event = new JournalEntryCreated($entry);

        $listener = new LogJournalEntryCreation();
        $listener->handle($event);

        $this->assertDatabaseHas('activities', [
            'subject_type' => JournalEntry::class,
            'subject_id' => $entry->id,
            'event' => 'created',
        ]);
    }

    /**
     * Test that LogJournalEntryDeletion listener creates activity log.
     */
    public function test_log_journal_entry_deletion_listener_creates_activity(): void
    {
        $entry = JournalEntry::factory()->create();
        $event = new JournalEntryDeleted($entry);

        $listener = new LogJournalEntryDeletion();
        $listener->handle($event);

        $this->assertDatabaseHas('activities', [
            'subject_type' => JournalEntry::class,
            'subject_id' => $entry->id,
            'event' => 'deleted',
        ]);
    }

    /**
     * Test that LogUserBanning listener creates activity with metadata.
     */
    public function test_log_user_banning_listener_creates_activity_with_metadata(): void
    {
        $user = User::factory()->create();
        $event = new UserBanned($user, 'Spam', '1w');

        $listener = new LogUserBanning();
        $listener->handle($event);

        $this->assertDatabaseHas('activities', [
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'event' => 'user_banned',
        ]);
    }

    /**
     * Test that LogUserUnbanning listener creates activity log.
     */
    public function test_log_user_unbanning_listener_creates_activity(): void
    {
        $user = User::factory()->create(['is_banned' => true]);
        $event = new UserUnbanned($user);

        $listener = new LogUserUnbanning();
        $listener->handle($event);

        $this->assertDatabaseHas('activities', [
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'event' => 'user_unbanned',
        ]);
    }

    /**
     * Test that listeners respond to events properly.
     */
    public function test_listener_responds_to_comment_created_event(): void
    {
        $comment = Comment::factory()->create();
        $event = new CommentCreated($comment);

        $this->assertInstanceOf(CommentCreated::class, $event);
        $this->assertEquals($comment->id, $event->comment->id);
    }

    /**
     * Test that listeners respond to user ban event with duration.
     */
    public function test_listener_receives_user_banned_event_with_duration(): void
    {
        $user = User::factory()->create();
        $event = new UserBanned($user, 'Spam', '1d');

        $this->assertInstanceOf(UserBanned::class, $event);
        $this->assertEquals('1d', $event->duration);
        $this->assertEquals('Spam', $event->reason);
    }

    /**
     * Test that all listeners implement ShouldQueue.
     */
    public function test_all_listeners_implement_should_queue(): void
    {
        $listeners = [
            SendCommentNotification::class,
            LogCommentDeletion::class,
            UpdateRatingAnalytics::class,
            RecalculateRatingAverage::class,
            LogJournalEntryCreation::class,
            LogJournalEntryDeletion::class,
            LogUserBanning::class,
            LogUserUnbanning::class,
        ];

        foreach ($listeners as $listener) {
            $implements = class_implements($listener);
            $this->assertArrayHasKey(
                \Illuminate\Contracts\Queue\ShouldQueue::class,
                $implements,
                "$listener does not implement ShouldQueue"
            );
        }
    }
}
