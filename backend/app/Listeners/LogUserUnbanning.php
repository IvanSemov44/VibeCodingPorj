<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\UserUnbanned;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

final class LogUserUnbanning implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(UserUnbanned $event): void
    {
        // Log user unban
        \App\Models\Activity::create([
            'subject_type' => get_class($event->user),
            'subject_id' => $event->user->id,
            'action' => 'unbanned',
            'user_id' => auth()?->id(),
            'meta' => [
                'email' => $event->user->email,
            ],
        ]);
    }
}
