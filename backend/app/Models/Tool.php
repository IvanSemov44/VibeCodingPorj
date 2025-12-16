<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ToolDifficulty;
use App\Enums\ToolStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property-read int|null $user_id
 */
class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'url', 'docs_url', 'description', 'usage', 'examples', 'difficulty', 'screenshots', 'status',
    ];

    protected $casts = [
        'screenshots' => 'array',
        'difficulty' => ToolDifficulty::class,
        'status' => ToolStatus::class,
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_tool');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'tag_tool');
    }

    public function roles(): BelongsToMany
    {
        // Uses spatie/roles - many to many via role_tool
        return $this->belongsToMany(\Spatie\Permission\Models\Role::class, 'role_tool');
    }

    /**
     * Scope to eager load all standard relationships.
     */
    public function scopeWithRelations($query)
    {
        return $query->with(['categories', 'tags', 'roles']);
    }

    /**
     * Scope to filter by approved status.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', ToolStatus::APPROVED);
    }

    /**
     * Scope to filter by status.
     */
    public function scopeWithStatus($query, ToolStatus $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to search by name or description.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Scope to filter by difficulty.
     */
    public function scopeWithDifficulty($query, ToolDifficulty $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }
}
