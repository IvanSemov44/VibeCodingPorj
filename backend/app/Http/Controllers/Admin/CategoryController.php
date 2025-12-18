<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories with tool counts
     */
    public function index(Request $request)
    {
        $query = Category::query()->withCount('tools');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->query('per_page', 20), 100);

        $categories = $query->orderBy('name')
            ->paginate($perPage);

        return response()->json($categories);
    }

    /**
     * Store a newly created category
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
            'description' => 'nullable|string|max:500',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category = Category::create($validated);

        // Clear cache
        Cache::forget('admin:category_stats');

        return response()->json($category, 201);
    }

    /**
     * Display the specified category with related tools
     */
    public function show(string $id)
    {
        $category = Category::with(['tools' => function ($query) {
            $query->select('tools.id', 'tools.name', 'tools.slug')->limit(10);
        }])
            ->withCount('tools')
            ->findOrFail($id);

        return response()->json($category);
    }

    /**
     * Update the specified category
     */
    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('categories')->ignore($category->id),
            ],
            'description' => 'nullable|string|max:500',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category->update($validated);

        // Clear cache
        Cache::forget('admin:category_stats');

        return response()->json($category);
    }

    /**
     * Remove the specified category
     */
    public function destroy(string $id)
    {
        $category = Category::withCount('tools')->findOrFail($id);

        // Check if category is used by tools
        if ($category->tools_count > 0) {
            return response()->json([
                'message' => "Cannot delete category '{$category->name}' because it is used by {$category->tools_count} tool(s).",
                'tools_count' => $category->tools_count,
            ], 422);
        }

        $category->delete();

        // Clear cache
        Cache::forget('admin:category_stats');

        return response()->json(['message' => 'Category deleted successfully']);
    }

    /**
     * Get category usage statistics
     */
    public function stats()
    {
        return Cache::remember('admin:category_stats', 300, function () {
            $total = Category::count();
            $withTools = Category::has('tools')->count();
            $withoutTools = $total - $withTools;
            $avgToolsPerCategory = $total > 0
                ? Category::withCount('tools')->get()->avg('tools_count')
                : 0;

            $topCategories = Category::withCount('tools')
                ->orderByDesc('tools_count')
                ->limit(5)
                ->get()
                ->map(function ($cat) {
                    return [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                        'tools_count' => $cat->tools_count,
                    ];
                });

            return [
                'total' => $total,
                'with_tools' => $withTools,
                'without_tools' => $withoutTools,
                'avg_tools_per_category' => round($avgToolsPerCategory, 1),
                'top_categories' => $topCategories,
            ];
        });
    }
}
