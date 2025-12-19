<?php

declare(strict_types=1);

namespace App\Actions\Rating;

use App\DataTransferObjects\RatingData;
use App\Models\Rating;
use Illuminate\Support\Facades\DB;

final class CreateRatingAction
{
    /**
     * Create or update a rating on a tool.
     *
     * @param RatingData $data The rating data transfer object
     * @param object|null $user The user creating the rating (for activity logging)
     * @return Rating The created or updated rating
     */
    public function execute(RatingData $data, ?object $user = null): Rating
    {
        return DB::transaction(function () use ($data, $user): Rating {
            // Create or update rating (one per user per tool)
            $rating = Rating::updateOrCreate(
                [
                    'tool_id' => $data->toolId,
                    'user_id' => $data->userId,
                ],
                ['score' => $data->score]
            );

            // Update tool's average rating
            $rating->tool->updateAverageRating();

            // Log activity
            if ($user !== null) {
                activity()
                    ->performedOn($rating)
                    ->causedBy($user)
                    ->withProperties([
                        'tool_id' => $rating->tool_id,
                        'score' => $rating->score,
                    ])
                    ->log('rating_created');
            }

            return $rating->load('tool', 'user');
        });
    }
}
