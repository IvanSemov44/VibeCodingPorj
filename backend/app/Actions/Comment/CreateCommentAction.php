<?php

declare(strict_types=1);

namespace App\Actions\Comment;

use App\DataTransferObjects\CommentData;
use App\Models\Comment;
use Illuminate\Support\Facades\DB;

final class CreateCommentAction
{
    /**
     * Create a new comment on a tool.
     *
     * @param CommentData $data The comment data transfer object
     * @param object|null $user The user creating the comment (for activity logging)
     * @return Comment The created comment
     */
    public function execute(CommentData $data, ?object $user = null): Comment
    {
        return DB::transaction(function () use ($data, $user): Comment {
            // Create the comment
            $comment = Comment::create($data->toArray());

            // Update tool's comment count
            $comment->tool()->increment('comments_count', 1);

            // Log activity
            if ($user !== null) {
                activity()
                    ->performedOn($comment)
                    ->causedBy($user)
                    ->withProperties([
                        'tool_id' => $comment->tool_id,
                        'preview' => mb_substr($comment->content, 0, 100),
                    ])
                    ->log('comment_created');
            }

            return $comment->load('user', 'tool');
        });
    }
}
