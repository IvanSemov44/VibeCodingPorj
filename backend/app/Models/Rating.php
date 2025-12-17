<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
