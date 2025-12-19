<?php

declare(strict_types=1);

namespace App\Actions\User;

use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Support\Facades\DB;

final readonly class BanUserAction
{
    public function __construct(
        private AuditLogger $auditLogger,
    ) {}

    /**
     * Ban a user account.
     *
     * @param User $user The user to ban
     * @param string|null $reason The reason for banning
     * @param object|null $admin The admin performing the action
     * @return User The banned user
     */
    public function execute(User $user, ?string $reason = null, ?object $admin = null): User
    {
        return DB::transaction(function () use ($user, $reason, $admin): User {
            $user->update([
                'banned_at' => now(),
                'ban_reason' => $reason,
            ]);

            // Log the activity
            $this->auditLogger->userAction(
                user: $user,
                action: 'banned',
                admin: $admin,
                context: ['reason' => $reason],
            );

            return $user->fresh();
        });
    }
}
