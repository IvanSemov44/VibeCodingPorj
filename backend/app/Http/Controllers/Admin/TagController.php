<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    /**
     * Display a listing of tags with tool counts
     */
    public function index(Request $request)
    {
        $query = Tag::query()->withCount('tools');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->query('per_page', 20), 100);

        $tags = $query->orderBy('name')
            ->paginate($perPage);

        return response()->json($tags);
    }

    /**
     * Store a newly created tag
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:tags,name',
            'description' => 'nullable|string|max:255',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $tag = Tag::create($validated);

        // Clear cache
        Cache::forget('admin:tag_stats');

        return response()->json($tag, 201);
    }

    /**
     * Display the specified tag with related tools
     */
    public function show(string $id)
    {
        $tag = Tag::with(['tools' => function ($query) {
            $query->select('tools.id', 'tools.name', 'tools.slug')->limit(10);
        }])
        ->withCount('tools')
        ->findOrFail($id);

        return response()->json($tag);
    }

    /**
     * Update the specified tag
     */
    public function update(Request $request, string $id)
    {
        $tag = Tag::findOrFail($id);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('tags')->ignore($tag->id),
            ],
            'description' => 'nullable|string|max:255',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $tag->update($validated);

        // Clear cache
        Cache::forget('admin:tag_stats');

        return response()->json($tag);
    }

    /**
     * Remove the specified tag
     */
    public function destroy(string $id)
    {
        $tag = Tag::withCount('tools')->findOrFail($id);

        // Check if tag is used by tools
        if ($tag->tools_count > 0) {
            return response()->json([
                'message' => "Cannot delete tag '{$tag->name}' because it is used by {$tag->tools_count} tool(s).",
                'tools_count' => $tag->tools_count,
            ], 422);
        }

        $tag->delete();

        // Clear cache
        Cache::forget('admin:tag_stats');

        return response()->json(['message' => 'Tag deleted successfully']);
    }

    /**
     * Get tag usage statistics
     */
    public function stats()
    {
        return Cache::remember('admin:tag_stats', 300, function () {
            $total = Tag::count();
            $withTools = Tag::has('tools')->count();
            $withoutTools = $total - $withTools;
            $avgToolsPerTag = Tag::withCount('tools')->avg('tools_count') ?? 0;

            $topTags = Tag::withCount('tools')
                ->orderByDesc('tools_count')
                ->limit(10)
                ->get()
                ->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                        'tools_count' => $tag->tools_count,
                    ];
                });

            return [
                'total' => $total,
                'with_tools' => $withTools,
                'without_tools' => $withoutTools,
                'avg_tools_per_tag' => round($avgToolsPerTag, 1),
                'top_tags' => $topTags,
            ];
        });
    }
}
