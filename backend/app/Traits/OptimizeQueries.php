<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * OptimizeQueries Trait
 *
 * Provides helper methods for optimizing database queries with eager loading
 * and relationship count loading to prevent N+1 query problems.
 */
trait OptimizeQueries
{
    /**
     * Scope to add all standard relationships with optimized column selection.
     */
    public function scopeWithOptimizedRelations(Builder $query): Builder
    {
        // Load relationships with minimal columns
        $query->with([
            'user:id,name,email,avatar',
            'categories:id,name,slug',
            'tags:id,name,slug',
        ]);

        // Load counts for aggregation without loading full relationships
        if (method_exists($this, 'comments')) {
            $query->withCount('comments');
        }

        if (method_exists($this, 'ratings')) {
            $query->withCount('ratings')->withAvg('ratings', 'rating');
        }

        if (method_exists($this, 'favorites')) {
            $query->withCount('favorites');
        }

        return $query;
    }

    /**
     * Scope to eager load only essential relationships for list views.
     */
    public function scopeWithLeanRelations(Builder $query): Builder
    {
        return $query->with([
            'user:id,name,email',
            'categories:id,name,slug',
        ])->withCount(['comments', 'ratings']);
    }

    /**
     * Scope to eager load relationships for detail views.
     */
    public function scopeWithFullRelations(Builder $query): Builder
    {
        return $query->with([
            'user:id,name,email,avatar,bio,created_at',
            'categories',
            'tags',
        ])
            ->withCount(['comments', 'ratings', 'favorites'])
            ->withAvg('ratings', 'rating');
    }

    /**
     * Scope to eager load relationships for search results.
     */
    public function scopeWithSearchRelations(Builder $query): Builder
    {
        // Search results need minimal data
        return $query->with([
            'user:id,name,email',
            'categories:id,name,slug',
            'tags:id,name,slug',
        ])->select([
            'id', 'name', 'description', 'user_id',
            'created_at', 'rating_count', 'comment_count',
        ]);
    }

    /**
     * Scope to eager load relationships for admin views.
     */
    public function scopeWithAdminRelations(Builder $query): Builder
    {
        return $query->with([
            'user:id,name,email,created_at',
            'categories',
            'tags',
        ])
            ->withCount(['comments', 'ratings', 'favorites'])
            ->withAvg('ratings', 'rating');
    }

    /**
     * Scope to only select necessary columns for performance.
     */
    public function scopeSelectOptimized(Builder $query, ?array $columns = null): Builder
    {
        if ($columns === null) {
            // Default columns for most views
            $columns = ['id', 'name', 'slug', 'created_at', 'updated_at'];
        }

        return $query->select($columns);
    }

    /**
     * Scope to chunk results for memory efficiency with large datasets.
     */
    public function scopeChunkForProcessing(Builder $query, int $chunkSize = 1000)
    {
        return $query->chunk($chunkSize);
    }
}
