<?php

declare(strict_types=1);

namespace App\Actions\Journal;

use App\Events\JournalEntryDeleted;
use App\Models\JournalEntry;
use Illuminate\Support\Facades\DB;

final class DeleteJournalEntryAction
{
    /**
     * Delete a journal entry.
     *
     * @param JournalEntry $entry The journal entry to delete
     * @param object|null $user The user deleting the entry (for activity logging)
     * @return bool True if deletion was successful
     */
    public function execute(JournalEntry $entry, ?object $user = null): bool
    {
        return DB::transaction(function () use ($entry, $user): bool {
            $title = $entry->title;

            // Log activity before deletion
            if ($user !== null) {
                activity()
                    ->performedOn($entry)
                    ->causedBy($user)
                    ->withProperties(['title' => $title])
                    ->log('journal_entry_deleted');
            }

            // Dispatch event before deletion
            JournalEntryDeleted::dispatch($entry);

            // Delete the entry
            return $entry->delete() !== false;
        });
    }
}
