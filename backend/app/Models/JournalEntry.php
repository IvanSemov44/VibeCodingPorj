<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string $content
 * @property string|null $mood
 * @property array|null $tags
 * @property int|null $xp
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read User $user
 */
class JournalEntry extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'content',
        'mood',
        'tags',
        'xp',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tags' => 'array',
        'xp' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the journal entry.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include entries with a specific mood.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $mood
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByMood($query, $mood)
    {
        return $query->where('mood', $mood);
    }

    /**
     * Scope a query to only include entries with a specific tag.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $tag
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByTag($query, $tag)
    {
        return $query->whereJsonContains('tags', $tag);
    }

    /**
     * Scope a query to search entries by title or content.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('content', 'like', "%{$search}%");
        });
    }
}
