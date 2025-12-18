<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ToolStatus;
use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', \App\Http\Middleware\CheckRole::class.':owner,admin']);
    }

    public function stats(Request $request)
    {
        $this->authorize('viewAny', Tool::class);
        $t0 = microtime(true);

        // Optimize: single query with groupBy instead of multiple count queries
        $toolStats = Tool::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $tAfterToolStats = microtime(true);

        // Get total tools count
        $totalTools = $toolStats->sum();

        // User counts
        $userStats = User::selectRaw('is_active, COUNT(*) as count')
            ->groupBy('is_active')
            ->pluck('count', 'is_active');

        $activeUsers = $userStats->get(1, 0);
        $totalUsers = $userStats->sum();

        $tAfterUserStats = microtime(true);

        // Recent tools with eager loading
        $recent = Tool::withRelations()->latest()->take(10)->get()->map(function (Tool $t) {
            return [
                'id' => $t->id,
                'title' => $t->name ?? $t->title ?? 'Untitled',
                'slug' => $t->slug,
                'user' => [
                    'name' => $t->user?->name ?? null,
                    'id' => $t->user?->id ?? null,
                ],
                'created_at' => $t->created_at?->toDateTimeString(),
            ];
        });
        $tEnd = microtime(true);

        // Log optimized timings
        Log::info('admin.stats.timings.optimized', [
            'toolStats_ms' => round(($tAfterToolStats - $t0) * 1000, 2),
            'userStats_ms' => round(($tAfterUserStats - $tAfterToolStats) * 1000, 2),
            'recentTools_ms' => round(($tEnd - $tAfterUserStats) * 1000, 2),
            'total_ms' => round(($tEnd - $t0) * 1000, 2),
        ]);

        return response()->json([
            'totalTools' => $totalTools,
            'pendingTools' => $toolStats->get(ToolStatus::PENDING->value, 0),
            'approvedTools' => $toolStats->get(ToolStatus::APPROVED->value, 0),
            'rejectedTools' => $toolStats->get(ToolStatus::REJECTED->value, 0),
            'activeUsers' => $activeUsers,
            'totalUsers' => $totalUsers,
            'recentTools' => $recent,
        ]);
    }
}
