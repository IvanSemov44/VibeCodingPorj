<?php

declare(strict_types=1);

namespace App\Actions\User;

use App\DataTransferObjects\UserRoleData;
use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Support\Facades\DB;

final readonly class SetUserRolesAction
{
    public function __construct(
        private AuditLogger $auditLogger,
    ) {}

    /**
     * Set user roles.
     *
     * @param User $user The user to assign roles to
     * @param UserRoleData $data The roles data transfer object
     * @param object|null $admin The admin performing the action
     * @return User The user with updated roles
     */
    public function execute(User $user, UserRoleData $data, ?object $admin = null): User
    {
        return DB::transaction(function () use ($user, $data, $admin): User {
            $oldRoles = $user->getRoleNames()->toArray();

            // Sync roles
            $user->syncRoles($data->roles);

            // Log the activity
            $this->auditLogger->userAction(
                user: $user,
                action: 'roles_changed',
                admin: $admin,
                context: [
                    'old_roles' => $oldRoles,
                    'new_roles' => $data->roles,
                ],
            );

            return $user->fresh()->load('roles');
        });
    }
}
