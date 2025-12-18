<?php

namespace Database\Seeders;

use App\Models\Tool;
use App\Models\ToolView;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ToolViewSeeder extends Seeder
{
    /**
     * Seed the tool_views table with realistic analytics data
     *
     * Generates:
     * - 50-150 views per tool over last 30 days
     * - Mix of authenticated and anonymous views
     * - Various referrers (Google, GitHub, StackOverflow, Direct)
     * - Natural distribution (more views on weekdays)
     */
    public function run(): void
    {
        // Get all tools and users
        $tools = Tool::all();
        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['user', 'admin', 'owner']);
        })->get();

        if ($tools->isEmpty()) {
            $this->command->warn('No tools found. Please run ToolSeeder first.');

            return;
        }

        $referrers = [
            'https://www.google.com/search',
            'https://github.com',
            'https://stackoverflow.com',
            'https://www.reddit.com',
            'https://twitter.com',
            'https://www.producthunt.com',
            'https://news.ycombinator.com',
            'https://dev.to',
            'https://hashnode.com',
            'https://vibecoding.app',
            null, // Direct traffic
        ];

        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        ];

        $ipRanges = [
            ['start' => '192.0.2', 'end' => '192.0.2.255'],
            ['start' => '198.51.100', 'end' => '198.51.100.255'],
            ['start' => '203.0.113', 'end' => '203.0.113.255'],
            ['start' => '192.168.1', 'end' => '192.168.1.255'],
            ['start' => '10.0.0', 'end' => '10.0.0.255'],
        ];

        $this->command->info('Seeding tool views analytics data...');
        $progressBar = $this->command->getOutput()->createProgressBar($tools->count());

        foreach ($tools as $tool) {
            // Generate 50-150 views per tool (2-3k total)
            $viewCount = rand(50, 150);
            $batchSize = 500; // Insert in batches of 500
            $views = [];

            for ($i = 0; $i < $viewCount; $i++) {
                // More views on recent days
                $daysAgo = rand(0, 50);
                if ($daysAgo > 30) {
                    // 20% chance of older views
                    $daysAgo = rand(30, 50);
                }

                // Weighted toward weekday business hours
                $daysAgo += rand(0, 2); // Some variance
                if ($daysAgo <= 30) {
                    $dayOfWeek = Carbon::now()->subDays($daysAgo)->dayOfWeek;
                    // Less views on weekends (0 = Sunday, 6 = Saturday)
                    if ($dayOfWeek === 0 || $dayOfWeek === 6) {
                        if (rand(0, 100) > 40) {
                            continue; // Skip 60% of weekend views
                        }
                    }
                }

                $viewedAt = Carbon::now()->subDays($daysAgo)->setHour(rand(0, 23))->setMinute(rand(0, 59))->setSecond(rand(0, 59));

                // 30% authenticated, 70% anonymous
                $isAuthenticated = rand(0, 100) < 30;
                $userId = $isAuthenticated && $users->count() > 0 ? $users->random()->id : null;

                // Random IP
                $ipRange = $ipRanges[array_rand($ipRanges)];
                $ipParts = explode('.', $ipRange['start']);
                $lastOctet = rand(1, 254);
                $ipAddress = "{$ipParts[0]}.{$ipParts[1]}.{$ipParts[2]}.{$lastOctet}";

                $views[] = [
                    'tool_id' => $tool->id,
                    'user_id' => $userId,
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgents[array_rand($userAgents)],
                    'referer' => $referrers[array_rand($referrers)],
                    'viewed_at' => $viewedAt,

                ];

                // Insert batch when it reaches batch size
                if (count($views) >= $batchSize) {
                    ToolView::insert($views);
                    $views = [];
                }
            }

            // Insert remaining views
            if (! empty($views)) {
                ToolView::insert($views);
            }

            // Update tool view_count and last_viewed_at (single query instead of per-tool)
            $tool->update([
                'view_count' => ToolView::where('tool_id', $tool->id)->count(),
                'last_viewed_at' => ToolView::where('tool_id', $tool->id)->orderBy('viewed_at', 'desc')->first()?->viewed_at,
            ]);

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->command->newLine();
        $this->command->info('✅ Tool views analytics data seeded successfully!');
    }
}
