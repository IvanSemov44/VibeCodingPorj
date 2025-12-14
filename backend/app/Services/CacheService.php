<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;

final class CacheService
{
    private const DEFAULT_TTL = 3600; // 1 hour

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
     * Flush all cache.
     */
    public function flush(): bool
    {
        return Cache::flush();
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
        // In a real app, you'd use cache tags or a more sophisticated approach
        // For now, we'll just forget specific patterns
        Cache::forget('tools:*');
    }
}
