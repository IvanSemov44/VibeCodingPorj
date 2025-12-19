<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ModerationAction extends Model
{
    protected $table = 'moderation_actions';

    protected $fillable = [
        'moderator_id',
        'report_id',
        'user_id',
        'actionable_type',
        'actionable_id',
        'action',
        'reason',
        'duration_days',
        'notes',
    ];

    protected $casts = [
        'duration_days' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderator_id');
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(ContentReport::class, 'report_id');
    }

    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function actionable(): MorphTo
    {
        return $this->morphTo();
    }

    // Helpers

    public function isContentRemoval(): bool
    {
        return $this->action === 'content_remove';
    }

    public function isContentHide(): bool
    {
        return $this->action === 'content_hide';
    }

    public function isUserAction(): bool
    {
        return in_array($this->action, ['user_warn', 'user_suspend', 'user_ban', 'user_restore']);
    }

    public function isSuspension(): bool
    {
        return $this->action === 'user_suspend';
    }

    public function isBan(): bool
    {
        return $this->action === 'user_ban';
    }

    public function isTemporary(): bool
    {
        return $this->duration_days !== null;
    }
}
