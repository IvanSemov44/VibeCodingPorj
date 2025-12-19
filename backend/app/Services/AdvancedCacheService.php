<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * AdvancedCacheService
 *
 * Provides intelligent caching with tags, TTL management, and cache warming.
 */
final class AdvancedCacheService
{
    /**
     * Cache configuration with TTL and tags.
     */
    private const CACHE_CONFIG = [
        'static_lists' => [
            'ttl' => 3600,  // 1 hour
            'tags' => ['meta', 'lists'],
        ],
        'user_data' => [
            'ttl' => 900,   // 15 minutes
            'tags' => ['user', 'profile'],
        ],
        'search_results' => [
            'ttl' => 300,   // 5 minutes
            'tags' => ['search', 'results'],
        ],
        'trending' => [
            'ttl' => 1800,  // 30 minutes
            'tags' => ['trending', 'analytics'],
        ],
        'analytics' => [
            'ttl' => 600,   // 10 minutes
            'tags' => ['analytics', 'metrics'],
        ],
    ];

    /**
     * Remember a value with intelligent caching.
     *
     * @template T
     *
     * @param  string  $key Cache key
     * @param  string  $type Cache type (from CACHE_CONFIG)
     * @param  callable(): T  $callback Function to generate value
     * @return T
     */
    public function remember(string $key, string $type, callable $callback): mixed
    {
        $config = self::CACHE_CONFIG[$type] ?? null;

        if (!$config) {
            Log::warning("Unknown cache type: {$type}");
            return $callback();
        }

        $ttl = $config['ttl'];
        $tags = $config['tags'];

        try {
            if ($this->supportsTagging()) {
                return Cache::tags($tags)->remember($key, $ttl, $callback);
            }

            return Cache::remember($key, $ttl, $callback);
        } catch (\Throwable $e) {
            Log::warning("Cache operation failed for key {$key}: " . $e->getMessage());
            return $callback();
        }
    }

    /**
     * Invalidate cache by type.
     */
    public function invalidateByType(string $type): void
    {
        $config = self::CACHE_CONFIG[$type] ?? null;

        if (!$config) {
            return;
        }

        $tags = $config['tags'];

        try {
            if ($this->supportsTagging()) {
                foreach ($tags as $tag) {
                    Cache::tags([$tag])->flush();
                }
            }
        } catch (\Throwable $e) {
            Log::warning("Failed to invalidate cache type {$type}: " . $e->getMessage());
        }
    }

    /**
     * Invalidate multiple cache types.
     */
    public function invalidateByTypes(array $types): void
    {
        foreach ($types as $type) {
            $this->invalidateByType($type);
        }
    }

    /**
     * Get cache statistics.
     */
    public function getStatistics(): array
    {
        return [
            'hits' => Cache::get('perf:cache_hits', 0),
            'misses' => Cache::get('perf:cache_misses', 0),
            'hit_rate' => $this->calculateHitRate(),
        ];
    }

    /**
     * Warm commonly used caches.
     */
    public function warmCaches(): void
    {
        try {
            // Warm categories
            $this->remember('categories:all', 'static_lists', function () {
                return \App\Models\Category::orderBy('name')->select(['id', 'name', 'slug'])->get();
            });

            // Warm tags
            $this->remember('tags:all', 'static_lists', function () {
                return \App\Models\Tag::orderBy('name')->select(['id', 'name', 'slug'])->get();
            });

            // Warm roles
            $this->remember('roles:all', 'static_lists', function () {
                return \Spatie\Permission\Models\Role::orderBy('name')->get(['id', 'name']);
            });

            Log::info('Cache warming completed successfully');
        } catch (\Throwable $e) {
            Log::warning('Cache warming failed: ' . $e->getMessage());
        }
    }

    /**
     * Clear all caches.
     */
    public function clearAll(): void
    {
        try {
            if ($this->supportsTagging()) {
                foreach (array_merge(...array_column(self::CACHE_CONFIG, 'tags')) as $tag) {
                    Cache::tags([$tag])->flush();
                }
            } else {
                Cache::flush();
            }

            Log::info('All caches cleared');
        } catch (\Throwable $e) {
            Log::warning('Failed to clear caches: ' . $e->getMessage());
        }
    }

    /**
     * Check if cache driver supports tagging.
     */
    private function supportsTagging(): bool
    {
        $driver = config('cache.default');

        return in_array($driver, ['redis', 'dynamodb']);
    }

    /**
     * Calculate cache hit rate.
     */
    private function calculateHitRate(): ?float
    {
        $hits = Cache::get('perf:cache_hits', 0);
        $misses = Cache::get('perf:cache_misses', 0);
        $total = $hits + $misses;

        if ($total === 0) {
            return null;
        }

        return round(($hits / $total) * 100, 2);
    }
}
