<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\AnalyticsResource;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AnalyticsController
{
    public function __construct(
        private AnalyticsService $service,
    ) {}

    /**
     * Get dashboard statistics.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function dashboard(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\Activity::class);

        $period = $request->input('period', 'week');
        $stats = $this->service->getDashboardStats($period);

        return response()->json([
            'period' => $period,
            'data' => $stats,
        ]);
    }

    /**
     * Get tool analytics.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function tools(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\Tool::class);

        $period = $request->input('period', 'week');
        $analytics = $this->service->getToolAnalytics($period);

        return response()->json(
            new AnalyticsResource($analytics)
        );
    }

    /**
     * Get user analytics.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function users(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\User::class);

        $period = $request->input('period', 'week');
        $analytics = $this->service->getUserAnalytics($period);

        return response()->json(
            new AnalyticsResource($analytics)
        );
    }

    /**
     * Get activity logs.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function activity(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\Activity::class);

        $logs = \App\Models\Activity::query()
            ->with('user')
            ->when($request->input('action'), fn ($q) =>
                $q->where('action', $request->input('action'))
            )
            ->latest()
            ->paginate($request->input('per_page', 25));

        return response()->json([
            'data' => $logs->items(),
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }
}
