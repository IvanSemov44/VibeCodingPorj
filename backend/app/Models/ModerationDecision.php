<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModerationDecision extends Model
{
    protected $table = 'moderation_decisions';

    protected $fillable = [
        'report_id',
        'moderator_id',
        'decision',
        'reasoning',
        'appealable',
    ];

    protected $casts = [
        'appealable' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations

    public function report(): BelongsTo
    {
        return $this->belongsTo(ContentReport::class, 'report_id');
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderator_id');
    }

    // Helpers

    public function isApproved(): bool
    {
        return $this->decision === 'approve_action';
    }

    public function isRejected(): bool
    {
        return $this->decision === 'reject_report';
    }

    public function isEscalated(): bool
    {
        return $this->decision === 'escalate';
    }

    public function canBeAppealed(): bool
    {
        return $this->appealable;
    }
}
