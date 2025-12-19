<?php

declare(strict_types=1);

namespace App\Services;

use App\Actions\Journal\CreateJournalEntryAction;
use App\Actions\Journal\DeleteJournalEntryAction;
use App\Actions\Journal\UpdateJournalEntryAction;
use App\DataTransferObjects\JournalEntryData;
use App\Models\JournalEntry;

final readonly class JournalService
{
    public function __construct(
        private CreateJournalEntryAction $createAction,
        private UpdateJournalEntryAction $updateAction,
        private DeleteJournalEntryAction $deleteAction,
    ) {}

    /**
     * Create a new journal entry.
     *
     * @param JournalEntryData $data The journal entry data transfer object
     * @param object|null $user The user creating the entry
     * @return JournalEntry The created journal entry
     */
    public function create(JournalEntryData $data, ?object $user = null): JournalEntry
    {
        return $this->createAction->execute($data, $user);
    }

    /**
     * Update an existing journal entry.
     *
     * @param JournalEntry $entry The journal entry to update
     * @param JournalEntryData $data The updated journal entry data
     * @param object|null $user The user performing the update
     * @return JournalEntry The updated journal entry
     */
    public function update(JournalEntry $entry, JournalEntryData $data, ?object $user = null): JournalEntry
    {
        return $this->updateAction->execute($entry, $data, $user);
    }

    /**
     * Delete a journal entry.
     *
     * @param JournalEntry $entry The journal entry to delete
     * @param object|null $user The user deleting the entry
     * @return bool True if deletion was successful
     */
    public function delete(JournalEntry $entry, ?object $user = null): bool
    {
        return $this->deleteAction->execute($entry, $user);
    }
}
