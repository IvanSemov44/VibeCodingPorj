<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ToolDifficulty;
use App\Enums\ToolStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $url
 * @property string|null $docs_url
 * @property string|null $description
 * @property string|null $usage
 * @property string|null $examples
 * @property ToolDifficulty|null $difficulty
 * @property array|null $screenshots
 * @property ToolStatus $status
 * @property int|null $submitted_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * 
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Category> $categories
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Tag> $tags
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read User|null $user
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
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
        return $query->with(['categories', 'tags', 'roles', 'user']);
    }

    /**
     * Lean relations used for search results to reduce query load and payload.
     */
    public function scopeWithRelationsForSearch($query)
    {
        return $query->with([
            'categories:id,name,slug',
            'tags:id,name,slug',
        ]);
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
