<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        if (! $user->can($permission)) {
            // Log the forbidden permission attempt using Laravel's Log facade to avoid
            // calling a global helper that may not be defined in all environments.
            Log::warning('forbidden_permission_attempt', [
                'user_id' => $user->id ?? null,
                'permission' => $permission,
                'ip' => $request->ip(),
            ]);

            return response()->json(['message' => "Permission '{$permission}' required"], 403);
        }

        return $next($request);
    }
}
