<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\CommentCreatedEvent;
use App\Services\NotificationService;

final class SendCommentNotificationListener
{
    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    public function handle(CommentCreatedEvent $event): void
    {
        // Notify tool owner if not the comment author
        if ($event->tool->user_id !== $event->comment->user_id) {
            $this->notificationService->createNotification(
                user: $event->tool->user,
                type: 'comment_created',
                data: [
                    'comment_id' => $event->comment->id,
                    'tool_id' => $event->tool->id,
                    'tool_name' => $event->tool->name,
                    'commenter_id' => $event->comment->user_id,
                    'commenter_name' => $event->comment->user->name,
                    'comment_content' => $event->comment->content,
                ]
            );
        }

        // Notify parent comment author if this is a reply
        if ($event->comment->parent_id !== null) {
            $parentComment = $event->comment->parent;
            if ($parentComment && $parentComment->user_id !== $event->comment->user_id) {
                $this->notificationService->createNotification(
                    user: $parentComment->user,
                    type: 'comment_replied',
                    data: [
                        'comment_id' => $event->comment->id,
                        'parent_comment_id' => $parentComment->id,
                        'tool_id' => $event->tool->id,
                        'replier_id' => $event->comment->user_id,
                        'replier_name' => $event->comment->user->name,
                    ]
                );
            }
        }
    }
}
