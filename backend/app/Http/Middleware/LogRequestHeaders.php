<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogRequestHeaders
{
    /**
     * Log incoming headers for troubleshooting CSRF/session issues.
     */
    public function handle(Request $request, Closure $next)
    {
        // Only log API tool actions (adjust if you want broader coverage)
        $path = $request->path();
        $shouldLog = str_contains($path, 'api/tools') || $request->isMethod('delete');

        if ($shouldLog) {
            $dump = [
                'method' => $request->method(),
                'path' => $path,
                'origin' => $request->header('origin'),
                'referer' => $request->header('referer'),
                'cookie' => $request->header('cookie'),
                'x-xsrf-token' => $request->header('x-xsrf-token'),
                'x-csrf-token' => $request->header('x-csrf-token'),
                'x-requested-with' => $request->header('x-requested-with'),
            ];

            Log::info('RequestHeaderDump: '.json_encode($dump));
        }

        return $next($request);
    }
}
