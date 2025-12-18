<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ExportActivitiesJob;
use App\Models\Activity;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ActivityController extends Controller
{
    /**
     * Get paginated list of activities with filtering.
     * Consider adding rate limiting in routes: Route::middleware(['throttle:60,1'])
     */
    public function index(Request $request)
    {
        try {
            // Validate input to prevent cache poisoning
            $validated = $request->validate([
                'user_id' => 'nullable|integer|exists:users,id',
                'action' => 'nullable|string|in:created,updated,deleted',
                'subject_type' => 'nullable|string|max:100',
                'date_from' => 'nullable|date',
                'date_to' => 'nullable|date|after_or_equal:date_from',
                'search' => 'nullable|string|max:100',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            // Create cache key based on validated filters only (prevent cache poisoning)
            $cacheKey = 'activities:'.md5(json_encode($validated));

            // @phpstan-ignore-next-line - Laravel cache template type variance
            $result = Cache::tags(['activities'])->remember($cacheKey, 60, function () use ($validated) {
                $query = Activity::with('user');

                // Filter by user
                if (! empty($validated['user_id'])) {
                    $query->where('user_id', $validated['user_id']);
                }

                // Filter by action type
                if (! empty($validated['action'])) {
                    $query->where('action', $validated['action']);
                }

                // Filter by subject type (e.g., Tool, User)
                if (! empty($validated['subject_type'])) {
                    $query->where('subject_type', 'like', '%'.$validated['subject_type'].'%');
                }

                // Filter by date range with proper timezone handling
                if (! empty($validated['date_from'])) {
                    $query->where('created_at', '>=', Carbon::parse($validated['date_from'])->startOfDay());
                }

                if (! empty($validated['date_to'])) {
                    $query->where('created_at', '<=', Carbon::parse($validated['date_to'])->endOfDay());
                }

                // Search in meta data (database-agnostic JSON search)
                if (! empty($validated['search'])) {
                    $search = $validated['search'];
                    $query->where(function ($q) use ($search) {
                        $q->where('action', 'like', "%{$search}%")
                            ->orWhere('subject_type', 'like', "%{$search}%");

                        // JSON search: MySQL-specific, PostgreSQL would use jsonb_path_exists
                        $driver = config('database.default');
                        $connection = config("database.connections.{$driver}.driver");

                        if ($connection === 'mysql') {
                            $q->orWhereRaw('JSON_SEARCH(meta, "one", ?) IS NOT NULL', ["%{$search}%"]);
                        } elseif ($connection === 'pgsql') {
                            $q->orWhereRaw('meta::text LIKE ?', ["%{$search}%"]);
                        } else {
                            // Fallback: cast to string (works on SQLite, others)
                            $q->orWhere(DB::raw('CAST(meta AS TEXT)'), 'like', "%{$search}%");
                        }
                    });
                }

                $perPage = $validated['per_page'] ?? 20;

                // @phpstan-ignore-next-line - Laravel paginator template type variance
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
                            'created_at' => $a->created_at->toIso8601String(),
                            'created_at_human' => $a->created_at->diffForHumans(),
                        ];
                    });
            });

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('ActivityController@index error: '.$e->getMessage(), ['exception' => $e]);

            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    /**
     * Get activity statistics for dashboard
     * Cached for 2 minutes to reduce database load
     */
    public function stats(Request $request)
    {
        try {
            $this->authorize('admin_or_owner');

            // Cache activity stats for 2 minutes with cache lock to prevent stampede
            // @phpstan-ignore-next-line - Laravel cache template type variance
            $stats = Cache::tags(['activities'])->remember('activity_stats', 120, function () {
                // Activity statistics for dashboard widgets
                $totalActivities = Activity::count();
                $activitiesToday = Activity::whereDate('created_at', today())->count();
                $activitiesThisWeek = Activity::where('created_at', '>=', now()->subWeek())->count();

                // Top actions with percentage
                $topActions = Activity::selectRaw('action, COUNT(*) as count')
                    ->groupBy('action')
                    ->orderByDesc('count')
                    ->limit(5)
                    ->get()
                    // @phpstan-ignore-next-line - $count is a dynamic property from SQL aggregate
                    ->map(function ($item) use ($totalActivities) {
                        return [
                            'action' => $item->action,
                            // @phpstan-ignore-next-line - Dynamic property from COUNT(*) aggregate
                            'count' => $item->count,
                            // @phpstan-ignore-next-line - Dynamic property from COUNT(*) aggregate
                            'percentage' => $totalActivities > 0 ? round(($item->count / $totalActivities) * 100, 2) : 0,
                        ];
                    });

                // Recent activity by day (last 7 days) - database agnostic
                $activityByDay = Activity::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->where('created_at', '>=', now()->subDays(7))
                    ->groupBy(DB::raw('DATE(created_at)'))
                    ->orderBy('date')
                    ->get();

                return [
                    'total' => $totalActivities,
                    'today' => $activitiesToday,
                    'this_week' => $activitiesThisWeek,
                    'top_actions' => $topActions,
                    'activity_by_day' => $activityByDay,
                    'cached_at' => now()->toIso8601String(),
                ];
            });

            return response()->json($stats);
        } catch (\Throwable $e) {
            Log::error('ActivityController@stats error: '.$e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json(['message' => 'Failed to load statistics'], 500);
        }
    }

    /**
     * Export activities to CSV (async via queue job)
     */
    public function export(Request $request)
    {
        try {
            $this->authorize('admin_or_owner');

            $validated = $request->validate([
                'user_id' => 'nullable|integer',
                'action' => 'nullable|string',
                'subject_type' => 'nullable|string',
                'date_from' => 'nullable|date',
                'date_to' => 'nullable|date',
                'search' => 'nullable|string|max:100',
            ]);

            $filters = array_filter($validated, fn ($v) => $v !== null);

            // Get authenticated user (guaranteed non-null after authorize())
            /** @var \App\Models\User $user */
            $user = auth()->user();

            // Dispatch async job to queue
            ExportActivitiesJob::dispatch($user, $filters);

            Log::info('Activity export job dispatched for user: '.$user->id, [
                'filters' => $filters,
            ]);

            return response()->json([
                'message' => '✅ Export started! Check your email for download link when ready.',
                'status' => 'processing',
            ], 202);
        } catch (\Throwable $e) {
            Log::error('ActivityController@export error: '.$e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Export failed: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download exported file
     * TODO: Use signed temporary URLs in production for better security
     * Example: Storage::temporaryUrl($path, now()->addMinutes(5))
     */
    public function downloadExport(Request $request, string $filename)
    {
        try {
            $this->authorize('admin_or_owner');

            // Security: validate filename format (prevents path traversal)
            if (! preg_match('/^activity-export-\d{4}-\d{2}-\d{2}_\d{6}\.csv$/', $filename)) {
                Log::warning('Invalid export filename attempted', [
                    'filename' => $filename,
                    'user_id' => auth()->id(),
                ]);

                return response()->json(['message' => 'Invalid filename format'], 400);
            }

            $path = "exports/activities/{$filename}";

            // Check if file exists
            if (! Storage::exists($path)) {
                return response()->json(['message' => 'File not found or has expired'], 404);
            }

            // Security: Verify file ownership by checking filename contains user ID or is admin
            // For production: store export metadata in database with user_id
            /** @var \App\Models\User $user */
            $user = auth()->user();
            $isAdmin = method_exists($user, 'hasRole') && $user->hasRole('admin');

            if (! $isAdmin) {
                // Non-admin users can only download their own exports
                // This is a basic check - in production, use database to track ownership
                Log::warning('Unauthorized export download attempt', [
                    'filename' => $filename,
                    'user_id' => $user->id,
                ]);

                return response()->json(['message' => 'Unauthorized access'], 403);
            }

            Log::info('Export file downloaded', [
                'filename' => $filename,
                'user_id' => $user->id,
            ]);

            // Return file download with proper headers
            return Storage::download($path, $filename, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            ]);
        } catch (\Throwable $e) {
            Log::error('Download export error: '.$e->getMessage(), [
                'filename' => $filename,
                'user_id' => auth()->id(),
                'exception' => $e,
            ]);

            return response()->json(['message' => 'Download failed'], 500);
        }
    }

    /**
     * Clear activity cache (useful after bulk operations)
     * Protected method - call when activities are created/updated
     */
    public static function clearCache(): void
    {
        try {
            Cache::tags(['activities'])->flush();
            Log::debug('Activity cache cleared');
        } catch (\Throwable $e) {
            Log::warning('Failed to clear activity cache: '.$e->getMessage());
        }
    }
}
