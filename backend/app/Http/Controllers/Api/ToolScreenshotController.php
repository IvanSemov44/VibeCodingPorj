<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ToolScreenshotController extends Controller
{
    /**
     * Upload screenshots for a tool. Accepts multiple files in 'screenshots[]'.
     */
    public function store(Request $request, Tool $tool)
    {
        // Authentication is enforced via route middleware; authorization handled
        // by ToolPolicy to restrict updates/deletes to appropriate roles.
        $this->authorize('update', $tool);
        $data = $request->validate([
            'screenshots' => 'required|array',
            'screenshots.*' => 'file|image|max:5120',
        ]);

        $existing = $tool->screenshots ?? [];
        foreach ($data['screenshots'] as $file) {
            /** @var \Illuminate\Http\UploadedFile $file */
            $path = (string) $file->store('tools/screenshots', 'public');

            /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
            $disk = Storage::disk('public');

            $url = (string) $disk->url($path);
            $existing[] = $url;
        }

        $tool->screenshots = $existing;
        $tool->save();

        return response()->json(['screenshots' => $existing], 200);
    }

    /**
     * Delete a screenshot by URL. Expects JSON body: { "url": "..." }
     */
    public function destroy(Request $request, Tool $tool)
    {
        $this->authorize('update', $tool);

        /** @var array{url: string} $data */
        $data = $request->validate([
            'url' => 'required|url',
        ]);

        $url = (string) $data['url'];
        // Normalize and derive storage path from the public URL
        $path = parse_url($url, PHP_URL_PATH) ?: '';
        // Remove leading /storage/ if present to get the storage path
        $relative = preg_replace('#^/storage/#', '', ltrim($path, '/'));

        if ($relative && Storage::disk('public')->exists($relative)) {
            Storage::disk('public')->delete($relative);
        }

        $screens = $tool->screenshots ?? [];
        $screens = array_values(array_filter($screens, fn ($s) => $s !== $url));
        $tool->screenshots = $screens;
        $tool->save();

        return response()->json(['screenshots' => $screens], 200);
    }
}
