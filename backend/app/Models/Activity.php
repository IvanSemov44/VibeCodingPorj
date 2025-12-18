<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $subject_type
 * @property int $subject_id
 * @property string $action
 * @property int|null $user_id
 * @property array|null $meta
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read User|null $user
 */
class Activity extends Model
{
    // Allow Eloquent to treat `created_at` as a timestamp/carbon instance
    public $timestamps = true;

    protected $fillable = [
        'subject_type',
        'subject_id',
        'action',
        'user_id',
        'meta',
        'created_at',
    ];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
