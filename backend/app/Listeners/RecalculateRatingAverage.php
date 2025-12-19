<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\RatingDeleted;
use App\Jobs\UpdateAnalyticsJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

final class RecalculateRatingAverage implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(RatingDeleted $event): void
    {
        // Recalculate tool's average rating
        $event->rating->tool->updateAverageRating();
        
        UpdateAnalyticsJob::dispatch($event->rating->tool_id, 'rating');
    }
}
