<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\RatingCreated;
use App\Jobs\UpdateAnalyticsJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

final class UpdateRatingAnalytics implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(RatingCreated $event): void
    {
        // Update tool's average rating and dispatch analytics job
        $event->rating->tool->updateAverageRating();
        
        UpdateAnalyticsJob::dispatch($event->rating->tool_id, 'rating');
    }
}
