<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Create cache key based on all filters
            $cacheKey = 'activities.' . md5(json_encode($request->all()));

            $result = Cache::tags(['activities'])->remember($cacheKey, 60, function () use ($request) {
                $query = Activity::with('user');

                // Filter by user
                if ($request->filled('user_id')) {
                    $query->where('user_id', $request->user_id);
                }

                // Filter by action type
                if ($request->filled('action')) {
                    $query->where('action', $request->action);
                }

                // Filter by subject type (e.g., Tool, User)
                if ($request->filled('subject_type')) {
                    $query->where('subject_type', 'like', '%' . $request->subject_type . '%');
                }

                // Filter by date range
                if ($request->filled('date_from')) {
                    $query->where('created_at', '>=', $request->date_from);
                }

                if ($request->filled('date_to')) {
                    $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
                }

                // Search in meta data
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('action', 'like', "%{$search}%")
                          ->orWhere('subject_type', 'like', "%{$search}%")
                          ->orWhereRaw('JSON_SEARCH(meta, "one", ?) IS NOT NULL', ["%{$search}%"]);
                    });
                }

                $perPage = min((int) $request->query('per_page', 20), 100);

                return $query->orderBy('created_at', 'desc')
                    ->paginate($perPage)
                    ->through(function (Activity $a) {
                        $actor = null;
                        if ($a->user) {
                            $actor = [
                                'id' => $a->user->id,
                                'name' => $a->user->name,
                                'email' => $a->user->email ?? null,
                            ];

                            try {
                                if (method_exists($a->user, 'getRoleNames')) {
                                    $actor['roles'] = $a->user->getRoleNames()->toArray();
                                }
                            } catch (\Throwable $e) {
                                // ignore
                            }
                        }

                        return [
                            'id' => $a->id,
                            'subject_type' => $a->subject_type,
                        'subject_id' => $a->subject_id,
                        'action' => $a->action,
                        'user' => $actor,
                        'meta' => $a->meta,
                        'created_at' => $a->created_at?->toIso8601String(),
                        'created_at_human' => $a->created_at?->diffForHumans(),
                    ];
                });
            });

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('ActivityController@index error: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function stats(Request $request)
    {
        try {
            // Cache activity stats for 2 minutes
            return Cache::tags(['activities'])->remember('activity_stats', 120, function () {
                // Activity statistics for dashboard widgets
                $totalActivities = Activity::count();
                $activitiesToday = Activity::whereDate('created_at', today())->count();
                $activitiesThisWeek = Activity::where('created_at', '>=', now()->subWeek())->count();

                // Top actions
                $topActions = Activity::selectRaw('action, COUNT(*) as count')
                    ->groupBy('action')
                    ->orderByDesc('count')
                    ->limit(5)
                    ->get();

                // Recent activity by day (last 7 days)
                $activityByDay = Activity::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->where('created_at', '>=', now()->subDays(7))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get();

                return [
                    'total' => $totalActivities,
                    'today' => $activitiesToday,
                    'this_week' => $activitiesThisWeek,
                    'top_actions' => $topActions,
                    'activity_by_day' => $activityByDay,
                ];
            });

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('ActivityController@stats error: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }
}
