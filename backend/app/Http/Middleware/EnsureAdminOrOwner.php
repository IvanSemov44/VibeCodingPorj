<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EnsureAdminOrOwner
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (! $user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect('/');
        }

        // Use Spatie roles trait if available
        try {
            $allowed = method_exists($user, 'hasAnyRole') && $user->hasAnyRole(['admin', 'owner']);
        } catch (\Throwable $e) {
            Log::warning('EnsureAdminOrOwner role check failed: '.$e->getMessage());
            $allowed = false;
        }

        if (! $allowed) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
            return redirect('/');
        }

        return $next($request);
    }
}
