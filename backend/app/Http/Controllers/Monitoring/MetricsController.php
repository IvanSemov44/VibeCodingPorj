<?php

declare(strict_types=1);

namespace App\Http\Controllers\Monitoring;

use App\Http\Controllers\Controller;
use App\Services\PerformanceMonitoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MetricsController extends Controller
{
    public function __construct(
        private readonly PerformanceMonitoringService $monitoringService,
    ) {}

    /**
     * Get all metrics.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->monitoringService->getMetrics(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get request metrics.
     */
    public function requests(): JsonResponse
    {
        $metrics = $this->monitoringService->getMetrics();

        return response()->json([
            'data' => $metrics['requests'] ?? [],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get database metrics.
     */
    public function database(): JsonResponse
    {
        $metrics = $this->monitoringService->getMetrics();

        return response()->json([
            'data' => $metrics['database'] ?? [],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get queue metrics.
     */
    public function queue(): JsonResponse
    {
        $metrics = $this->monitoringService->getMetrics();

        return response()->json([
            'data' => $metrics['queue'] ?? [],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get cache metrics.
     */
    public function cache(): JsonResponse
    {
        $metrics = $this->monitoringService->getMetrics();

        return response()->json([
            'data' => $metrics['cache'] ?? [],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get error metrics.
     */
    public function errors(): JsonResponse
    {
        $metrics = $this->monitoringService->getMetrics();

        return response()->json([
            'data' => $metrics['errors'] ?? [],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get application uptime.
     */
    public function uptime(): JsonResponse
    {
        $metrics = $this->monitoringService->getMetrics();

        return response()->json([
            'data' => $metrics['uptime'] ?? [],
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
