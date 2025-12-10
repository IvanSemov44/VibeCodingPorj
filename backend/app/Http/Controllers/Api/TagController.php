<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    /**
     * Return list of tags for frontend filters
     */
    public function index()
    {
        $tags = Tag::orderBy('name')->get();
        return response()->json($tags);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!($user instanceof User) || !$user->hasRole('owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
        ]);

        $tag = Tag::create([
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
        ]);

        return response()->json($tag, 201);
    }

    public function update(Request $request, Tag $tag)
    {
        $user = Auth::user();
        if (!($user instanceof User) || !$user->hasRole('owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
        ]);

        $tag->name = $data['name'];
        $tag->slug = $data['slug'] ?? Str::slug($data['name']);
        $tag->save();

        return response()->json($tag);
    }

    public function destroy(Request $request, Tag $tag)
    {
        $user = Auth::user();
        if (!($user instanceof User) || !$user->hasRole('owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $tag->delete();
        return response()->noContent();
    }
}
