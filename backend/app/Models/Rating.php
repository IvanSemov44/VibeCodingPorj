<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $tool_id
 * @property int $user_id
 * @property int $score
 * @property string|null $review
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read Tool $tool
 * @property-read User $user
 */
class Rating extends Model
{
    protected $fillable = [
        'tool_id',
        'user_id',
        'score',
        'review',
    ];

    protected $casts = [
        'score' => 'integer',
    ];

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        // Update tool average rating when rating is created/updated
        static::saved(function ($rating) {
            $rating->tool->updateAverageRating();
        });

        static::deleted(function ($rating) {
            $rating->tool->updateAverageRating();
        });
    }
}
