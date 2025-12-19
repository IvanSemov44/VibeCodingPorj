<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class SearchLog extends Model
{
    protected $fillable = [
        'user_id',
        'query',
        'search_type',
        'results_count',
        'response_time_ms',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'results_count' => 'integer',
        'response_time_ms' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
