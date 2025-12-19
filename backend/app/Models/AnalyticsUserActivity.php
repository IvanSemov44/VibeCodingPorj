<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Analytics User Activity Model
 * Tracks user activities (create, update, view, etc)
 *
 * @property int $id
 * @property int $user_id
 * @property string $activity_type
 * @property int|null $tool_id
 * @property array|null $activity_data
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class AnalyticsUserActivity extends Model
{
    protected $fillable = [
        'user_id',
        'activity_type',
        'tool_id',
        'activity_data',
    ];

    protected $casts = [
        'activity_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }
}
