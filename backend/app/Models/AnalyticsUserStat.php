<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Analytics User Stats Model
 * Tracks user statistics and activity
 *
 * @property int $id
 * @property int $user_id
 * @property int $tools_created
 * @property int $comments_posted
 * @property int $ratings_given
 * @property int $tools_viewed
 * @property int $login_count
 * @property int $page_views
 * @property int $activity_score
 * @property string $period
 * @property string $date
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class AnalyticsUserStat extends Model
{
    protected $table = 'analytics_user_stats';

    protected $fillable = [
        'user_id',
        'tools_created',
        'comments_posted',
        'ratings_given',
        'tools_viewed',
        'login_count',
        'page_views',
        'activity_score',
        'period',
        'date',
    ];

    protected $casts = [
        'tools_created' => 'int',
        'comments_posted' => 'int',
        'ratings_given' => 'int',
        'tools_viewed' => 'int',
        'login_count' => 'int',
        'page_views' => 'int',
        'activity_score' => 'int',
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
