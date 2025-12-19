<?php

declare(strict_types=1);

namespace App\Services;

use App\Actions\User\BanUserAction;
use App\Actions\User\SetUserRolesAction;
use App\Actions\User\UnbanUserAction;
use App\DataTransferObjects\UserRoleData;
use App\Models\User;

final readonly class UserService
{
    public function __construct(
        private BanUserAction $banAction,
        private UnbanUserAction $unbanAction,
        private SetUserRolesAction $setRolesAction,
    ) {}

    /**
     * Ban a user account.
     *
     * @param User $user The user to ban
     * @param string|null $reason The reason for banning
     * @param object|null $admin The admin performing the action
     * @return User The banned user
     */
    public function ban(User $user, ?string $reason = null, ?object $admin = null): User
    {
        return $this->banAction->execute($user, $reason, $admin);
    }

    /**
     * Unban a user account.
     *
     * @param User $user The user to unban
     * @param object|null $admin The admin performing the action
     * @return User The unbanned user
     */
    public function unban(User $user, ?object $admin = null): User
    {
        return $this->unbanAction->execute($user, $admin);
    }

    /**
     * Set user roles.
     *
     * @param User $user The user to assign roles to
     * @param UserRoleData $data The roles data
     * @param object|null $admin The admin performing the action
     * @return User The user with updated roles
     */
    public function setRoles(User $user, UserRoleData $data, ?object $admin = null): User
    {
        return $this->setRolesAction->execute($user, $data, $admin);
    }
}
