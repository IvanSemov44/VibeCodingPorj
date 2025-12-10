<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ToolResource;
use App\Models\Tool;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Tag;

class ToolController extends Controller
{
    public function index(Request $request)
    {
        $query = Tool::query()->with(['categories', 'tags', 'roles']);

        if ($q = $request->query('q')) {
            $query->where('name', 'like', "%{$q}%");
        }

        if ($category = $request->query('category')) {
            $query->whereHas('categories', fn($q2) => $q2->where('slug', $category)->orWhere('name', $category));
        }

        if ($role = $request->query('role')) {
            $query->whereHas('roles', fn($r) => $r->where('name', $role));
        }

        // Support single `tag` or comma-separated `tags` parameter for filtering
        if ($tag = $request->query('tag')) {
            $query->whereHas('tags', fn($t) => $t->where('slug', $tag)->orWhere('name', $tag));
        }

        if ($tags = $request->query('tags')) {
            $arr = array_filter(array_map('trim', explode(',', $tags)));
            if (!empty($arr)) {
                $query->whereHas('tags', function($q) use ($arr) {
                    $q->whereIn('slug', $arr)->orWhereIn('name', $arr);
                });
            }
        }

        // Allow client to request larger pages for listing (cap at 100)
        $perPage = (int) $request->query('per_page', 20);
        if ($perPage < 1) $perPage = 20;
        $perPage = min(100, $perPage);

        $tools = $query->orderBy('name')->paginate($perPage);
        return ToolResource::collection($tools);
    }

    public function show(Tool $tool)
    {
        $tool->load(['categories', 'tags', 'roles']);
        return new ToolResource($tool);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:tools,name',
            'url' => 'nullable|url|max:500',
            'docs_url' => 'nullable|url|max:500',
            'description' => 'nullable|string|max:2000',
            'usage' => 'nullable|string|max:5000',
            'examples' => 'nullable|string|max:5000',
            'difficulty' => 'nullable|string|in:beginner,intermediate,advanced,expert',
            'categories' => 'nullable|array|min:1',
            'categories.*' => 'integer|exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'roles' => 'nullable|array',
            'roles.*' => 'integer|exists:roles,id',
            'screenshots' => 'nullable|array|max:10',
            'screenshots.*' => 'url|max:500',
        ], [
            'name.required' => 'Tool name is required',
            'name.unique' => 'A tool with this name already exists',
            'name.max' => 'Tool name cannot exceed 255 characters',
            'url.url' => 'Please provide a valid URL',
            'docs_url.url' => 'Please provide a valid documentation URL',
            'description.max' => 'Description cannot exceed 2000 characters',
            'difficulty.in' => 'Difficulty must be: beginner, intermediate, advanced, or expert',
            'categories.min' => 'Please select at least one category',
            'categories.*.exists' => 'Selected category does not exist',
            'roles.*.exists' => 'Selected role does not exist',
            'screenshots.max' => 'Maximum 10 screenshots allowed',
        ]);

        $data['slug'] = Str::slug($data['name']);
        $tool = Tool::create($data);

        if (!empty($data['categories'])) {
            $tool->categories()->sync($data['categories']);
        }
        if (!empty($data['tags'])) {
            $tool->tags()->sync($this->resolveTagIds($data['tags']));
        }
        if (!empty($data['roles'])) {
            $tool->roles()->sync($data['roles']);
        }

        return new ToolResource($tool->load(['categories','tags','roles']));
    }

    public function update(Request $request, Tool $tool)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:tools,name,' . $tool->id,
            'url' => 'nullable|url|max:500',
            'docs_url' => 'nullable|url|max:500',
            'description' => 'nullable|string|max:2000',
            'usage' => 'nullable|string|max:5000',
            'examples' => 'nullable|string|max:5000',
            'difficulty' => 'nullable|string|in:beginner,intermediate,advanced,expert',
            'categories' => 'nullable|array|min:1',
            'categories.*' => 'integer|exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'roles' => 'nullable|array',
            'roles.*' => 'integer|exists:roles,id',
            'screenshots' => 'nullable|array|max:10',
            'screenshots.*' => 'url|max:500',
        ], [
            'name.required' => 'Tool name is required',
            'name.unique' => 'A tool with this name already exists',
            'name.max' => 'Tool name cannot exceed 255 characters',
            'url.url' => 'Please provide a valid URL',
            'docs_url.url' => 'Please provide a valid documentation URL',
            'description.max' => 'Description cannot exceed 2000 characters',
            'difficulty.in' => 'Difficulty must be: beginner, intermediate, advanced, or expert',
            'categories.min' => 'Please select at least one category',
            'categories.*.exists' => 'Selected category does not exist',
            'roles.*.exists' => 'Selected role does not exist',
            'screenshots.max' => 'Maximum 10 screenshots allowed',
        ]);

        $data['slug'] = Str::slug($data['name']);
        $tool->update($data);

        if (array_key_exists('categories', $data)) {
            $tool->categories()->sync($data['categories'] ?? []);
        }
        if (array_key_exists('tags', $data)) {
            $tool->tags()->sync($this->resolveTagIds($data['tags'] ?? []));
        }
        if (array_key_exists('roles', $data)) {
            $tool->roles()->sync($data['roles'] ?? []);
        }

        return new ToolResource($tool->load(['categories','tags','roles']));
    }

    public function destroy(Tool $tool)
    {
        $tool->delete();
        return response()->noContent();
    }
    /**
     * Resolve an array of tag identifiers or names into tag IDs.
     * Accepts numeric IDs or tag name strings; creates tags when needed.
     * @param array $tags
     * @return array
     */
    private function resolveTagIds(array $tags): array
    {
        $ids = [];
        foreach ($tags as $t) {
            if (is_numeric($t)) {
                $ids[] = (int) $t;
                continue;
            }
            $name = trim($t);
            if ($name === '') continue;
            $tag = Tag::firstOrCreate([
                'slug' => Str::slug($name),
            ], [
                'name' => $name,
            ]);
            $ids[] = $tag->id;
        }

        return array_values(array_unique($ids));
    }

}
