<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ScanQueries extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scan:queries';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan a set of endpoints and report DB query counts and timings (dev-only)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting query scan...');

        $paths = [
            '/api/tools',
            '/api/tools?page=1',
            '/api/tools?q=test',
            '/api/admin/stats',
            '/api/admin/tools/pending',
            '/api/categories',
            '/api/ready',
        ];

        $results = [];

        foreach ($paths as $path) {
            $queries = 0;
            DB::flushQueryLog();
            DB::listen(function ($query) use (&$queries) {
                $queries++;
            });

            $start = microtime(true);
            try {
                // Create a request and dispatch via the application kernel
                $request = Request::create($path, 'GET');
                $response = app()->handle($request);
                $status = $response->getStatusCode();
            } catch (\Throwable $e) {
                $status = 'error';
            }
            $time = microtime(true) - $start;

            $results[] = [
                'path' => $path,
                'queries' => $queries,
                'status' => $status,
                'ms' => round($time * 1000, 1),
            ];
        }

        $this->table(['Path', 'DB Queries', 'Status', 'Time (ms)'], array_map(function ($r) {
            return [$r['path'], $r['queries'], $r['status'], $r['ms']];
        }, $results));

        $this->info('Scan complete.');

        return 0;
    }
}
