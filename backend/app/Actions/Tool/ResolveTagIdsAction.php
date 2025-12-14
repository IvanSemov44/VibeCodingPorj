<?php

declare(strict_types=1);

namespace App\Actions\Tool;

use App\Models\Tag;
use Illuminate\Support\Str;

final class ResolveTagIdsAction
{
    /**
     * Resolve tag IDs from tag names (create if not exists).
     *
     * @param  array<string|int>  $tags
     * @return array<int>
     */
    public function execute(array $tags): array
    {
        $tagIds = [];

        foreach ($tags as $tag) {
            if (is_numeric($tag)) {
                // Already an ID
                $tagIds[] = (int) $tag;

                continue;
            }

            $name = trim((string) $tag);
            if ($name === '') {
                continue;
            }

            // Tag name - find or create
            $tagModel = Tag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
            $tagIds[] = $tagModel->id;
        }

        return array_values(array_unique($tagIds));
    }
}
