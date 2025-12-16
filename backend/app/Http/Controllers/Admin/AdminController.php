<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\ToolStatus;
use App\Models\Tool;
use App\Models\User;
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

        return response()->json([
            'totalTools' => Tool::count(),
            'pendingTools' => Tool::where('status', ToolStatus::PENDING->value)->count(),
            'approvedTools' => Tool::where('status', ToolStatus::APPROVED->value)->count(),
            'rejectedTools' => Tool::where('status', ToolStatus::REJECTED->value)->count(),
            'activeUsers' => User::where('is_active', true)->count(),
            'totalUsers' => User::count(),
            'recentTools' => Tool::latest()->take(10)->get(),
        ]);
    }
}
