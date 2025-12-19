<?php

declare(strict_types=1);

namespace App\Http\Controllers\Health;

use App\Http\Controllers\Controller;
use Illuminate\Database\DatabaseManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;

final class HealthCheckController extends Controller
{
    /**
     * Get overall application health status.
     */
    public function index(DatabaseManager $database): JsonResponse
    {
        $health = [
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'app_name' => config('app.name'),
            'environment' => config('app.env'),
            'checks' => [
                'database' => $this->checkDatabase($database),
                'cache' => $this->checkCache(),
                'redis' => $this->checkRedis(),
                'storage' => $this->checkStorage(),
            ],
        ];

        $allHealthy = collect($health['checks'])->every(
            fn ($check) => $check['status'] === 'healthy'
        );

        $health['status'] = $allHealthy ? 'healthy' : 'degraded';

        return response()->json($health);
    }

    /**
     * Get database health check.
     */
    public function database(DatabaseManager $database): JsonResponse
    {
        $check = $this->checkDatabase($database);

        return response()->json($check);
    }

    /**
     * Get cache health check.
     */
    public function cache(): JsonResponse
    {
        $check = $this->checkCache();

        return response()->json($check);
    }

    /**
     * Get Redis health check.
     */
    public function redis(): JsonResponse
    {
        $check = $this->checkRedis();

        return response()->json($check);
    }

    /**
     * Get storage health check.
     */
    public function storage(): JsonResponse
    {
        $check = $this->checkStorage();

        return response()->json($check);
    }

    /**
     * Check database connection.
     */
    private function checkDatabase(DatabaseManager $database): array
    {
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            $duration = (microtime(true) - $start) * 1000;

            return [
                'status' => 'healthy',
                'message' => 'Database connection active',
                'response_time_ms' => round($duration, 2),
                'connection' => config('database.default'),
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Database connection failed',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check cache status.
     */
    private function checkCache(): array
    {
        try {
            $key = 'health_check_' . time();
            Cache::put($key, 'ok', now()->addMinute());
            $cached = Cache::get($key);
            Cache::forget($key);

            return [
                'status' => $cached === 'ok' ? 'healthy' : 'unhealthy',
                'message' => 'Cache system operational',
                'driver' => config('cache.default'),
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Cache system failed',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check Redis connection.
     */
    private function checkRedis(): array
    {
        try {
            $start = microtime(true);
            Redis::ping();
            $duration = (microtime(true) - $start) * 1000;

            return [
                'status' => 'healthy',
                'message' => 'Redis connection active',
                'response_time_ms' => round($duration, 2),
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Redis connection failed',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check storage accessibility.
     */
    private function checkStorage(): array
    {
        try {
            $testFile = 'health_check_' . time() . '.txt';
            Storage::disk('local')->put($testFile, 'health check');
            Storage::disk('local')->delete($testFile);

            return [
                'status' => 'healthy',
                'message' => 'Storage system operational',
                'disk' => 'local',
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Storage system failed',
                'error' => $e->getMessage(),
            ];
        }
    }
}
