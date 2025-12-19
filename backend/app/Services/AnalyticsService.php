<?php

declare(strict_types=1);

namespace App\Services;

use App\Actions\Analytics\GetDashboardStatsAction;
use App\Actions\Analytics\GetToolAnalyticsAction;
use App\Models\Tool;

final readonly class AnalyticsService
{
    public function __construct(
        private GetDashboardStatsAction $dashboardAction,
        private GetToolAnalyticsAction $toolAction,
    ) {}

    /**
     * Get dashboard statistics.
     *
     * @return array<string, mixed>
     */
    public function getDashboardStats(): array
    {
        return $this->dashboardAction->execute();
    }

    /**
     * Get tool analytics.
     *
     * @param Tool $tool The tool to analyze
     * @return array<string, mixed>
     */
    public function getToolAnalytics(Tool $tool): array
    {
        return $this->toolAction->execute($tool);
    }
}
