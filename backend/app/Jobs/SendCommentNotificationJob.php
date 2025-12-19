<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\CommentNotificationMailable;
use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

final class SendCommentNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly Comment $comment,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Send notifications to tool owner and parent comment author
        $tool = $this->comment->tool;
        $user = $this->comment->user;

        // Notify tool owner if comment is on their tool and not by tool owner
        if ($tool->user_id !== $user->id) {
            Mail::send(new CommentNotificationMailable($this->comment, 'owner'));
        }

        // Notify parent comment author if this is a reply
        if ($this->comment->parent_id !== null) {
            $parentComment = $this->comment->parent;
            if ($parentComment->user_id !== $user->id) {
                Mail::send(new CommentNotificationMailable($this->comment, 'parent_author'));
            }
        }

        // Log job completion
        \Log::info('Comment notification job processed', [
            'comment_id' => $this->comment->id,
            'user_id' => $user->id,
        ]);
    }
}
