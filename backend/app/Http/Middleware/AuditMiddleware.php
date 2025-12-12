<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuditMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only log state-changing requests
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            try {
                $user = $request->user();
                $props = [
                    'method' => $request->method(),
                    'route' => $request->path(),
                    'input' => collect($request->except(['password', 'password_confirmation', '_token']))->toArray(),
                    'status' => $response->getStatusCode(),
                ];

                if ($user) {
                    activity()->causedBy($user)->withProperties($props)->log('http_request');
                } else {
                    activity()->withProperties($props)->log('http_request_anon');
                }
            } catch (\Throwable $e) {
                Log::warning('Failed to log audit activity', [
                    'method' => $request->method(),
                    'path' => $request->path(),
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $response;
    }
}
