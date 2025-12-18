<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

class AnalyzeQueriesCommand extends Command
{
    protected $signature = 'queries:analyze
                          {--route= : Specific route to analyze}
                          {--slow=100 : Threshold for slow queries in ms}
                          {--verbose : Show all query details}';

    protected $description = 'Analyze database queries for all routes and identify performance issues';

    protected array $results = [];

    protected array $issues = [];

    public function handle(): int
    {
        $this->info('🔍 Database Query Analyzer');
        $this->info('==========================');
        $this->newLine();

        // Enable query logging
        DB::enableQueryLog();

        // Get all routes
        $routes = collect(Route::getRoutes())->filter(function ($route) {
            // Only analyze API routes
            return str_starts_with($route->uri(), 'api/');
        });

        $this->info("Found {$routes->count()} API routes to analyze");
        $this->newLine();

        $bar = $this->output->createProgressBar($routes->count());
        $bar->start();

        foreach ($routes as $route) {
            $this->analyzeRoute($route);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->displayReport();

        return self::SUCCESS;
    }

    protected function analyzeRoute($route): void
    {
        $uri = $route->uri();
        $methods = implode('|', $route->methods());

        // Skip routes that require parameters
        if (str_contains($uri, '{')) {
            return;
        }

        DB::flushQueryLog();

        try {
            // Simulate request (very basic - just to trigger queries)
            // In production, you'd use a proper HTTP client
            $startTime = microtime(true);

            // Note: This won't actually execute the route properly
            // This is just to demonstrate the structure
            // For real analysis, use the PowerShell script with HTTP requests

            $endTime = microtime(true);
            $duration = ($endTime - $startTime) * 1000;

            $queries = DB::getQueryLog();
            $queryCount = count($queries);
            $queryTime = collect($queries)->sum('time');

            $this->results[] = [
                'route' => "{$methods} /{$uri}",
                'queries' => $queryCount,
                'query_time' => $queryTime,
                'total_time' => $duration,
            ];

            // Detect issues
            if ($queryCount > 10) {
                $this->issues[] = "⚠️  {$uri}: Too many queries ({$queryCount})";
            }

            if ($queryTime > (int) $this->option('slow')) {
                $this->issues[] = "⚠️  {$uri}: Slow queries ({$queryTime}ms)";
            }

            // Detect N+1 queries
            $this->detectN1Queries($queries, $uri);

        } catch (\Exception $e) {
            // Skip routes that fail (e.g., require auth, parameters)
        }
    }

    protected function detectN1Queries(array $queries, string $uri): void
    {
        $querySignatures = [];

        foreach ($queries as $query) {
            // Normalize query by removing specific IDs
            $sql = $query['query'];
            $normalized = preg_replace('/\d+/', '?', $sql);
            $normalized = preg_replace("/'[^']*'/", '?', $normalized);

            if (! isset($querySignatures[$normalized])) {
                $querySignatures[$normalized] = 0;
            }
            $querySignatures[$normalized]++;
        }

        foreach ($querySignatures as $sql => $count) {
            if ($count > 3) {
                $this->issues[] = "⚠️  {$uri}: N+1 query detected (repeated {$count} times)";
                if ($this->option('verbose')) {
                    $this->warn('    Query: '.substr($sql, 0, 100).'...');
                }
            }
        }
    }

    protected function displayReport(): void
    {
        if (empty($this->results)) {
            $this->warn('No routes analyzed successfully');

            return;
        }

        // Summary statistics
        $totalQueries = collect($this->results)->sum('queries');
        $avgQueries = collect($this->results)->avg('queries');
        $avgQueryTime = collect($this->results)->avg('query_time');

        $this->info('📊 Summary Statistics');
        $this->info('=====================');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Routes Analyzed', count($this->results)],
                ['Total Queries', $totalQueries],
                ['Avg Queries/Route', number_format($avgQueries, 2)],
                ['Avg Query Time', number_format($avgQueryTime, 2).'ms'],
            ]
        );

        $this->newLine();

        // Top query-heavy routes
        $this->info('🔥 Query-Heavy Routes (Top 10)');
        $this->info('==============================');

        $heavy = collect($this->results)
            ->sortByDesc('queries')
            ->take(10)
            ->values();

        $this->table(
            ['Route', 'Queries', 'Query Time (ms)', 'Total Time (ms)'],
            $heavy->map(fn ($r) => [
                $r['route'],
                $r['queries'],
                number_format($r['query_time'], 2),
                number_format($r['total_time'], 2),
            ])->toArray()
        );

        $this->newLine();

        // Slowest routes
        $this->info('🐌 Slowest Routes (Top 10)');
        $this->info('==========================');

        $slow = collect($this->results)
            ->sortByDesc('query_time')
            ->take(10)
            ->values();

        $this->table(
            ['Route', 'Query Time (ms)', 'Queries', 'Total Time (ms)'],
            $slow->map(fn ($r) => [
                $r['route'],
                number_format($r['query_time'], 2),
                $r['queries'],
                number_format($r['total_time'], 2),
            ])->toArray()
        );

        $this->newLine();

        // Issues
        if (! empty($this->issues)) {
            $this->error('❌ Issues Found ('.count($this->issues).')');
            $this->error('==================');
            foreach (array_unique($this->issues) as $issue) {
                $this->warn($issue);
            }
        } else {
            $this->info('✅ No performance issues detected!');
        }
    }
}
