<?php

declare(strict_types=1);

namespace Tests\Unit\Actions\Comment;

use App\Actions\Comment\CreateCommentAction;
use App\DataTransferObjects\CommentData;
use App\Models\Comment;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTools;
use Tests\Traits\CreatesUsers;

class CreateCommentActionTest extends TestCase
{
    use CreatesTools;
    use CreatesUsers;
    use RefreshDatabase;

    private CreateCommentAction $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = app(CreateCommentAction::class);
    }

    public function test_create_comment_creates_comment_with_valid_data(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        $data = new CommentData(
            toolId: $tool->id,
            userId: $user->id,
            content: 'Great tool!',
            parentId: null,
        );

        $comment = $this->action->execute($data, $user);

        $this->assertInstanceOf(Comment::class, $comment);
        $this->assertEquals('Great tool!', $comment->content);
        $this->assertEquals($tool->id, $comment->tool_id);
        $this->assertEquals($user->id, $comment->user_id);
        $this->assertNull($comment->parent_id);
    }

    public function test_create_comment_increments_tool_comments_count(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        $initialCount = $tool->comments_count;

        $data = new CommentData(
            toolId: $tool->id,
            userId: $user->id,
            content: 'Test comment',
            parentId: null,
        );

        $this->action->execute($data, $user);

        $tool->refresh();
        $this->assertEquals($initialCount + 1, $tool->comments_count);
    }

    public function test_create_reply_comment_with_parent_id(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        $parentComment = Comment::factory()->create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
        ]);

        $data = new CommentData(
            toolId: $tool->id,
            userId: $user->id,
            content: 'Reply to comment',
            parentId: $parentComment->id,
        );

        $comment = $this->action->execute($data, $user);

        $this->assertEquals($parentComment->id, $comment->parent_id);
        $this->assertTrue($comment->isReply());
    }

    public function test_create_comment_logs_activity(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        $data = new CommentData(
            toolId: $tool->id,
            userId: $user->id,
            content: 'Test comment',
            parentId: null,
        );

        $this->action->execute($data, $user);

        $activity = \App\Models\Activity::where('causer_type', User::class)
            ->where('causer_id', $user->id)
            ->where('event', 'created')
            ->where('subject_type', Comment::class)
            ->latest()
            ->first();

        $this->assertNotNull($activity);
        $this->assertEquals('created', $activity->event);
    }

    public function test_create_multiple_comments_increments_count_correctly(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        $initialCount = $tool->comments_count;

        for ($i = 0; $i < 3; $i++) {
            $data = new CommentData(
                toolId: $tool->id,
                userId: $user->id,
                content: "Comment {$i}",
                parentId: null,
            );
            $this->action->execute($data, $user);
        }

        $tool->refresh();
        $this->assertEquals($initialCount + 3, $tool->comments_count);
    }
}
