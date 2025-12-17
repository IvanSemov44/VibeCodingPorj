<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\ToolStatus;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

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

        $tStart = microtime(true);
        $totalTools = Tool::count();
        $tAfterTotal = microtime(true);

        $pendingTools = Tool::where('status', ToolStatus::PENDING->value)->count();
        $tAfterPending = microtime(true);

        $approvedTools = Tool::where('status', ToolStatus::APPROVED->value)->count();
        $tAfterApproved = microtime(true);

        $rejectedTools = Tool::where('status', ToolStatus::REJECTED->value)->count();
        $tAfterRejected = microtime(true);

        $activeUsers = User::where('is_active', true)->count();
        $tAfterActive = microtime(true);

        $totalUsers = User::count();
        $tAfterUsers = microtime(true);

        $tRecentStart = microtime(true);
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
        $tRecentEnd = microtime(true);

        $tEnd = microtime(true);

        // Log timings (seconds)
        Log::info('admin.stats.timings', [
            'totalTools' => $tAfterTotal - $tStart,
            'pendingTools' => $tAfterPending - $tAfterTotal,
            'approvedTools' => $tAfterApproved - $tAfterPending,
            'rejectedTools' => $tAfterRejected - $tAfterApproved,
            'activeUsers' => $tAfterActive - $tAfterRejected,
            'totalUsers' => $tAfterUsers - $tAfterActive,
            'recentTools' => $tRecentEnd - $tRecentStart,
            'total' => $tEnd - $t0,
        ]);

        return response()->json([
            'totalTools' => $totalTools,
            'pendingTools' => $pendingTools,
            'approvedTools' => $approvedTools,
            'rejectedTools' => $rejectedTools,
            'activeUsers' => $activeUsers,
            'totalUsers' => $totalUsers,
            'recentTools' => $recent,
        ]);
    }
}
