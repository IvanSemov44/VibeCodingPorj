<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserModerationStatus extends Model
{
    protected $table = 'user_moderation_status';

    protected $fillable = [
        'user_id',
        'is_suspended',
        'is_banned',
        'suspension_ends_at',
        'warning_count',
        'suspension_reason',
        'ban_reason',
    ];

    protected $casts = [
        'is_suspended' => 'boolean',
        'is_banned' => 'boolean',
        'suspension_ends_at' => 'date',
        'warning_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helpers

    public function isSuspended(): bool
    {
        return $this->is_suspended && (
            $this->suspension_ends_at === null ||
            $this->suspension_ends_at->isFuture()
        );
    }

    public function isBanned(): bool
    {
        return $this->is_banned;
    }

    public function canAccess(): bool
    {
        return !$this->isBanned() && !$this->isSuspended();
    }

    public function getSuspensionDaysRemaining(): ?int
    {
        if (!$this->isSuspended()) {
            return null;
        }

        return $this->suspension_ends_at->diffInDays(now());
    }

    public function incrementWarning(): void
    {
        $this->increment('warning_count');
    }

    public function resetWarnings(): void
    {
        $this->update(['warning_count' => 0]);
    }
}
