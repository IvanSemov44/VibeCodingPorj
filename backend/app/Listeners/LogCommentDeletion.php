<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\CommentDeleted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

final class LogCommentDeletion implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(CommentDeleted $event): void
    {
        // Log comment deletion
        \App\Models\Activity::create([
            'subject_type' => get_class($event->comment),
            'subject_id' => $event->comment->id,
            'action' => 'deleted',
            'user_id' => auth()?->id(),
            'meta' => [
                'content' => substr($event->comment->content, 0, 100),
                'tool_id' => $event->comment->tool_id,
            ],
        ]);
    }
}
