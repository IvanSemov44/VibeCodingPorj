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
    protected $signature = 'scan:queries {--dump-sql : Dump SQL queries captured per path} {--trace : Capture caller stack frame for each query} {--full-trace : Capture full backtrace for each query} {--keep-debugbar : Keep Debugbar middleware enabled and capture collectors}';

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

        $dumpSql = $this->option('dump-sql');
        $traceEnabled = $this->option('trace');
        $fullTraceEnabled = $this->option('full-trace');
        $keepDebugbar = (bool) $this->option('keep-debugbar');

        foreach ($paths as $path) {
            $queries = 0;
            $sqls = [];
            $seen = [];
            DB::flushQueryLog();
            DB::listen(function ($query) use (&$queries, &$sqls, &$seen, $traceEnabled, $fullTraceEnabled) {
                // Build an identity key for deduplication: SQL + bindings + caller (if present)
                $bt = null;
                $caller = null;
                if ($traceEnabled || $fullTraceEnabled) {
                    $bt = debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT | DEBUG_BACKTRACE_IGNORE_ARGS);
                    if ($traceEnabled) {
                        foreach ($bt as $frame) {
                            if (isset($frame['file']) && ! str_contains($frame['file'], '/vendor/')) {
                                $caller = ($frame['file'] ?? '') . ':' . ($frame['line'] ?? '');
                                break;
                            }
                        }
                    }
                }

                $key = md5($query->sql . '|' . serialize($query->bindings) . '|' . ($caller ?? ''));
                if (isset($seen[$key])) {
                    // Skip duplicate collector emissions to reduce noise
                    return;
                }

                $seen[$key] = true;
                $queries++;

                $entry = ['sql' => $query->sql, 'bindings' => $query->bindings, 'time' => $query->time ?? null];
                if ($bt && ($traceEnabled || $fullTraceEnabled)) {
                    if ($traceEnabled) {
                        $entry['caller'] = $caller;
                    }
                    if ($fullTraceEnabled) {
                        $frames = [];
                        $limit = 0;
                        foreach ($bt as $frame) {
                            if ($limit++ > 30) break;
                            $frames[] = ((($frame['file'] ?? '[internal]') . ':' . ($frame['line'] ?? '?') . ' ' . ($frame['function'] ?? '')));
                        }
                        $entry['trace'] = $frames;
                    }
                }

                $sqls[] = $entry;
            });

            $start = microtime(true);
            try {
                // Optionally disable Debugbar via middleware strip. When
                // `--keep-debugbar` is set we intentionally leave Debugbar in
                // place so we can capture its collectors for reporting.
                $kernel = app(\App\Http\Kernel::class);
                $removedDebugbar = false;
                $originalMiddleware = null;
                try {
                    if (! $keepDebugbar && class_exists(\Barryvdh\Debugbar\Middleware\InjectDebugbar::class)) {
                        $ref = new \ReflectionObject($kernel);
                        if ($ref->hasProperty('middlewareGroups')) {
                            $prop = $ref->getProperty('middlewareGroups');
                            $prop->setAccessible(true);
                            $groups = $prop->getValue($kernel);
                            $originalMiddleware = $groups;
                            foreach ($groups as $gk => $garr) {
                                $groups[$gk] = array_values(array_filter($garr, function ($m) {
                                    return $m !== \Barryvdh\Debugbar\Middleware\InjectDebugbar::class;
                                }));
                            }
                            $prop->setValue($kernel, $groups);
                            $removedDebugbar = true;
                        }
                        // Also disable the debugbar instance if present
                        if (app()->bound('debugbar')) {
                            try {
                                app('debugbar')->disable();
                            } catch (\Throwable $_) {
                                // ignore
                            }
                        }
                    }
                } catch (\Throwable $e) {
                    // best-effort; continue even if reflection fails
                    logger()->warning('Failed to strip debugbar middleware for scan: ' . $e->getMessage());
                }

                // Create a request and dispatch via the application kernel.
                // Debugbar is disabled above to avoid collector-triggered queries.
                $request = Request::create($path, 'GET');
                $response = app()->handle($request);
                $status = $response->getStatusCode();
            } catch (\Throwable $e) {
                $status = 'error';
            }
            $time = microtime(true) - $start;

            // Restore kernel middleware groups if we modified them
            if (! empty($removedDebugbar) && isset($originalMiddleware) && is_array($originalMiddleware)) {
                try {
                    $ref = new \ReflectionObject($kernel);
                    if ($ref->hasProperty('middlewareGroups')) {
                        $prop = $ref->getProperty('middlewareGroups');
                        $prop->setAccessible(true);
                        $prop->setValue($kernel, $originalMiddleware);
                    }
                } catch (\Throwable $e) {
                    logger()->warning('Failed to restore kernel middleware after scan: ' . $e->getMessage());
                }
            }

            // Optionally capture Debugbar collectors if requested and available.
            $debugbarData = null;
            if ($keepDebugbar && app()->bound('debugbar')) {
                try {
                    $debugbar = app('debugbar');
                    if (method_exists($debugbar, 'getData')) {
                        $debugbarData = $debugbar->getData();
                    } elseif (method_exists($debugbar, 'getCollectors')) {
                        $collectors = $debugbar->getCollectors();
                        $debugbarData = [];
                        foreach ($collectors as $name => $col) {
                            try {
                                // Attempt to extract queries when present
                                if (method_exists($col, 'getQueries')) {
                                    $debugbarData[$name] = $col->getQueries();
                                } else {
                                    $debugbarData[$name] = null;
                                }
                            } catch (\Throwable $_) {
                                $debugbarData[$name] = 'error';
                            }
                        }
                    }
                } catch (\Throwable $e) {
                    $debugbarData = ['error' => $e->getMessage()];
                }
            }

            $results[] = [
                'path' => $path,
                'queries' => $queries,
                'sqls' => $sqls,
                'status' => $status,
                'ms' => round($time * 1000, 1),
                'debugbar' => $debugbarData,
            ];
        }

        $this->table(['Path', 'DB Queries', 'Status', 'Time (ms)'], array_map(function ($r) {
            return [$r['path'], $r['queries'], $r['status'], $r['ms']];
        }, $results));

        if ($dumpSql) {
            foreach ($results as $r) {
                $this->info("\n--- SQL for {$r['path']} ({$r['queries']} queries) ---");
                foreach ($r['sqls'] as $i => $s) {
                    $line = ($i + 1) . ") " . $s['sql'] . ' [' . implode(', ', array_map(function ($b) { return is_scalar($b) ? (string) $b : gettype($b); }, $s['bindings'] ?? [])) . ']';
                    if (! empty($s['caller'] ?? null)) {
                        $line .= ' -- caller: ' . $s['caller'];
                    }
                    $this->line($line);
                    if (! empty($s['trace'] ?? null) && is_array($s['trace'])) {
                        foreach ($s['trace'] as $frame) {
                            $this->line('    at ' . $frame);
                        }
                    }
                }
            }
        }

        $this->info('Scan complete.');

        return 0;
    }
}
