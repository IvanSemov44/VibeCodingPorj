<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;

final class CacheService
{
    private const DEFAULT_TTL = 3600; // Fallback, prefer config('app.cache_ttl.static_data')

    /**
     * Remember a value in cache.
     *
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T
     */
    public function remember(string $key, callable $callback, ?int $ttl = null): mixed
    {
        return Cache::remember($key, $ttl ?? self::DEFAULT_TTL, $callback);
    }

    /**
     * Forget cached value(s).
     *
     * @param  string|array<string>  $keys
     */
    public function forget(string|array $keys): bool
    {
        if (is_array($keys)) {
            foreach ($keys as $key) {
                Cache::forget($key);
            }

            return true;
        }

        return Cache::forget($keys);
    }

    /**
     * Remember a value using tags when supported by the store.
     *
     * @template T
     *
     * @param  array<string>  $tags
     * @param  callable(): T  $callback
     * @return T
     */
    public function rememberWithTags(array $tags, string $key, callable $callback, ?int $ttl = null): mixed
    {
        if ($this->supportsTags()) {
            return Cache::tags($tags)->remember($key, $ttl ?? self::DEFAULT_TTL, $callback);
        }

        return $this->remember($key, $callback, $ttl);
    }

    /**
     * Flush all cache.
     */
    public function flush(): bool
    {
        return Cache::flush();
    }

    /**
     * Whether the current cache store supports tags.
     */
    public function supportsTags(): bool
    {
        try {
            return method_exists(Cache::getStore(), 'tags');
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Get a value from cache.
     */
    public function get(string $key): mixed
    {
        try {
            return Cache::get($key);
        } catch (\Throwable $e) {
            logger()->warning('Cache get failed for key '.$key.': '.$e->getMessage());

            return null;
        }
    }

    /**
     * Get cache key for tools list.
     */
    public function toolsListKey(array $filters = []): string
    {
        $filterString = empty($filters) ? 'all' : md5(serialize($filters));

        return "tools:list:{$filterString}";
    }

    /**
     * Get cache key for single tool.
     */
    public function toolKey(int $id): string
    {
        return "tools:show:{$id}";
    }

    /**
     * Invalidate all tool caches.
     */
    public function invalidateToolCaches(): void
    {
        if ($this->supportsTags()) {
            try {
                Cache::tags(['tools'])->flush();

                return;
            } catch (\Throwable $e) {
                logger()->warning('Failed to flush tool cache tags: '.$e->getMessage());
            }
        }

        // Fallback: try forgetting a small set of likely keys
        for ($i = 1; $i <= 5; $i++) {
            try {
                Cache::forget("tools.approved.page.{$i}.perpage.20");
            } catch (\Throwable $e) {
                // best-effort
            }
        }
    }

    /**
     * Invalidate caches by tags when supported.
     *
     * @param  array<string>  $tags
     */
    public function invalidateTags(array $tags): void
    {
        if (! $this->supportsTags()) {
            return;
        }

        try {
            Cache::tags($tags)->flush();
        } catch (\Throwable $e) {
            logger()->warning('Failed to flush cache tags: '.$e->getMessage());
        }
    }

    /**
     * Put a value into cache using tags when supported.
     *
     * @param  array<string>  $tags
     */
    public function putWithTags(array $tags, string $key, mixed $value, ?int $ttl = null): bool
    {
        if ($this->supportsTags()) {
            try {
                return Cache::tags($tags)->put($key, $value, $ttl ?? self::DEFAULT_TTL);
            } catch (\Throwable $e) {
                logger()->warning('Failed to put cache with tags: '.$e->getMessage());
            }
        }

        try {
            return Cache::put($key, $value, $ttl ?? self::DEFAULT_TTL);
        } catch (\Throwable $e) {
            logger()->warning('Failed to put cache (fallback): '.$e->getMessage());
        }

        return false;
    }
}
