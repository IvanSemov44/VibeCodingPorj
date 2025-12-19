<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Analytics Trending Model
 * Tracks trending tools and scores
 *
 * @property int $id
 * @property int $tool_id
 * @property int $view_count
 * @property int $comment_count
 * @property int $rating_count
 * @property float $average_rating
 * @property float $trend_score
 * @property string $period
 * @property string $date
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class AnalyticsTrending extends Model
{
    protected $fillable = [
        'tool_id',
        'view_count',
        'comment_count',
        'rating_count',
        'average_rating',
        'trend_score',
        'period',
        'date',
    ];

    protected $casts = [
        'view_count' => 'int',
        'comment_count' => 'int',
        'rating_count' => 'int',
        'average_rating' => 'float',
        'trend_score' => 'float',
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }
}
