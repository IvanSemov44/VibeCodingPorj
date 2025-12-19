<?php

declare(strict_types=1);

namespace App\Services;

use App\Actions\Comment\CreateCommentAction;
use App\Actions\Comment\DeleteCommentAction;
use App\Actions\Comment\ModerateCommentAction;
use App\DataTransferObjects\CommentData;
use App\Models\Comment;

final readonly class CommentService
{
    public function __construct(
        private CreateCommentAction $createAction,
        private DeleteCommentAction $deleteAction,
        private ModerateCommentAction $moderateAction,
    ) {}

    /**
     * Create a new comment.
     *
     * @param CommentData $data The comment data transfer object
     * @param object|null $user The user creating the comment
     * @return Comment The created comment
     */
    public function create(CommentData $data, ?object $user = null): Comment
    {
        return $this->createAction->execute($data, $user);
    }

    /**
     * Delete a comment.
     *
     * @param Comment $comment The comment to delete
     * @param object|null $user The user deleting the comment
     * @return bool True if deletion was successful
     */
    public function delete(Comment $comment, ?object $user = null): bool
    {
        return $this->deleteAction->execute($comment, $user);
    }

    /**
     * Moderate a comment (approve or reject).
     *
     * @param Comment $comment The comment to moderate
     * @param bool $approved Whether the comment is approved
     * @param object|null $moderator The admin/moderator
     * @return Comment The moderated comment
     */
    public function moderate(Comment $comment, bool $approved, ?object $moderator = null): Comment
    {
        return $this->moderateAction->execute($comment, $approved, $moderator);
    }
}
