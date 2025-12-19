<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

/**
 * PerformanceTracking Trait
 *
 * Tracks response times, cache hits/misses, and generates performance reports.
 */
trait PerformanceTracking
{
    /**
     * Record response time metric.
     */
    public static function recordResponseTime(float $milliseconds, string $endpoint): void
    {
        $key = "perf:response_time:{$endpoint}";
        $count = Cache::get("$key:count", 0);
        $total = Cache::get("$key:total", 0.0);

        Cache::put("$key:count", $count + 1, now()->addDay());
        Cache::put("$key:total", $total + $milliseconds, now()->addDay());
    }

    /**
     * Get average response time for an endpoint.
     */
    public static function getAverageResponseTime(string $endpoint): ?float
    {
        $count = Cache::get("perf:response_time:{$endpoint}:count", 0);
        $total = Cache::get("perf:response_time:{$endpoint}:total", 0.0);

        if ($count === 0) {
            return null;
        }

        return round($total / $count, 2);
    }

    /**
     * Record cache hit.
     */
    public static function recordCacheHit(string $cacheKey): void
    {
        Cache::increment('perf:cache_hits', 1, now()->addDay());
    }

    /**
     * Record cache miss.
     */
    public static function recordCacheMiss(string $cacheKey): void
    {
        Cache::increment('perf:cache_misses', 1, now()->addDay());
    }

    /**
     * Get cache hit rate percentage.
     */
    public static function getCacheHitRate(): ?float
    {
        $hits = Cache::get('perf:cache_hits', 0);
        $misses = Cache::get('perf:cache_misses', 0);
        $total = $hits + $misses;

        if ($total === 0) {
            return null;
        }

        return round(($hits / $total) * 100, 2);
    }

    /**
     * Record database query execution time.
     */
    public static function recordQueryTime(float $milliseconds): void
    {
        Cache::increment('perf:queries_total', 1, now()->addDay());
        $current = Cache::get('perf:query_total_time', 0.0);
        Cache::put('perf:query_total_time', $current + $milliseconds, now()->addDay());
    }

    /**
     * Get average query time.
     */
    public static function getAverageQueryTime(): ?float
    {
        $count = Cache::get('perf:queries_total', 0);
        $total = Cache::get('perf:query_total_time', 0.0);

        if ($count === 0) {
            return null;
        }

        return round($total / $count, 4);
    }

    /**
     * Clear all performance metrics.
     */
    public static function clearMetrics(): void
    {
        Cache::forget('perf:cache_hits');
        Cache::forget('perf:cache_misses');
        Cache::forget('perf:queries_total');
        Cache::forget('perf:query_total_time');

        // Clear endpoint metrics
        foreach (Cache::getStore()->getPrefix() . '*perf:response_time*' as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Get performance summary.
     */
    public static function getPerformanceSummary(): array
    {
        return [
            'cache_hits' => Cache::get('perf:cache_hits', 0),
            'cache_misses' => Cache::get('perf:cache_misses', 0),
            'cache_hit_rate' => self::getCacheHitRate(),
            'total_queries' => Cache::get('perf:queries_total', 0),
            'average_query_time_ms' => self::getAverageQueryTime(),
        ];
    }
}
