<?php

declare(strict_types=1);

namespace App\Actions\User;

use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Support\Facades\DB;

final readonly class UnbanUserAction
{
    public function __construct(
        private AuditLogger $auditLogger,
    ) {}

    /**
     * Unban a previously banned user account.
     *
     * @param User $user The user to unban
     * @param object|null $admin The admin performing the action
     * @return User The unbanned user
     */
    public function execute(User $user, ?object $admin = null): User
    {
        return DB::transaction(function () use ($user, $admin): User {
            $user->update([
                'banned_at' => null,
                'ban_reason' => null,
            ]);

            // Log the activity
            $this->auditLogger->userAction(
                user: $user,
                action: 'unbanned',
                admin: $admin,
            );

            return $user->fresh();
        });
    }
}
