<?php

declare(strict_types=1);

namespace App\Services;

use App\Actions\Rating\CreateRatingAction;
use App\Actions\Rating\DeleteRatingAction;
use App\DataTransferObjects\RatingData;
use App\Models\Rating;

final readonly class RatingService
{
    public function __construct(
        private CreateRatingAction $createAction,
        private DeleteRatingAction $deleteAction,
    ) {}

    /**
     * Create or update a rating.
     *
     * @param RatingData $data The rating data transfer object
     * @param object|null $user The user creating the rating
     * @return Rating The created or updated rating
     */
    public function create(RatingData $data, ?object $user = null): Rating
    {
        return $this->createAction->execute($data, $user);
    }

    /**
     * Delete a rating.
     *
     * @param Rating $rating The rating to delete
     * @param object|null $user The user deleting the rating
     * @return bool True if deletion was successful
     */
    public function delete(Rating $rating, ?object $user = null): bool
    {
        return $this->deleteAction->execute($rating, $user);
    }
}
