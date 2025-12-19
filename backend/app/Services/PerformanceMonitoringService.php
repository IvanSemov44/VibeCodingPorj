<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

final class PerformanceMonitoringService
{
    /**
     * Get application performance metrics.
     *
     * @return array<string, mixed>
     */
    public function getMetrics(): array
    {
        return [
            'timestamp' => now()->toIso8601String(),
            'uptime' => $this->getUptime(),
            'requests' => $this->getRequestMetrics(),
            'database' => $this->getDatabaseMetrics(),
            'cache' => $this->getCacheMetrics(),
            'queue' => $this->getQueueMetrics(),
            'errors' => $this->getErrorMetrics(),
        ];
    }

    /**
     * Get application uptime.
     */
    private function getUptime(): array
    {
        $startTime = Cache::remember(
            'app_start_time',
            now()->addDay(),
            fn () => now()->timestamp
        );

        $uptime = now()->timestamp - $startTime;
        $hours = intdiv($uptime, 3600);
        $minutes = intdiv($uptime % 3600, 60);

        return [
            'seconds' => $uptime,
            'hours' => $hours,
            'minutes' => $minutes,
            'formatted' => "{$hours}h {$minutes}m",
        ];
    }

    /**
     * Get request metrics.
     *
     * @return array<string, mixed>
     */
    private function getRequestMetrics(): array
    {
        return [
            'total_today' => (int) Cache::get('requests_total_today', 0),
            'total_this_hour' => (int) Cache::get('requests_this_hour', 0),
            'average_response_time_ms' => round(
                (float) Cache::get('avg_response_time_ms', 0),
                2
            ),
            'errors_today' => (int) Cache::get('errors_today', 0),
        ];
    }

    /**
     * Get database metrics.
     *
     * @return array<string, mixed>
     */
    private function getDatabaseMetrics(): array
    {
        try {
            $tableCount = DB::select(
                "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE()"
            );

            return [
                'status' => 'healthy',
                'tables' => $tableCount[0]->count ?? 0,
                'connections' => DB::getConnections(),
                'query_count' => count(DB::getQueryLog()),
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get cache metrics.
     *
     * @return array<string, mixed>
     */
    private function getCacheMetrics(): array
    {
        return [
            'driver' => config('cache.default'),
            'hits' => (int) Cache::get('cache_hits', 0),
            'misses' => (int) Cache::get('cache_misses', 0),
            'hit_rate' => $this->calculateHitRate(),
        ];
    }

    /**
     * Get queue metrics.
     *
     * @return array<string, mixed>
     */
    private function getQueueMetrics(): array
    {
        return [
            'driver' => config('queue.default'),
            'jobs_processed' => (int) Cache::get('jobs_processed', 0),
            'jobs_failed' => (int) Cache::get('jobs_failed', 0),
            'jobs_pending' => $this->getPendingJobsCount(),
        ];
    }

    /**
     * Get error metrics.
     *
     * @return array<string, mixed>
     */
    private function getErrorMetrics(): array
    {
        return [
            'errors_today' => (int) Cache::get('errors_today', 0),
            'errors_this_week' => (int) Cache::get('errors_this_week', 0),
            'latest_errors' => Cache::get('latest_errors', []),
        ];
    }

    /**
     * Calculate cache hit rate.
     */
    private function calculateHitRate(): float
    {
        $hits = (int) Cache::get('cache_hits', 0);
        $misses = (int) Cache::get('cache_misses', 0);
        $total = $hits + $misses;

        if ($total === 0) {
            return 0.0;
        }

        return round(($hits / $total) * 100, 2);
    }

    /**
     * Get pending jobs count.
     */
    private function getPendingJobsCount(): int
    {
        try {
            return DB::table('jobs')->count();
        } catch (\Throwable) {
            return 0;
        }
    }

    /**
     * Record request metric.
     */
    public function recordRequest(int $responseTimeMs, bool $isError = false): void
    {
        // Increment request count
        Cache::increment('requests_total_today', 1, now()->addDay());
        Cache::increment('requests_this_hour', 1, now()->addHour());

        // Update average response time
        $current = (float) Cache::get('avg_response_time_ms', 0);
        $count = (int) Cache::get('requests_count', 0);
        $average = ($current * $count + $responseTimeMs) / ($count + 1);
        Cache::put('avg_response_time_ms', $average, now()->addDay());
        Cache::put('requests_count', $count + 1, now()->addDay());

        // Track errors
        if ($isError) {
            Cache::increment('errors_today', 1, now()->addDay());
            Cache::increment('errors_this_week', 1, now()->addWeek());
        }
    }

    /**
     * Record cache hit/miss.
     */
    public function recordCacheHit(bool $hit = true): void
    {
        if ($hit) {
            Cache::increment('cache_hits', 1, now()->addDay());
        } else {
            Cache::increment('cache_misses', 1, now()->addDay());
        }
    }

    /**
     * Record job processing.
     */
    public function recordJobProcessed(bool $success = true): void
    {
        if ($success) {
            Cache::increment('jobs_processed', 1, now()->addDay());
        } else {
            Cache::increment('jobs_failed', 1, now()->addDay());
        }
    }
}
