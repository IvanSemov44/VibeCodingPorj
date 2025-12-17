<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class HealthController extends BaseController
{
    /**
     * Lightweight public health check — inexpensive and safe.
     */
    public function health()
    {
        return response()->json([
            'ok' => true,
            'time' => now()->toDateTimeString(),
        ]);
    }

    /**
     * Readiness check — verifies core dependencies (DB, cache, storage).
     * Returns 200 when all checks are OK, 503 when any check fails.
     */
    public function ready()
    {
        $checks = [];

        // Database check
        try {
            DB::connection()->getPdo();
            $checks['database'] = 'ok';
        } catch (\Exception $e) {
            $checks['database'] = 'error: ' . $e->getMessage();
        }

        // Cache check (safe read)
        try {
            Cache::get('health_check_key');
            $checks['cache'] = 'ok';
        } catch (\Exception $e) {
            $checks['cache'] = 'error: ' . $e->getMessage();
        }

        // Storage check (is storage path writable)
        try {
            $writable = is_writable(storage_path('app'));
            $checks['storage'] = $writable ? 'ok' : 'not_writable';
        } catch (\Exception $e) {
            $checks['storage'] = 'error: ' . $e->getMessage();
        }

        $failed = array_filter($checks, fn($v) => $v !== 'ok');

        if (!empty($failed)) {
            return response()->json([
                'status' => 'degraded',
                'checks' => $checks,
            ], 503);
        }

        return response()->json([
            'status' => 'ok',
            'checks' => $checks,
        ]);
    }
}
