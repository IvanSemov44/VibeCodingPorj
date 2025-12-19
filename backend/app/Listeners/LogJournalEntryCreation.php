<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\JournalEntryCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

final class LogJournalEntryCreation implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(JournalEntryCreated $event): void
    {
        // Log journal entry creation
        \App\Models\Activity::create([
            'subject_type' => get_class($event->entry),
            'subject_id' => $event->entry->id,
            'action' => 'created',
            'user_id' => $event->entry->user_id,
            'meta' => [
                'title' => $event->entry->title,
                'mood' => $event->entry->mood,
            ],
        ]);
    }
}
