<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\CommentCreated;
use App\Jobs\SendCommentNotificationJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

final class SendCommentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(CommentCreated $event): void
    {
        // Dispatch async job to send notifications
        SendCommentNotificationJob::dispatch($event->comment);
    }
}
