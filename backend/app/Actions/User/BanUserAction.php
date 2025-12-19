<?php

declare(strict_types=1);

namespace App\Actions\User;

use App\Events\UserBanned;
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
     * @param string $duration The ban duration (1h, 1d, 1w, permanent)
     * @param object|null $admin The admin performing the action
     * @return User The banned user
     */
    public function execute(User $user, ?string $reason = null, string $duration = 'permanent', ?object $admin = null): User
    {
        return DB::transaction(function () use ($user, $reason, $duration, $admin): User {
            $bannedUntil = match ($duration) {
                '1h' => now()->addHour(),
                '1d' => now()->addDay(),
                '1w' => now()->addWeek(),
                default => null,
            };

            $user->update([
                'is_banned' => true,
                'banned_until' => $bannedUntil,
                'ban_reason' => $reason,
            ]);

            // Log the activity
            $this->auditLogger->userAction(
                user: $user,
                action: 'banned',
                admin: $admin,
                context: ['reason' => $reason, 'duration' => $duration],
            );

            // Dispatch event
            UserBanned::dispatch($user, $reason ?? 'No reason provided', $duration);

            return $user->fresh();
        });
    }
}
