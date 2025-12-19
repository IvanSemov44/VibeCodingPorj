<?php

declare(strict_types=1);

namespace App\Actions\Comment;

use App\Models\Comment;
use Illuminate\Support\Facades\DB;

final class ModerateCommentAction
{
    /**
     * Moderate a comment (approve or reject).
     *
     * @param Comment $comment The comment to moderate
     * @param bool $approved Whether the comment is approved
     * @param object|null $moderator The admin/moderator approving the comment
     * @return Comment The moderated comment
     */
    public function execute(Comment $comment, bool $approved, ?object $moderator = null): Comment
    {
        return DB::transaction(function () use ($comment, $approved, $moderator): Comment {
            $comment->update([
                'is_moderated' => true,
                'moderated_by' => $moderator?->id,
                'moderated_at' => now(),
                'status' => $approved ? 'approved' : 'rejected',
            ]);

            // Log activity
            if ($moderator !== null) {
                activity()
                    ->performedOn($comment)
                    ->causedBy($moderator)
                    ->withProperties([
                        'tool_id' => $comment->tool_id,
                        'action' => $approved ? 'approved' : 'rejected',
                    ])
                    ->log('comment_moderated');
            }

            return $comment->fresh();
        });
    }
}
