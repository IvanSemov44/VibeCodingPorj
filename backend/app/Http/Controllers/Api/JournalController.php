<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class JournalController extends Controller
{
    /**
     * Get all journal entries for the authenticated user with optional filters.
     */
    public function index(Request $request)
    {
        $query = JournalEntry::where('user_id', Auth::id());

        // Apply search filter
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Apply mood filter
        if ($request->has('mood') && $request->mood) {
            $query->byMood($request->mood);
        }

        // Apply tag filter
        if ($request->has('tag') && $request->tag) {
            $query->byTag($request->tag);
        }

        // Order by most recent first
        $entries = $query->orderBy('created_at', 'desc')->get();

        return response()->json($entries);
    }

    /**
     * Store a newly created journal entry.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'mood' => 'required|string|in:excited,happy,neutral,tired,victorious',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'xp' => 'required|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $entry = JournalEntry::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'mood' => $request->mood,
            'tags' => $request->tags ?? [],
            'xp' => $request->xp,
        ]);

        return response()->json($entry, 201);
    }

    /**
     * Display the specified journal entry.
     */
    public function show($id)
    {
        $entry = JournalEntry::where('user_id', Auth::id())->findOrFail($id);

        return response()->json($entry);
    }

    /**
     * Update the specified journal entry.
     */
    public function update(Request $request, $id)
    {
        $entry = JournalEntry::where('user_id', Auth::id())->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'mood' => 'sometimes|required|string|in:excited,happy,neutral,tired,victorious',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'xp' => 'sometimes|required|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $entry->update($request->only(['title', 'content', 'mood', 'tags', 'xp']));

        return response()->json($entry);
    }

    /**
     * Remove the specified journal entry.
     */
    public function destroy($id)
    {
        $entry = JournalEntry::where('user_id', Auth::id())->findOrFail($id);
        $entry->delete();

        return response()->json(['message' => 'Journal entry deleted successfully']);
    }

    /**
     * Get statistics for the authenticated user's journal entries.
     */
    public function stats()
    {
        $userId = Auth::id();

        // Total entries and XP
        $totalEntries = JournalEntry::where('user_id', $userId)->count();
        $totalXp = JournalEntry::where('user_id', $userId)->sum('xp');

        // Entries this week
        $entriesThisWeek = JournalEntry::where('user_id', $userId)
            ->where('created_at', '>=', now()->startOfWeek())
            ->count();

        // Mood breakdown
        $moodBreakdown = JournalEntry::where('user_id', $userId)
            ->selectRaw('mood, COUNT(*) as count')
            ->groupBy('mood')
            ->pluck('count', 'mood')
            ->toArray();

        // Calculate recent streak (consecutive days with entries)
        $recentEntries = JournalEntry::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(fn ($entry) => $entry->created_at->format('Y-m-d'));

        $streak = 0;
        $currentDate = now()->startOfDay();

        while ($recentEntries->has($currentDate->format('Y-m-d'))) {
            $streak++;
            $currentDate->subDay();
        }

        return response()->json([
            'total_entries' => $totalEntries,
            'total_xp' => $totalXp,
            'entries_this_week' => $entriesThisWeek,
            'mood_breakdown' => $moodBreakdown,
            'recent_streak' => $streak,
        ]);
    }
}
