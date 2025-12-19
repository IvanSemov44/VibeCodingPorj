<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Analytics Page Views Model
 * Tracks page views and load times
 *
 * @property int $id
 * @property int|null $user_id
 * @property int|null $tool_id
 * @property string $page_path
 * @property string|null $referrer
 * @property string|null $user_agent
 * @property string|null $ip_address
 * @property int $response_time_ms
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class AnalyticsPageView extends Model
{
    protected $fillable = [
        'user_id',
        'tool_id',
        'page_path',
        'referrer',
        'user_agent',
        'ip_address',
        'response_time_ms',
    ];

    protected $casts = [
        'response_time_ms' => 'int',
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
