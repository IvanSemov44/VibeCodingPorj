<?php

declare(strict_types=1);

namespace App\Actions\Journal;

use App\DataTransferObjects\JournalEntryData;
use App\Events\JournalEntryCreated;
use App\Models\JournalEntry;
use Illuminate\Support\Facades\DB;

final class CreateJournalEntryAction
{
    /**
     * Create a new journal entry.
     *
     * @param JournalEntryData $data The journal entry data transfer object
     * @param object|null $user The user creating the entry (for activity logging)
     * @return JournalEntry The created journal entry
     */
    public function execute(JournalEntryData $data, ?object $user = null): JournalEntry
    {
        return DB::transaction(function () use ($data, $user): JournalEntry {
            // Create the journal entry
            $entry = JournalEntry::create($data->toArray());

            // Log activity
            if ($user !== null) {
                activity()
                    ->performedOn($entry)
                    ->causedBy($user)
                    ->withProperties(['title' => $entry->title])
                    ->log('journal_entry_created');
            }

            // Dispatch event
            JournalEntryCreated::dispatch($entry);

            return $entry;
        });
    }
}
