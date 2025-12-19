<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\UserBanned;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

final class LogUserBanning implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(UserBanned $event): void
    {
        // Log user ban
        \App\Models\Activity::create([
            'subject_type' => get_class($event->user),
            'subject_id' => $event->user->id,
            'action' => 'banned',
            'user_id' => auth()?->id(),
            'meta' => [
                'reason' => $event->reason,
                'duration' => $event->duration,
                'email' => $event->user->email,
            ],
        ]);
    }
}
