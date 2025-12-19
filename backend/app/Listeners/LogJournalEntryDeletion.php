<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\JournalEntryDeleted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

final class LogJournalEntryDeletion implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(JournalEntryDeleted $event): void
    {
        // Log journal entry deletion
        \App\Models\Activity::create([
            'subject_type' => get_class($event->entry),
            'subject_id' => $event->entry->id,
            'action' => 'deleted',
            'user_id' => $event->entry->user_id,
            'meta' => [
                'title' => $event->entry->title,
                'mood' => $event->entry->mood,
            ],
        ]);
    }
}
