<?php

declare(strict_types=1);

namespace App\Actions\Tag;

use App\Models\Tag;
use Illuminate\Support\Facades\DB;

final class DeleteTagAction
{
    /**
     * Delete a tag.
     *
     * @param Tag $tag The tag to delete
     * @param object|null $user The user deleting the tag (for activity logging)
     * @return bool True if deletion was successful
     */
    public function execute(Tag $tag, ?object $user = null): bool
    {
        return DB::transaction(function () use ($tag, $user): bool {
            $tagName = $tag->name;

            // Log activity before deletion
            if ($user !== null) {
                activity()
                    ->performedOn($tag)
                    ->causedBy($user)
                    ->withProperties(['name' => $tagName])
                    ->log('tag_deleted');
            }

            // Delete the tag
            return $tag->delete() !== false;
        });
    }
}
