<?php

namespace App\Policies;

use App\Models\JournalEntry;
use App\Models\User;

class JournalEntryPolicy
{
    /**
     * Determine if the user can view any journal entries.
     */
    public function viewAny(User $user): bool
    {
        // Users can only view their own journal entries
        return true;
    }

    /**
     * Determine if the user can view the journal entry.
     */
    public function view(User $user, JournalEntry $journalEntry): bool
    {
        // Users can only view their own entries
        return $user->id === $journalEntry->user_id;
    }

    /**
     * Determine if the user can create journal entries.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create journal entries
        return true;
    }

    /**
     * Determine if the user can update the journal entry.
     */
    public function update(User $user, JournalEntry $journalEntry): bool
    {
        // Users can only update their own entries
        return $user->id === $journalEntry->user_id;
    }

    /**
     * Determine if the user can delete the journal entry.
     */
    public function delete(User $user, JournalEntry $journalEntry): bool
    {
        // Users can only delete their own entries
        return $user->id === $journalEntry->user_id;
    }
}
