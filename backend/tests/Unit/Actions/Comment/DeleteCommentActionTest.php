<?php

declare(strict_types=1);

namespace Tests\Unit\Actions\Comment;

use App\Actions\Comment\DeleteCommentAction;
use App\Models\Comment;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTools;
use Tests\Traits\CreatesUsers;

class DeleteCommentActionTest extends TestCase
{
    use CreatesTools;
    use CreatesUsers;
    use RefreshDatabase;

    private DeleteCommentAction $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = app(DeleteCommentAction::class);
    }

    public function test_delete_comment_deletes_comment_record(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        $comment = Comment::factory()->create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
        ]);

        $result = $this->action->execute($comment, $user);

        $this->assertTrue($result);
        $this->assertFalse(Comment::find($comment->id) !== null);
    }

    public function test_delete_comment_decrements_tool_comments_count(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        $tool->increment('comments_count');

        $comment = Comment::factory()->create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
        ]);

        $this->action->execute($comment, $user);

        $tool->refresh();
        $this->assertEquals(0, $tool->comments_count);
    }

    public function test_delete_comment_logs_activity(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        $comment = Comment::factory()->create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
        ]);

        $this->action->execute($comment, $user);

        $activity = \App\Models\Activity::where('causer_type', User::class)
            ->where('causer_id', $user->id)
            ->where('event', 'deleted')
            ->latest()
            ->first();

        $this->assertNotNull($activity);
        $this->assertEquals('deleted', $activity->event);
    }

    public function test_delete_multiple_comments_decrements_count_correctly(): void
    {
        $user = $this->createUser();
        $tool = $this->createApprovedTool();
        $tool->update(['comments_count' => 3]);

        $comments = Comment::factory(3)->create([
            'tool_id' => $tool->id,
            'user_id' => $user->id,
        ]);

        foreach ($comments as $comment) {
            $this->action->execute($comment, $user);
        }

        $tool->refresh();
        $this->assertEquals(0, $tool->comments_count);
    }
}
