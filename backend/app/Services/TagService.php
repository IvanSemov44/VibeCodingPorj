<?php

declare(strict_types=1);

namespace App\Services;

use App\Actions\Tag\CreateTagAction;
use App\Actions\Tag\DeleteTagAction;
use App\Actions\Tag\UpdateTagAction;
use App\DataTransferObjects\TagData;
use App\Models\Tag;

final readonly class TagService
{
    public function __construct(
        private CreateTagAction $createAction,
        private UpdateTagAction $updateAction,
        private DeleteTagAction $deleteAction,
    ) {}

    /**
     * Create a new tag.
     *
     * @param TagData $data The tag data transfer object
     * @param object|null $user The user creating the tag
     * @return Tag The created tag
     */
    public function create(TagData $data, ?object $user = null): Tag
    {
        return $this->createAction->execute($data, $user);
    }

    /**
     * Update an existing tag.
     *
     * @param Tag $tag The tag to update
     * @param TagData $data The updated tag data
     * @param object|null $user The user performing the update
     * @return Tag The updated tag
     */
    public function update(Tag $tag, TagData $data, ?object $user = null): Tag
    {
        return $this->updateAction->execute($tag, $data, $user);
    }

    /**
     * Delete a tag.
     *
     * @param Tag $tag The tag to delete
     * @param object|null $user The user deleting the tag
     * @return bool True if deletion was successful
     */
    public function delete(Tag $tag, ?object $user = null): bool
    {
        return $this->deleteAction->execute($tag, $user);
    }
}
