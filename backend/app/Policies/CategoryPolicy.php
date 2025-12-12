<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    /**
     * Determine if the user can view any categories.
     */
    public function viewAny(?User $user): bool
    {
        // Categories are public
        return true;
    }

    /**
     * Determine if the user can view the category.
     */
    public function view(?User $user, Category $category): bool
    {
        // Categories are public
        return true;
    }

    /**
     * Determine if the user can create categories.
     */
    public function create(User $user): bool
    {
        return $user->hasRole(['owner', 'admin']);
    }

    /**
     * Determine if the user can update the category.
     */
    public function update(User $user, Category $category): bool
    {
        return $user->hasRole(['owner', 'admin']);
    }

    /**
     * Determine if the user can delete the category.
     */
    public function delete(User $user, Category $category): bool
    {
        return $user->hasRole(['owner', 'admin']);
    }
}
