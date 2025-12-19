<?php

declare(strict_types=1);

namespace App\Actions\Tag;

use App\DataTransferObjects\TagData;
use App\Models\Tag;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class UpdateTagAction
{
    /**
     * Update an existing tag with the given data.
     *
     * @param Tag $tag The tag to update
     * @param TagData $data The updated tag data
     * @param object|null $user The user performing the update (for activity logging)
     * @return Tag The updated tag
     */
    public function execute(Tag $tag, TagData $data, ?object $user = null): Tag
    {
        return DB::transaction(function () use ($tag, $data, $user): Tag {
            // Prepare update data with slug
            $tagData = $data->toArray();
            $tagData['slug'] = Str::slug($data->name);

            // Update the tag
            $tag->update($tagData);

            // Log activity
            if ($user !== null) {
                activity()
                    ->performedOn($tag)
                    ->causedBy($user)
                    ->withProperties(['name' => $tag->name])
                    ->log('tag_updated');
            }

            return $tag->refresh();
        });
    }
}
