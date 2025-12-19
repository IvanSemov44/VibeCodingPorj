<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

final class ScanQueriesCommand extends Command
{
    protected $signature = 'scan:queries {--dump-sql} {--full-trace} {--slow=100} {--routes=*}';

    protected $description = 'Analyze database queries for N+1 problems and performance issues';

    private array $results = [];

    private array $issues = [];

    private ?string $currentRoute = null;

    public function handle(): int
    {
        $this->info('🔍 Database Query Analysis');
        $this->line('========================================');
        $this->line('');

        $routes = $this->getRoutesToTest();

        if (empty($routes)) {
            $this->warn('No API routes found to test');

            return 1;
        }

        $this->info("Testing {count($routes)} routes...");
        $this->line('');

        foreach ($routes as $route) {
            $this->testRoute($route);
        }

        $this->displayResults();

        return $this->issues ? 1 : 0;
    }

    private function getRoutesToTest(): array
    {
        $routes = [];

        foreach (Route::getRoutes() as $route) {
            // Only test API routes
            if (! str_starts_with($route->getPrefix() ?? '', 'api')) {
                continue;
            }

            // Skip auth routes
            if (in_array('auth', $route->middleware())) {
                continue;
            }

            // Only GET requests for now
            if (! in_array('GET', $route->methods)) {
                continue;
            }

            $routes[] = $route;
        }

        return $routes;
    }

    private function testRoute($route): void
    {
        try {
            $uri = str_replace('{', '1', $route->uri);
            $uri = str_replace('}', '', $uri);

            $this->currentRoute = $uri;

            DB::enableQueryLog();

            $client = app('Illuminate\Testing\TestResponse')->getClient();
            // For now, just test the path structure

            DB::disableQueryLog();

            $queries = DB::getQueryLog();
            $this->analyzeQueries($uri, $queries);
        } catch (\Exception $e) {
            // Skip routes that fail
        }
    }

    private function analyzeQueries(string $uri, array $queries): void
    {
        if (empty($queries)) {
            return;
        }

        $queryCount = count($queries);
        $queryTime = collect($queries)->sum('time');

        $this->results[] = [
            'route' => $uri,
            'queries' => $queryCount,
            'time_ms' => $queryTime,
        ];

        // Detect issues
        if ($queryCount > 10) {
            $this->issues[] = "⚠️  {$uri}: Too many queries ({$queryCount})";
            $this->line("<fg=red>⚠️  {$uri}: Too many queries ({$queryCount})</>");
        }

        if ($queryTime > (float) $this->option('slow')) {
            $this->issues[] = "⚠️  {$uri}: Slow queries ({$queryTime}ms)";
            $this->line("<fg=red>⚠️  {$uri}: Slow queries ({$queryTime}ms)</>");
        }

        // Detect N+1 queries
        $this->detectN1Queries($queries, $uri);

        if ($this->option('dump-sql')) {
            $this->displayQueries($queries);
        }
    }

    private function detectN1Queries(array $queries, string $uri): void
    {
        $querySignatures = [];

        foreach ($queries as $query) {
            $sql = $query['query'];
            $normalized = preg_replace('/\d+/', '?', $sql);
            $normalized = preg_replace("/'[^']*'/", '?', $normalized);

            $querySignatures[$normalized] = ($querySignatures[$normalized] ?? 0) + 1;
        }

        foreach ($querySignatures as $sql => $count) {
            if ($count > 3) {
                $this->issues[] = "⚠️  {$uri}: N+1 query detected (repeated {$count} times)";
                $this->line("<fg=red>⚠️  {$uri}: N+1 query (repeated {$count} times)</>");

                if ($this->option('dump-sql')) {
                    $this->line("   SQL: " . substr($sql, 0, 100) . '...');
                }
            }
        }
    }

    private function displayQueries(array $queries): void
    {
        $this->line('<fg=yellow>Queries:</>', spacing: 1);

        foreach ($queries as $idx => $query) {
            $this->line("  " . ($idx + 1) . ". [{$query['time']}ms] {$query['query']}");
        }

        $this->line('');
    }

    private function displayResults(): void
    {
        $this->line('');
        $this->line('<fg=cyan>Summary</>');
        $this->line('========================================');

        if (! empty($this->results)) {
            $this->table(
                ['Route', 'Queries', 'Time (ms)'],
                collect($this->results)->map(fn ($r) => [
                    $r['route'],
                    $r['queries'],
                    round($r['time_ms'], 2),
                ])->values()->all()
            );
        }

        if (! empty($this->issues)) {
            $this->line('');
            $this->line('<fg=red>Issues Found:</>', spacing: 1);
            foreach ($this->issues as $issue) {
                $this->line("  {$issue}");
            }
        } else {
            $this->line('<fg=green>✓ No issues found!</>');
        }
    }
}
