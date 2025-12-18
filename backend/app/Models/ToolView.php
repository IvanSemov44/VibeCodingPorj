<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $tool_id
 * @property int|null $user_id
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property string|null $referer
 * @property \Illuminate\Support\Carbon $viewed_at
 * @property int|null $view_count
 * @property-read Tool $tool
 * @property-read User|null $user
 */
class ToolView extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'tool_id',
        'user_id',
        'ip_address',
        'user_agent',
        'referer',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    /**
     * Get the tool that was viewed
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    /**
     * Get the user who viewed the tool (if authenticated)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
