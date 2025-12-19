<?php

declare(strict_types=1);

namespace App\Actions\Tag;

use App\DataTransferObjects\TagData;
use App\Models\Tag;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class CreateTagAction
{
    /**
     * Create a new tag with the given data.
     *
     * @param TagData $data The tag data transfer object
     * @param object|null $user The user creating the tag (for activity logging)
     * @return Tag The created tag
     */
    public function execute(TagData $data, ?object $user = null): Tag
    {
        return DB::transaction(function () use ($data, $user): Tag {
            // Prepare tag data with slug
            $tagData = $data->toArray();
            $tagData['slug'] = Str::slug($data->name);

            // Create the tag
            $tag = Tag::create($tagData);

            // Log activity
            if ($user !== null) {
                activity()
                    ->performedOn($tag)
                    ->causedBy($user)
                    ->withProperties(['name' => $tag->name])
                    ->log('tag_created');
            }

            return $tag;
        });
    }
}
