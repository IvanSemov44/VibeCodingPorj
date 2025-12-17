<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\Tool;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    /**
     * Submit or update a rating for a tool
     */
    public function store(Request $request, Tool $tool)
    {
        $validated = $request->validate([
            'score' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:500',
        ]);

        $rating = Rating::updateOrCreate(
            ['tool_id' => $tool->id, 'user_id' => auth()->id()],
            $validated
        );

        // Log activity
        try {
            \App\Models\Activity::create([
                'subject_type' => get_class($rating),
                'subject_id' => $rating->id,
                'action' => 'rated',
                'user_id' => auth()->id(),
                'meta' => ['tool' => $tool->name, 'score' => $validated['score']],
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            logger()->warning('Failed to log rating activity', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'Rating submitted successfully',
            'data' => $rating,
        ]);
    }

    /**
     * Delete user's rating for a tool
     */
    public function destroy(Tool $tool)
    {
        $rating = Rating::where('tool_id', $tool->id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $rating->delete();

        return response()->json(['message' => 'Rating removed']);
    }
}
