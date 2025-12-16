<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Access to this controller is already protected by `admin_or_owner` middleware in routes.
            $activities = Activity::with('user')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function (Activity $a) {
                    return [
                        'id' => $a->id,
                        'subject_type' => $a->subject_type,
                        'subject_id' => $a->subject_id,
                        'action' => $a->action,
                        'user' => $a->user ? ['id' => $a->user->id, 'name' => $a->user->name] : null,
                        'meta' => $a->meta,
                        'created_at' => ($a->created_at instanceof \DateTimeInterface) ? $a->created_at->format('Y-m-d H:i:s') : (string) $a->created_at,
                    ];
                });

            return response()->json(['data' => $activities]);
        } catch (\Throwable $e) {
            Log::error('ActivityController@index error: ' . $e->getMessage(), ['exception' => $e]);

            try {
                $raw = Activity::orderBy('created_at', 'desc')->limit(10)->get()->toArray();
                Log::debug('ActivityController raw rows', ['rows' => $raw]);
            } catch (\Throwable $inner) {
                Log::debug('ActivityController failed to fetch raw rows', ['error' => $inner->getMessage()]);
            }

            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }
}
