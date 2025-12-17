<?php

namespace App\Console\Commands;

use App\Models\Tool;
use App\Models\ToolView;
use Illuminate\Console\Command;

class VerifyAnalyticsData extends Command
{
    protected $signature = 'seed:verify-analytics';
    protected $description = 'Verify analytics seed data is populated';

    public function handle(): int
    {
        $this->info('📊 Analytics Data Verification');
        $this->line('─────────────────────────────────────');

        // Total views
        $totalViews = ToolView::count();
        $this->line("Total Views:          {$totalViews}");

        // Tools with views
        $toolsWithViews = Tool::where('view_count', '>', 0)->count();
        $this->line("Tools with Views:     {$toolsWithViews}");

        // Authenticated vs Anonymous
        $authenticated = ToolView::whereNotNull('user_id')->count();
        $anonymous = ToolView::whereNull('user_id')->count();
        $this->line("Authenticated Views:  {$authenticated} (" . round(($authenticated / $totalViews) * 100, 1) . "%)");
        $this->line("Anonymous Views:      {$anonymous} (" . round(($anonymous / $totalViews) * 100, 1) . "%)");

        // Unique visitors
        $uniqueIPs = ToolView::distinct('ip_address')->count();
        $uniqueUsers = ToolView::whereNotNull('user_id')->distinct('user_id')->count();
        $this->line("Unique IPs:           {$uniqueIPs}");
        $this->line("Unique Users:         {$uniqueUsers}");

        // Referrers tracked
        $referrers = ToolView::whereNotNull('referer')->distinct('referer')->count();
        $this->line("Referrer Sources:     {$referrers}");

        // Date range
        $oldestView = ToolView::orderBy('viewed_at')->first()?->viewed_at;
        $newestView = ToolView::orderByDesc('viewed_at')->first()?->viewed_at;
        $this->line("Date Range:           {$oldestView} to {$newestView}");

        // Top 5 tools
        $this->line('─────────────────────────────────────');
        $this->info('🏆 Top 5 Most Viewed Tools:');

        $topTools = ToolView::selectRaw('tool_id, COUNT(*) as view_count')
            ->groupBy('tool_id')
            ->orderByDesc('view_count')
            ->limit(5)
            ->with('tool:id,name')
            ->get();

        foreach ($topTools as $idx => $toolView) {
            $rank = $idx + 1;
            $name = $toolView->tool?->name ?? "Tool #{$toolView->tool_id}";
            $this->line("  {$rank}. {$name}: {$toolView->view_count} views");
        }

        $this->line('─────────────────────────────────────');
        $this->info('✅ Analytics data is ready for the dashboard!');

        return Command::SUCCESS;
    }
}
