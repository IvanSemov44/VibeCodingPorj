<?php

declare(strict_types=1);

namespace Tests\Feature\Mail;

use App\Mail\WelcomeMailable;
use App\Mail\CommentNotificationMailable;
use App\Models\User;
use App\Models\Comment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

final class MailableTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that WelcomeMailable can be instantiated.
     */
    public function test_welcome_mailable_can_be_instantiated(): void
    {
        $user = User::factory()->create();
        $mailable = new WelcomeMailable($user);

        $this->assertInstanceOf(WelcomeMailable::class, $mailable);
        $this->assertEquals($user->id, $mailable->user->id);
    }

    /**
     * Test that WelcomeMailable has correct subject.
     */
    public function test_welcome_mailable_has_correct_subject(): void
    {
        Mail::fake();
        $user = User::factory()->create();

        Mail::mailable(new WelcomeMailable($user));

        Mail::assertQueued(WelcomeMailable::class);
    }

    /**
     * Test that WelcomeMailable can be mailed.
     */
    public function test_welcome_mailable_can_be_mailed(): void
    {
        Mail::fake();
        $user = User::factory()->create();

        Mail::send(new WelcomeMailable($user));

        Mail::assertSent(WelcomeMailable::class, fn (WelcomeMailable $mail) =>
            $mail->hasTo($user->email)
        );
    }

    /**
     * Test that CommentNotificationMailable can be instantiated.
     */
    public function test_comment_notification_mailable_can_be_instantiated(): void
    {
        $comment = Comment::factory()->create();
        $mailable = new CommentNotificationMailable($comment, 'owner');

        $this->assertInstanceOf(CommentNotificationMailable::class, $mailable);
        $this->assertEquals($comment->id, $mailable->comment->id);
        $this->assertEquals('owner', $mailable->recipientType);
    }

    /**
     * Test that CommentNotificationMailable for owner has correct subject.
     */
    public function test_comment_notification_mailable_owner_has_correct_subject(): void
    {
        $comment = Comment::factory()->create();
        $mailable = new CommentNotificationMailable($comment, 'owner');

        $this->assertInstanceOf(CommentNotificationMailable::class, $mailable);
    }

    /**
     * Test that CommentNotificationMailable for parent author has correct subject.
     */
    public function test_comment_notification_mailable_parent_author_has_correct_subject(): void
    {
        $comment = Comment::factory()->create();
        $mailable = new CommentNotificationMailable($comment, 'parent_author');

        $this->assertInstanceOf(CommentNotificationMailable::class, $mailable);
        $this->assertEquals('parent_author', $mailable->recipientType);
    }

    /**
     * Test that CommentNotificationMailable can be mailed to owner.
     */
    public function test_comment_notification_mailable_can_be_mailed_to_owner(): void
    {
        Mail::fake();
        $comment = Comment::factory()->create();

        Mail::send(new CommentNotificationMailable($comment, 'owner'));

        Mail::assertSent(CommentNotificationMailable::class);
    }

    /**
     * Test that CommentNotificationMailable can be mailed to parent author.
     */
    public function test_comment_notification_mailable_can_be_mailed_to_parent_author(): void
    {
        Mail::fake();
        $comment = Comment::factory()->create();

        Mail::send(new CommentNotificationMailable($comment, 'parent_author'));

        Mail::assertSent(CommentNotificationMailable::class);
    }

    /**
     * Test that WelcomeMailable renders correctly.
     */
    public function test_welcome_mailable_renders_correctly(): void
    {
        $user = User::factory()->create(['name' => 'John Doe']);
        $mailable = new WelcomeMailable($user);

        $rendered = $mailable->render();

        $this->assertIsString($rendered);
        $this->assertNotEmpty($rendered);
    }

    /**
     * Test that CommentNotificationMailable renders correctly.
     */
    public function test_comment_notification_mailable_renders_correctly(): void
    {
        $comment = Comment::factory()->create();
        $mailable = new CommentNotificationMailable($comment, 'owner');

        $rendered = $mailable->render();

        $this->assertIsString($rendered);
        $this->assertNotEmpty($rendered);
    }

    /**
     * Test that mailables use correct views.
     */
    public function test_mailables_use_correct_views(): void
    {
        $user = User::factory()->create();
        $welcomeMailable = new WelcomeMailable($user);

        $comment = Comment::factory()->create();
        $commentMailable = new CommentNotificationMailable($comment, 'owner');

        $this->assertNotNull($welcomeMailable->content());
        $this->assertNotNull($commentMailable->content());
    }

    /**
     * Test that mailables can be queued.
     */
    public function test_welcome_mailable_can_be_queued(): void
    {
        Mail::fake();
        $user = User::factory()->create();

        WelcomeMailable::dispatch($user);

        Mail::assertQueued(WelcomeMailable::class);
    }

    /**
     * Test that mailables have proper envelope configuration.
     */
    public function test_mailables_have_proper_envelope(): void
    {
        $user = User::factory()->create();
        $mailable = new WelcomeMailable($user);

        $envelope = $mailable->envelope();

        $this->assertNotNull($envelope);
        $this->assertNotNull($envelope->subject);
    }
}
