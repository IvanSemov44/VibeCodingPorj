<?php

namespace App\Policies;

use App\Models\Tag;
use App\Models\User;

class TagPolicy
{
    /**
     * Determine if the user can view any tags.
     */
    public function viewAny(?User $user): bool
    {
        // Tags are public
        return true;
    }

    /**
     * Determine if the user can view the tag.
     */
    public function view(?User $user, Tag $tag): bool
    {
        // Tags are public
        return true;
    }

    /**
     * Determine if the user can create tags.
     */
    public function create(User $user): bool
    {
        // Authenticated users can create tags
        return true;
    }

    /**
     * Determine if the user can update the tag.
     */
    public function update(User $user, Tag $tag): bool
    {
        return $user->hasRole(['owner', 'admin']);
    }

    /**
     * Determine if the user can delete the tag.
     */
    public function delete(User $user, Tag $tag): bool
    {
        return $user->hasRole(['owner', 'admin']);
    }
}
