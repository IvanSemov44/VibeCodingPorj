<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);

        return response()->json($categories);
    }

    /**
     * Store a newly created category (admin)
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (! ($user instanceof User) || ! $user->hasRole('owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
        ]);

        // ensure slug is present and unique
        $baseSlug = $data['slug'] ?? Str::slug($data['name']);
        $slug = $this->generateUniqueSlug($baseSlug);

        $category = Category::create([
            'name' => $data['name'],
            'slug' => $slug,
        ]);

        return response()->json($category, 201);
    }

    /**
     * Update category (admin)
     */
    public function update(Request $request, Category $category)
    {
        $user = Auth::user();
        if (! ($user instanceof User) || ! $user->hasRole('owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
        ]);

        $category->name = $data['name'];
        $baseSlug = $data['slug'] ?? Str::slug($data['name']);
        $category->slug = $this->generateUniqueSlug($baseSlug, $category->id);
        $category->save();

        return response()->json($category);
    }

    /**
     * Destroy category (admin)
     */
    public function destroy(Request $request, Category $category)
    {
        $user = Auth::user();
        if (! ($user instanceof User) || ! $user->hasRole('owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $category->delete();

        return response()->noContent();
    }

    /**
     * Generate a unique slug for categories. If $exceptId is provided,
     * that record will be excluded from uniqueness checks (useful on update).
     */
    private function generateUniqueSlug(string $base, ?int $exceptId = null): string
    {
        $slug = Str::slug($base);
        $original = $slug;
        $i = 1;

        while (Category::where('slug', $slug)
            ->when($exceptId, function ($q) use ($exceptId) {
                return $q->where('id', '!=', $exceptId);
            })
            ->exists()) {
            $slug = $original.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
