<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Analytics Category Stats Model
 * Tracks category statistics
 *
 * @property int $id
 * @property int $category_id
 * @property int $tool_count
 * @property int $total_views
 * @property int $total_comments
 * @property int $total_ratings
 * @property float $average_rating
 * @property string $period
 * @property string $date
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class AnalyticsCategoryStat extends Model
{
    protected $table = 'analytics_category_stats';

    protected $fillable = [
        'category_id',
        'tool_count',
        'total_views',
        'total_comments',
        'total_ratings',
        'average_rating',
        'period',
        'date',
    ];

    protected $casts = [
        'tool_count' => 'int',
        'total_views' => 'int',
        'total_comments' => 'int',
        'total_ratings' => 'int',
        'average_rating' => 'float',
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
