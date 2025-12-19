<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModerationAppeal extends Model
{
    protected $table = 'moderation_appeals';

    protected $fillable = [
        'user_id',
        'moderation_action_id',
        'reason',
        'status',
        'reviewed_by',
        'review_notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function moderationAction(): BelongsTo
    {
        return $this->belongsTo(ModerationAction::class, 'moderation_action_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Helpers

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function approve(User $reviewer, string $notes = ''): void
    {
        $this->update([
            'status' => 'approved',
            'reviewed_by' => $reviewer->id,
            'review_notes' => $notes,
        ]);
    }

    public function reject(User $reviewer, string $notes = ''): void
    {
        $this->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewer->id,
            'review_notes' => $notes,
        ]);
    }
}
