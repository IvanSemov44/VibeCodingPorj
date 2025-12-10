<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Tool;

class ToolPolicy
{
    /**
     * Determine whether the user can view any tools.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the tool.
     */
    public function view(?User $user, Tool $tool): bool
    {
        return true;
    }

    /**
     * Any authenticated user may create a tool.
     */
    public function create(User $user): bool
    {
        return $user !== null;
    }

    /**
     * Update allowed if user is owner role or shares any role assigned to the tool.
     */
    public function update(User $user, Tool $tool): bool
    {
        if ($user->hasRole('owner')) return true;

        $userRoles = $user->getRoleNames()->toArray();
        $toolRoles = $tool->roles()->pluck('name')->toArray();

        return (count(array_intersect($userRoles, $toolRoles)) > 0);
    }

    /**
     * Delete follows same rules as update.
     */
    public function delete(User $user, Tool $tool): bool
    {
        return $this->update($user, $tool);
    }
}
