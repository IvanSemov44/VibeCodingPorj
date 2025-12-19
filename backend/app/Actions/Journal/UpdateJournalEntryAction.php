<?php

declare(strict_types=1);

namespace App\Actions\Journal;

use App\DataTransferObjects\JournalEntryData;
use App\Models\JournalEntry;
use Illuminate\Support\Facades\DB;

final class UpdateJournalEntryAction
{
    /**
     * Update an existing journal entry.
     *
     * @param JournalEntry $entry The journal entry to update
     * @param JournalEntryData $data The updated journal entry data
     * @param object|null $user The user performing the update (for activity logging)
     * @return JournalEntry The updated journal entry
     */
    public function execute(JournalEntry $entry, JournalEntryData $data, ?object $user = null): JournalEntry
    {
        return DB::transaction(function () use ($entry, $data, $user): JournalEntry {
            // Update the journal entry
            $entry->update($data->toArray());

            // Log activity
            if ($user !== null) {
                activity()
                    ->performedOn($entry)
                    ->causedBy($user)
                    ->withProperties(['title' => $entry->title])
                    ->log('journal_entry_updated');
            }

            return $entry->refresh();
        });
    }
}
