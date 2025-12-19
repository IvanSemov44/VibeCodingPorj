<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContentReport extends Model
{
    protected $table = 'content_reports';

    protected $fillable = [
        'user_id',
        'reported_user_id',
        'reportable_type',
        'reportable_id',
        'reason',
        'description',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reportedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    public function reportable(): MorphTo
    {
        return $this->morphTo();
    }

    public function decision(): HasOne
    {
        return $this->hasOne(ModerationDecision::class, 'report_id');
    }

    public function queueItem(): HasOne
    {
        return $this->hasOne(ModerationQueue::class, 'report_id');
    }

    // Helpers

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isUnderReview(): bool
    {
        return $this->status === 'under_review';
    }

    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }

    public function isDismissed(): bool
    {
        return $this->status === 'dismissed';
    }
}
