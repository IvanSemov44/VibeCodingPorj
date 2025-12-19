<?php

declare(strict_types=1);

namespace App\Actions\Analytics;

use App\Models\Category;
use App\Models\Tool;
use Illuminate\Support\Facades\DB;

final readonly class GetDashboardStatsAction
{
    /**
     * Get comprehensive dashboard statistics.
     *
     * @return array<string, mixed> Dashboard statistics
     */
    public function execute(): array
    {
        return [
            'tools' => [
                'total' => Tool::count(),
                'approved' => Tool::approved()->count(),
                'pending' => Tool::pending()->count(),
                'rejected' => Tool::rejected()->count(),
            ],
            'ratings' => [
                'total' => DB::table('ratings')->count(),
                'average' => Tool::whereNotNull('average_rating')
                    ->avg('average_rating'),
            ],
            'comments' => [
                'total' => DB::table('comments')->count(),
                'pending_moderation' => DB::table('comments')
                    ->whereNull('is_moderated')
                    ->count(),
            ],
            'categories' => [
                'total' => Category::count(),
                'with_tools' => Category::has('tools')->count(),
            ],
            'engagement' => [
                'views_total' => DB::table('tools')
                    ->sum('view_count') ?? 0,
                'views_this_week' => $this->getViewsThisWeek(),
                'comments_this_week' => $this->getCommentsThisWeek(),
            ],
            'growth' => [
                'tools_this_week' => Tool::where('created_at', '>=', now()->subWeek())
                    ->count(),
                'tools_this_month' => Tool::where('created_at', '>=', now()->subMonth())
                    ->count(),
            ],
        ];
    }

    /**
     * Get views count for the current week.
     *
     * @return int
     */
    private function getViewsThisWeek(): int
    {
        return (int) DB::table('activity_log')
            ->where('event', 'viewed')
            ->where('created_at', '>=', now()->subWeek())
            ->count();
    }

    /**
     * Get comments count for the current week.
     *
     * @return int
     */
    private function getCommentsThisWeek(): int
    {
        return (int) DB::table('comments')
            ->where('created_at', '>=', now()->subWeek())
            ->count();
    }
}
