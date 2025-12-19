<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModerationQueue extends Model
{
    protected $table = 'moderation_queue';

    protected $fillable = [
        'report_id',
        'assigned_to',
        'priority',
        'assigned_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations

    public function report(): BelongsTo
    {
        return $this->belongsTo(ContentReport::class, 'report_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Helpers

    public function isAssigned(): bool
    {
        return $this->assigned_to !== null;
    }

    public function isUrgent(): bool
    {
        return $this->priority === 'urgent';
    }

    public function isHigh(): bool
    {
        return $this->priority === 'high';
    }

    public function assign(User $moderator): void
    {
        $this->update([
            'assigned_to' => $moderator->id,
            'assigned_at' => now(),
        ]);
    }

    public function unassign(): void
    {
        $this->update([
            'assigned_to' => null,
            'assigned_at' => null,
        ]);
    }
}
