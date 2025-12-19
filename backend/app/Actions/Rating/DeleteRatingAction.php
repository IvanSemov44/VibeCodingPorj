<?php

declare(strict_types=1);

namespace App\Actions\Rating;

use App\Events\RatingDeleted;
use App\Models\Rating;
use Illuminate\Support\Facades\DB;

final class DeleteRatingAction
{
    /**
     * Delete a rating.
     *
     * @param Rating $rating The rating to delete
     * @param object|null $user The user deleting the rating (for activity logging)
     * @return bool True if deletion was successful
     */
    public function execute(Rating $rating, ?object $user = null): bool
    {
        return DB::transaction(function () use ($rating, $user): bool {
            $tool = $rating->tool;
            $toolId = $rating->tool_id;

            // Log activity before deletion
            if ($user !== null) {
                activity()
                    ->performedOn($rating)
                    ->causedBy($user)
                    ->withProperties(['tool_id' => $toolId])
                    ->log('rating_deleted');
            }

            // Dispatch event before deletion
            RatingDeleted::dispatch($rating);

            // Delete the rating
            $deleted = $rating->delete() !== false;

            if ($deleted) {
                // Recalculate tool's average rating
                $tool->updateAverageRating();
            }

            return $deleted;
        });
    }
}
