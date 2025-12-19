<?php

declare(strict_types=1);

namespace App\Actions\Comment;

use App\Models\Comment;
use Illuminate\Support\Facades\DB;

final class DeleteCommentAction
{
    /**
     * Delete a comment.
     *
     * @param Comment $comment The comment to delete
     * @param object|null $user The user deleting the comment (for activity logging)
     * @return bool True if deletion was successful
     */
    public function execute(Comment $comment, ?object $user = null): bool
    {
        return DB::transaction(function () use ($comment, $user): bool {
            $toolId = $comment->tool_id;

            // Log activity before deletion
            if ($user !== null) {
                activity()
                    ->performedOn($comment)
                    ->causedBy($user)
                    ->withProperties(['tool_id' => $toolId])
                    ->log('comment_deleted');
            }

            // Delete the comment
            $deleted = $comment->delete() !== false;

            if ($deleted) {
                // Decrement tool's comment count
                $comment->tool()->decrement('comments_count', 1);
            }

            return $deleted;
        });
    }
}
