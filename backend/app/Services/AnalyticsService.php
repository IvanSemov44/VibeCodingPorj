<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AnalyticsCategoryStat;
use App\Models\AnalyticsPageView;
use App\Models\AnalyticsTrending;
use App\Models\AnalyticsUserActivity;
use App\Models\AnalyticsUserStat;
use App\Models\Category;
use App\Models\Tool;
use App\Models\User;
use Carbon\Carbon;

/**
 * Analytics Service
 * Handles analytics data collection, aggregation, and reporting
 */
class AnalyticsService
{
    /**
     * Record a page view.
     */
    public function recordPageView(
        ?User $user,
        ?Tool $tool,
        string $pagePath,
        ?string $referrer = null,
        ?string $userAgent = null,
        ?string $ipAddress = null,
        int $responseTimeMs = 0
    ): AnalyticsPageView {
        return AnalyticsPageView::create([
            'user_id' => $user?->id,
            'tool_id' => $tool?->id,
            'page_path' => $pagePath,
            'referrer' => $referrer,
            'user_agent' => $userAgent,
            'ip_address' => $ipAddress,
            'response_time_ms' => $responseTimeMs,
        ]);
    }

    /**
     * Record a user activity.
     */
    public function recordActivity(
        User $user,
        string $activityType,
        ?Tool $tool = null,
        ?array $data = null
    ): AnalyticsUserActivity {
        return AnalyticsUserActivity::create([
            'user_id' => $user->id,
            'activity_type' => $activityType,
            'tool_id' => $tool?->id,
            'activity_data' => $data,
        ]);
    }

    /**
     * Get page views for a date range.
     */
    public function getPageViews(
        Carbon $startDate,
        Carbon $endDate,
        ?int $toolId = null,
        int $limit = 100
    ): array {
        $query = AnalyticsPageView::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($toolId) {
            $query->where('tool_id', $toolId);
        }

        return $query->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get user activities for a date range.
     */
    public function getUserActivities(
        Carbon $startDate,
        Carbon $endDate,
        ?int $userId = null,
        ?string $activityType = null,
        int $limit = 100
    ): array {
        $query = AnalyticsUserActivity::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($activityType) {
            $query->where('activity_type', $activityType);
        }

        return $query->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get trending tools.
     */
    public function getTrendingTools(
        string $period = 'daily',
        int $limit = 10,
        ?Carbon $date = null
    ): array {
        $date = $date ?? now();

        return AnalyticsTrending::query()
            ->where('period', $period)
            ->where('date', $date->toDateString())
            ->orderByDesc('trend_score')
            ->limit($limit)
            ->with('tool')
            ->get()
            ->map(fn ($t) => [
                'tool_id' => $t->tool_id,
                'tool_name' => $t->tool->name ?? null,
                'view_count' => $t->view_count,
                'comment_count' => $t->comment_count,
                'rating_count' => $t->rating_count,
                'average_rating' => $t->average_rating,
                'trend_score' => $t->trend_score,
            ])
            ->toArray();
    }

    /**
     * Get category statistics.
     */
    public function getCategoryStats(
        string $period = 'daily',
        ?Carbon $date = null
    ): array {
        $date = $date ?? now();

        return AnalyticsCategoryStat::query()
            ->where('period', $period)
            ->where('date', $date->toDateString())
            ->with('category')
            ->orderByDesc('total_views')
            ->get()
            ->map(fn ($s) => [
                'category_id' => $s->category_id,
                'category_name' => $s->category->name ?? null,
                'tool_count' => $s->tool_count,
                'total_views' => $s->total_views,
                'total_comments' => $s->total_comments,
                'total_ratings' => $s->total_ratings,
                'average_rating' => $s->average_rating,
            ])
            ->toArray();
    }

    /**
     * Get user statistics.
     */
    public function getUserStats(
        User $user,
        string $period = 'daily',
        ?Carbon $date = null
    ): ?array {
        $date = $date ?? now();

        $stat = AnalyticsUserStat::query()
            ->where('user_id', $user->id)
            ->where('period', $period)
            ->where('date', $date->toDateString())
            ->first();

        return $stat ? [
            'user_id' => $stat->user_id,
            'tools_created' => $stat->tools_created,
            'comments_posted' => $stat->comments_posted,
            'ratings_given' => $stat->ratings_given,
            'tools_viewed' => $stat->tools_viewed,
            'login_count' => $stat->login_count,
            'page_views' => $stat->page_views,
            'activity_score' => $stat->activity_score,
            'period' => $stat->period,
            'date' => $stat->date,
        ] : null;
    }

    /**
     * Get dashboard summary.
     */
    public function getDashboardSummary(?Carbon $date = null): array
    {
        $date = $date ?? now();
        $startOfDay = $date->clone()->startOfDay();
        $endOfDay = $date->clone()->endOfDay();

        $pageViewCount = AnalyticsPageView::whereBetween('created_at', [$startOfDay, $endOfDay])->count();
        $uniqueUsers = AnalyticsPageView::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->distinct('user_id')
            ->count();
        $avgResponseTime = (int) AnalyticsPageView::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->avg('response_time_ms');

        $activityCount = AnalyticsUserActivity::whereBetween('created_at', [$startOfDay, $endOfDay])->count();

        $trending = $this->getTrendingTools('daily', 5, $date);
        $categories = $this->getCategoryStats('daily', $date);

        return [
            'date' => $date->toDateString(),
            'page_views' => $pageViewCount,
            'unique_users' => $uniqueUsers,
            'average_response_time_ms' => $avgResponseTime,
            'user_activities' => $activityCount,
            'trending_tools' => $trending,
            'top_categories' => $categories,
        ];
    }

    /**
     * Get activity summary by type.
     */
    public function getActivitySummary(
        ?Carbon $startDate = null,
        ?Carbon $endDate = null
    ): array {
        $startDate = $startDate ?? now()->subDays(7);
        $endDate = $endDate ?? now();

        $activities = AnalyticsUserActivity::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('activity_type')
            ->selectRaw('activity_type, COUNT(*) as count')
            ->get();

        return $activities->mapWithKeys(fn ($a) => [$a->activity_type => $a->count])->toArray();
    }

    /**
     * Get top tools by views.
     */
    public function getTopToolsByViews(int $limit = 10, ?Carbon $date = null): array
    {
        $date = $date ?? now();
        $startOfDay = $date->clone()->startOfDay();
        $endOfDay = $date->clone()->endOfDay();

        return AnalyticsPageView::query()
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->whereNotNull('tool_id')
            ->groupBy('tool_id')
            ->selectRaw('tool_id, COUNT(*) as view_count')
            ->orderByDesc('view_count')
            ->limit($limit)
            ->with('tool')
            ->get()
            ->map(fn ($v) => [
                'tool_id' => $v->tool_id,
                'tool_name' => $v->tool->name ?? null,
                'views' => $v->view_count,
            ])
            ->toArray();
    }

    /**
     * Get top pages by views.
     */
    public function getTopPages(int $limit = 10, ?Carbon $date = null): array
    {
        $date = $date ?? now();
        $startOfDay = $date->clone()->startOfDay();
        $endOfDay = $date->clone()->endOfDay();

        return AnalyticsPageView::query()
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->groupBy('page_path')
            ->selectRaw('page_path, COUNT(*) as view_count, AVG(response_time_ms) as avg_response_time')
            ->orderByDesc('view_count')
            ->limit($limit)
            ->get()
            ->map(fn ($p) => [
                'page' => $p->page_path,
                'views' => $p->view_count,
                'avg_response_time_ms' => (int) $p->avg_response_time,
            ])
            ->toArray();
    }

    /**
     * Get user engagement score.
     */
    public function getUserEngagementScore(User $user, ?Carbon $startDate = null): int
    {
        $startDate = $startDate ?? now()->subDays(30);

        $pageViews = AnalyticsPageView::where('user_id', $user->id)
            ->where('created_at', '>=', $startDate)
            ->count();

        $activities = AnalyticsUserActivity::where('user_id', $user->id)
            ->where('created_at', '>=', $startDate)
            ->count();

        return (int) min(100, ($pageViews * 0.3) + ($activities * 0.7));
    }

    /**
     * Get tool popularity score.
     */
    public function getToolPopularityScore(Tool $tool, ?Carbon $startDate = null): float
    {
        $startDate = $startDate ?? now()->subDays(30);

        $views = AnalyticsPageView::where('tool_id', $tool->id)
            ->where('created_at', '>=', $startDate)
            ->count();

        $comments = $tool->comments()
            ->where('created_at', '>=', $startDate)
            ->count();

        $ratings = $tool->ratings()
            ->where('created_at', '>=', $startDate)
            ->count();

        return ($views * 0.5) + ($comments * 0.3) + ($ratings * 0.2);
    }

    /**
     * Get platform health metrics.
     */
    public function getPlatformHealthMetrics(?Carbon $date = null): array
    {
        $date = $date ?? now();

        $totalUsers = User::count();
        $totalTools = Tool::count();
        $totalCategories = Category::count();
        $avgToolRating = (float) Tool::avg('average_rating');

        $dailyActiveUsers = AnalyticsPageView::where('created_at', '>=', $date->clone()->startOfDay())
            ->where('created_at', '<=', $date->clone()->endOfDay())
            ->distinct('user_id')
            ->count();

        return [
            'total_users' => $totalUsers,
            'total_tools' => $totalTools,
            'total_categories' => $totalCategories,
            'average_tool_rating' => round($avgToolRating, 2),
            'daily_active_users' => $dailyActiveUsers,
            'date' => $date->toDateString(),
        ];
    }
}
