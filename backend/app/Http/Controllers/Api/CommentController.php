<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Tool;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Get all comments for a tool
     */
    public function index(Tool $tool)
    {
        $comments = Comment::where('tool_id', $tool->id)
            ->approved()
            ->topLevel()
            ->with(['user:id,name', 'replies.user:id,name'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($comments);
    }

    /**
     * Post a new comment
     */
    public function store(Request $request, Tool $tool)
    {
        $validated = $request->validate([
            'content' => 'required|string|min:3|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        // Auto-approve for admins/owners, pending for others
        $user = auth()->user();
        $status = $user && $user->hasAnyRole(['admin', 'owner']) ? 'approved' : 'pending';

        $comment = Comment::create([
            'tool_id' => $tool->id,
            'user_id' => auth()->id(),
            'parent_id' => $validated['parent_id'] ?? null,
            'content' => strip_tags($validated['content']), // XSS prevention
            'status' => $status,
        ]);

        // Log activity
        try {
            \App\Models\Activity::create([
                'subject_type' => get_class($comment),
                'subject_id' => $comment->id,
                'action' => 'commented',
                'user_id' => auth()->id(),
                'meta' => ['tool' => $tool->name, 'status' => $status],
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            logger()->warning('Failed to log comment activity', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => $status === 'approved'
                ? 'Comment posted successfully'
                : 'Comment submitted for moderation',
            'data' => $comment->load('user:id,name'),
        ], 201);
    }

    /**
     * Delete a comment
     */
    public function destroy(Comment $comment)
    {
        // Allow comment owner or admin/owner to delete
        $user = auth()->user();
        if ($comment->user_id !== $user->id && ! $user->hasAnyRole(['admin', 'owner'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }

    /**
     * Admin: Moderate a comment
     */
    public function moderate(Comment $comment, Request $request)
    {
        $user = auth()->user();
        if (! $user->hasAnyRole(['admin', 'owner'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,spam',
        ]);

        $comment->update([
            'status' => $validated['status'],
            'moderated_by' => auth()->id(),
            'moderated_at' => now(),
        ]);

        return response()->json(['message' => 'Comment moderated']);
    }
}
