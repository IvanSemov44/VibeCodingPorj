<?php

declare(strict_types=1);

namespace Tests\Feature\Events;

use App\Actions\Comment\CreateCommentAction;
use App\Actions\Comment\DeleteCommentAction;
use App\Actions\Rating\CreateRatingAction;
use App\Actions\Rating\DeleteRatingAction;
use App\Actions\JournalEntry\CreateJournalEntryAction;
use App\Actions\JournalEntry\DeleteJournalEntryAction;
use App\Actions\User\BanUserAction;
use App\Actions\User\UnbanUserAction;
use App\Events\CommentCreated;
use App\Events\CommentDeleted;
use App\Events\RatingCreated;
use App\Events\RatingDeleted;
use App\Events\JournalEntryCreated;
use App\Events\JournalEntryDeleted;
use App\Events\UserBanned;
use App\Events\UserUnbanned;
use App\Models\Comment;
use App\Models\Rating;
use App\Models\JournalEntry;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

final class EventDispatchTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that CommentCreated event is dispatched when creating a comment.
     */
    public function test_comment_created_event_is_dispatched(): void
    {
        Event::fake();

        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $action = app(CreateCommentAction::class);
        $action->execute(
            user: $user,
            tool: $tool,
            parent: null,
            text: 'Test comment'
        );

        Event::assertDispatched(CommentCreated::class);
    }

    /**
     * Test that CommentDeleted event is dispatched when deleting a comment.
     */
    public function test_comment_deleted_event_is_dispatched(): void
    {
        Event::fake();

        $comment = Comment::factory()->create();

        $action = app(DeleteCommentAction::class);
        $action->execute($comment);

        Event::assertDispatched(CommentDeleted::class);
    }

    /**
     * Test that RatingCreated event is dispatched when creating a rating.
     */
    public function test_rating_created_event_is_dispatched(): void
    {
        Event::fake();

        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $action = app(CreateRatingAction::class);
        $action->execute(
            user: $user,
            tool: $tool,
            rating: 5,
            comment: 'Excellent tool'
        );

        Event::assertDispatched(RatingCreated::class);
    }

    /**
     * Test that RatingDeleted event is dispatched when deleting a rating.
     */
    public function test_rating_deleted_event_is_dispatched(): void
    {
        Event::fake();

        $rating = Rating::factory()->create();

        $action = app(DeleteRatingAction::class);
        $action->execute($rating);

        Event::assertDispatched(RatingDeleted::class);
    }

    /**
     * Test that JournalEntryCreated event is dispatched when creating a journal entry.
     */
    public function test_journal_entry_created_event_is_dispatched(): void
    {
        Event::fake();

        $user = User::factory()->create();

        $action = app(CreateJournalEntryAction::class);
        $action->execute(
            user: $user,
            title: 'Test Entry',
            content: 'Test content'
        );

        Event::assertDispatched(JournalEntryCreated::class);
    }

    /**
     * Test that JournalEntryDeleted event is dispatched when deleting a journal entry.
     */
    public function test_journal_entry_deleted_event_is_dispatched(): void
    {
        Event::fake();

        $entry = JournalEntry::factory()->create();

        $action = app(DeleteJournalEntryAction::class);
        $action->execute($entry);

        Event::assertDispatched(JournalEntryDeleted::class);
    }

    /**
     * Test that UserBanned event is dispatched when banning a user.
     */
    public function test_user_banned_event_is_dispatched(): void
    {
        Event::fake();

        $user = User::factory()->create();
        $admin = User::factory()->create();

        $action = app(BanUserAction::class);
        $action->execute(
            user: $user,
            reason: 'Spam',
            duration: '1w',
            admin: $admin
        );

        Event::assertDispatched(UserBanned::class);
    }

    /**
     * Test that UserUnbanned event is dispatched when unbanning a user.
     */
    public function test_user_unbanned_event_is_dispatched(): void
    {
        Event::fake();

        $user = User::factory()->create(['is_banned' => true]);
        $admin = User::factory()->create();

        $action = app(UnbanUserAction::class);
        $action->execute($user, $admin);

        Event::assertDispatched(UserUnbanned::class);
    }

    /**
     * Test that CommentCreated event contains correct comment data.
     */
    public function test_comment_created_event_has_correct_data(): void
    {
        Event::fake();

        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $action = app(CreateCommentAction::class);
        $comment = $action->execute(
            user: $user,
            tool: $tool,
            parent: null,
            text: 'Test comment'
        );

        Event::assertDispatched(
            CommentCreated::class,
            fn (CommentCreated $event) => $event->comment->id === $comment->id
        );
    }

    /**
     * Test that RatingCreated event contains correct rating data.
     */
    public function test_rating_created_event_has_correct_data(): void
    {
        Event::fake();

        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $action = app(CreateRatingAction::class);
        $rating = $action->execute(
            user: $user,
            tool: $tool,
            rating: 4,
            comment: 'Good tool'
        );

        Event::assertDispatched(
            RatingCreated::class,
            fn (RatingCreated $event) => $event->rating->id === $rating->id
        );
    }

    /**
     * Test that UserBanned event contains correct ban duration.
     */
    public function test_user_banned_event_has_correct_duration(): void
    {
        Event::fake();

        $user = User::factory()->create();
        $admin = User::factory()->create();

        $action = app(BanUserAction::class);
        $action->execute(
            user: $user,
            reason: 'Spam',
            duration: '1d',
            admin: $admin
        );

        Event::assertDispatched(
            UserBanned::class,
            fn (UserBanned $event) => $event->duration === '1d'
        );
    }

    /**
     * Test that UserBanned event contains correct reason.
     */
    public function test_user_banned_event_has_correct_reason(): void
    {
        Event::fake();

        $user = User::factory()->create();
        $admin = User::factory()->create();

        $action = app(BanUserAction::class);
        $action->execute(
            user: $user,
            reason: 'Harassment',
            duration: '1w',
            admin: $admin
        );

        Event::assertDispatched(
            UserBanned::class,
            fn (UserBanned $event) => $event->reason === 'Harassment'
        );
    }
}
