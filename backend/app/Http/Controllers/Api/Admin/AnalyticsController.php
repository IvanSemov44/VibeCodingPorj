<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Analytics Controller
 * Provides analytics and reporting endpoints (admin only)
 */
class AnalyticsController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        private readonly AnalyticsService $analyticsService
    ) {
    }

    /**
     * Get dashboard summary.
     * GET /api/admin/analytics/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $date = $request->query('date') ? Carbon::parse($request->query('date')) : null;
        $summary = $this->analyticsService->getDashboardSummary($date);

        return response()->json([
            'data' => $summary,
        ], 200);
    }

    /**
     * Get platform health metrics.
     * GET /api/admin/analytics/health
     */
    public function health(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $date = $request->query('date') ? Carbon::parse($request->query('date')) : null;
        $metrics = $this->analyticsService->getPlatformHealthMetrics($date);

        return response()->json([
            'data' => $metrics,
        ], 200);
    }

    /**
     * Get activity summary.
     * GET /api/admin/analytics/activity
     */
    public function activity(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date')) : null;
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date')) : null;
        $summary = $this->analyticsService->getActivitySummary($startDate, $endDate);

        return response()->json([
            'data' => $summary,
        ], 200);
    }

    /**
     * Get trending tools.
     * GET /api/admin/analytics/trending
     */
    public function trending(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $period = $request->query('period', 'daily');
        $limit = (int) $request->query('limit', 10);
        $date = $request->query('date') ? Carbon::parse($request->query('date')) : null;

        $trending = $this->analyticsService->getTrendingTools($period, $limit, $date);

        return response()->json([
            'data' => $trending,
            'count' => count($trending),
        ], 200);
    }

    /**
     * Get category statistics.
     * GET /api/admin/analytics/categories
     */
    public function categories(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $period = $request->query('period', 'daily');
        $date = $request->query('date') ? Carbon::parse($request->query('date')) : null;

        $stats = $this->analyticsService->getCategoryStats($period, $date);

        return response()->json([
            'data' => $stats,
            'count' => count($stats),
        ], 200);
    }

    /**
     * Get top tools by views.
     * GET /api/admin/analytics/top-tools
     */
    public function topTools(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $limit = (int) $request->query('limit', 10);
        $date = $request->query('date') ? Carbon::parse($request->query('date')) : null;

        $tools = $this->analyticsService->getTopToolsByViews($limit, $date);

        return response()->json([
            'data' => $tools,
            'count' => count($tools),
        ], 200);
    }

    /**
     * Get top pages by views.
     * GET /api/admin/analytics/top-pages
     */
    public function topPages(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $limit = (int) $request->query('limit', 10);
        $date = $request->query('date') ? Carbon::parse($request->query('date')) : null;

        $pages = $this->analyticsService->getTopPages($limit, $date);

        return response()->json([
            'data' => $pages,
            'count' => count($pages),
        ], 200);
    }

    /**
     * Get user engagement score.
     * GET /api/admin/analytics/user/{user}/engagement
     */
    public function userEngagement(Request $request, User $user): JsonResponse
    {
        $this->authorize('admin');

        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date')) : null;
        $score = $this->analyticsService->getUserEngagementScore($user, $startDate);

        return response()->json([
            'data' => [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'engagement_score' => $score,
            ],
        ], 200);
    }

    /**
     * Get page views for date range.
     * GET /api/admin/analytics/page-views
     */
    public function pageViews(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'tool_id' => 'sometimes|integer|exists:tools,id',
            'limit' => 'sometimes|integer|min:1|max:500',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $toolId = $validated['tool_id'] ?? null;
        $limit = $validated['limit'] ?? 100;

        $views = $this->analyticsService->getPageViews($startDate, $endDate, $toolId, $limit);

        return response()->json([
            'data' => $views,
            'count' => count($views),
        ], 200);
    }

    /**
     * Get user activities for date range.
     * GET /api/admin/analytics/activities
     */
    public function userActivities(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'user_id' => 'sometimes|integer|exists:users,id',
            'activity_type' => 'sometimes|string',
            'limit' => 'sometimes|integer|min:1|max:500',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $userId = $validated['user_id'] ?? null;
        $activityType = $validated['activity_type'] ?? null;
        $limit = $validated['limit'] ?? 100;

        $activities = $this->analyticsService->getUserActivities(
            $startDate,
            $endDate,
            $userId,
            $activityType,
            $limit
        );

        return response()->json([
            'data' => $activities,
            'count' => count($activities),
        ], 200);
    }
}
