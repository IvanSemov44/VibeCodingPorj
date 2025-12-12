<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['owner', 'admin']);
    }

    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Users can view their own profile, admins can view any
        return $user->id === $model->id || $user->hasRole(['owner', 'admin']);
    }

    /**
     * Determine if the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole(['owner', 'admin']);
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        // Users can update their own profile
        if ($user->id === $model->id) {
            return true;
        }

        // Admins can update users except owners
        if ($user->hasRole('admin') && ! $model->hasRole('owner')) {
            return true;
        }

        // Owners can update anyone
        return $user->hasRole('owner');
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Cannot delete yourself
        if ($user->id === $model->id) {
            return false;
        }

        // Admins can delete users except owners
        if ($user->hasRole('admin') && ! $model->hasRole('owner')) {
            return true;
        }

        // Owners can delete anyone except themselves
        return $user->hasRole('owner');
    }

    /**
     * Determine if the user can ban/activate the model.
     */
    public function manageStatus(User $user, User $model): bool
    {
        // Cannot ban yourself
        if ($user->id === $model->id) {
            return false;
        }

        // Admins can manage status except for owners
        if ($user->hasRole('admin') && ! $model->hasRole('owner')) {
            return true;
        }

        // Owners can manage anyone's status except their own
        return $user->hasRole('owner');
    }

    /**
     * Determine if the user can manage 2FA for other users.
     */
    public function manage2FA(User $user, User $model): bool
    {
        // Users can manage their own 2FA
        if ($user->id === $model->id) {
            return true;
        }

        // Only owners can manage 2FA for other users
        return $user->hasRole('owner');
    }
}
