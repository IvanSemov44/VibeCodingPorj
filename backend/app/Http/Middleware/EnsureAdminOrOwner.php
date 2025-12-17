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
            // Treat API routes as JSON requests even if Accept header isn't present
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect('/');
        }

        // Check if user is admin or owner
        $allowed = false;
        
        try {
            // Method 1: Spatie roles
            if (method_exists($user, 'hasAnyRole')) {
                $allowed = $user->hasAnyRole(['admin', 'owner']);
            }
            
            // Method 2: Direct roles check (backup)
            if (!$allowed && method_exists($user, 'roles')) {
                $roles = $user->roles()->pluck('name')->toArray();
                $allowed = in_array('admin', $roles) || in_array('owner', $roles);
            }
            
            // Method 3: Check is_admin flag (backup)
            if (!$allowed && isset($user->is_admin) && $user->is_admin) {
                $allowed = true;
            }
        } catch (\Throwable $e) {
            Log::warning('EnsureAdminOrOwner role check failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            $allowed = false;
        }

        if (! $allowed) {
            Log::warning('Access denied for non-admin user', [
                'user_id' => $user->id,
                'path' => $request->path(),
            ]);
            
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Forbidden. Admin access required.'], 403);
            }
            return redirect('/');
        }

        return $next($request);
    }
}
