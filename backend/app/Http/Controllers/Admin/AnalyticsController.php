<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\ToolView;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    // Routes are already protected by 'admin_or_owner' middleware in routes/api.php
    // So we don't need to add middleware here

    /**
     * Debug endpoint to check auth status (public, for debugging only)
     */
    public function debug(Request $request): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'authenticated' => $user !== null,
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'user_email' => $user?->email,
            'has_admin_role' => $user ? $user->hasAnyRole(['admin', 'owner']) : false,
            'roles' => $user ? $user->getRoleNames()->toArray() : [],
        ]);
    }

    /**
     * Get tool analytics dashboard data
     */
    public function index(Request $request): JsonResponse
    {
        $period = $request->query('period', '7'); // 7, 30, 90, 365
        $days = (int) $period;
        $startDate = Carbon::now()->subDays($days);

        return response()->json([
            'total_views' => $this->getTotalViews($startDate),
            'total_tools' => Tool::count(),
            'unique_viewers' => $this->getUniqueViewers($startDate),
            'most_viewed' => $this->getMostViewed($startDate, 10),
            'trending_tools' => $this->getTrendingTools($startDate),
            'views_by_date' => $this->getViewsByDate($startDate, $days),
            'referrers' => $this->getTopReferrers($startDate, 10),
            'period_days' => $days,
        ]);
    }

    /**
     * Get detailed analytics for a specific tool
     */
    public function toolAnalytics(Request $request, Tool $tool): JsonResponse
    {
        $period = $request->query('period', '7');
        $days = (int) $period;
        $startDate = Carbon::now()->subDays($days);

        $views = ToolView::where('tool_id', $tool->id)
            ->where('viewed_at', '>=', $startDate)
            ->orderBy('viewed_at', 'desc');

        return response()->json([
            'tool_id' => $tool->id,
            'tool_name' => $tool->name,
            'total_views' => $views->count(),
            'unique_viewers' => $views->distinct('user_id')->count('user_id'),
            'authenticated_views' => $views->whereNotNull('user_id')->count(),
            'anonymous_views' => $views->whereNull('user_id')->count(),
            'views_by_date' => $this->getToolViewsByDate($tool->id, $startDate, $days),
            'top_referrers' => $this->getToolReferrers($tool->id, $startDate, 10),
            'period_days' => $days,
        ]);
    }

    /**
     * Get views over time
     */
    public function viewsTimeseries(Request $request): JsonResponse
    {
        $period = $request->query('period', '7');
        $days = (int) $period;
        $startDate = Carbon::now()->subDays($days);

        return response()->json([
            'labels' => $this->getDateLabels($startDate, $days),
            'views' => $this->getViewsTimeseries($startDate, $days),
            'period_days' => $days,
        ]);
    }

    // ============ Helper Methods ============

    private function getTotalViews(Carbon $startDate): int
    {
        return ToolView::where('viewed_at', '>=', $startDate)->count();
    }

    private function getUniqueViewers(Carbon $startDate): int
    {
        return ToolView::where('viewed_at', '>=', $startDate)
            ->distinct('user_id', 'ip_address')
            ->count();
    }

    private function getMostViewed(Carbon $startDate, int $limit = 10)
    {
        return ToolView::where('viewed_at', '>=', $startDate)
            ->selectRaw('tool_id, COUNT(*) as view_count')
            ->groupBy('tool_id')
            ->orderByDesc('view_count')
            ->limit($limit)
            ->with('tool:id,name,slug')
            ->get()
            ->map(fn ($view) => [
                'tool_id' => $view->tool_id,
                'tool_name' => $view->tool->name,
                'tool_slug' => $view->tool->slug,
                'views' => $view->view_count,
            ]);
    }

    private function getTrendingTools(Carbon $startDate): array
    {
        $weekAgo = Carbon::now()->subDays(7);
        $monthAgo = Carbon::now()->subDays(30);

        $thisWeek = ToolView::where('viewed_at', '>=', $weekAgo)
            ->selectRaw('tool_id, COUNT(*) as views')
            ->groupBy('tool_id')
            ->pluck('views', 'tool_id');

        $lastMonth = ToolView::where('viewed_at', '>=', $monthAgo)
            ->where('viewed_at', '<', $weekAgo)
            ->selectRaw('tool_id, COUNT(*) as views')
            ->groupBy('tool_id')
            ->pluck('views', 'tool_id');

        $trending = [];
        foreach ($thisWeek as $toolId => $views) {
            $lastMonthViews = $lastMonth->get($toolId, 0);
            $growth = $lastMonthViews > 0
                ? round((($views - $lastMonthViews) / $lastMonthViews) * 100, 2)
                : 100;

            if ($growth > 0) {
                $trending[] = [
                    'tool_id' => $toolId,
                    'tool' => Tool::find($toolId)?->only(['id', 'name', 'slug']),
                    'this_week_views' => $views,
                    'growth_percentage' => $growth,
                ];
            }
        }

        usort($trending, fn ($a, $b) => $b['growth_percentage'] <=> $a['growth_percentage']);

        return array_slice($trending, 0, 5);
    }

    private function getViewsByDate(Carbon $startDate, int $days): array
    {
        // Limit to last 10 days for chart display
        $displayDays = min($days, 10);
        $chartStartDate = Carbon::now()->subDays($displayDays);

        $views = ToolView::where('viewed_at', '>=', $chartStartDate)
            ->selectRaw('DATE(viewed_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date');

        $result = [];
        for ($i = $displayDays - 1; $i >= 0; $i--) {
            $date = $chartStartDate->copy()->addDays($i)->format('Y-m-d');
            $result[$date] = $views->get($date, 0);
        }

        return $result;
    }

    private function getViewsTimeseries(Carbon $startDate, int $days): array
    {
        return array_values($this->getViewsByDate($startDate, $days));
    }

    private function getDateLabels(Carbon $startDate, int $days): array
    {
        $labels = [];
        for ($i = 0; $i < $days; $i++) {
            $labels[] = $startDate->copy()->addDays($i)->format('M d');
        }

        return $labels;
    }

    private function getTopReferrers(Carbon $startDate, int $limit = 10)
    {
        return ToolView::where('viewed_at', '>=', $startDate)
            ->whereNotNull('referer')
            ->selectRaw('referer, COUNT(*) as count')
            ->groupBy('referer')
            ->orderByDesc('count')
            ->limit($limit)
            ->pluck('count', 'referer')
            ->map(fn ($count, $referer) => [
                'referer' => $referer ? parse_url($referer, PHP_URL_HOST) ?? $referer : 'Direct',
                'views' => $count,
            ])
            ->values();
    }

    private function getToolViewsByDate(int $toolId, Carbon $startDate, int $days): array
    {
        $views = ToolView::where('tool_id', $toolId)
            ->where('viewed_at', '>=', $startDate)
            ->selectRaw('DATE(viewed_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date');

        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = $startDate->copy()->addDays($i)->format('Y-m-d');
            $result[$date] = $views->get($date, 0);
        }

        return $result;
    }

    private function getToolReferrers(int $toolId, Carbon $startDate, int $limit = 10)
    {
        return ToolView::where('tool_id', $toolId)
            ->where('viewed_at', '>=', $startDate)
            ->whereNotNull('referer')
            ->selectRaw('referer, COUNT(*) as count')
            ->groupBy('referer')
            ->orderByDesc('count')
            ->limit($limit)
            ->get()
            ->map(fn ($view) => [
                'referer' => parse_url($view->referer, PHP_URL_HOST) ?? $view->referer,
                'views' => $view->count,
            ])
            ->values();
    }
}
