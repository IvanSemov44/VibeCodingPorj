<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Tool;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class UpdateAnalyticsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly int $toolId,
        public readonly string $type,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $tool = Tool::find($this->toolId);

        if ($tool === null) {
            return;
        }

        // Update metrics based on type
        match ($this->type) {
            'rating' => $this->updateRatingMetrics($tool),
            'comment' => $this->updateCommentMetrics($tool),
            'view' => $this->updateViewMetrics($tool),
            default => null,
        };

        // Log analytics update
        \Log::info('Analytics update job processed', [
            'tool_id' => $this->toolId,
            'type' => $this->type,
        ]);
    }

    /**
     * Update rating-related metrics.
     */
    private function updateRatingMetrics(Tool $tool): void
    {
        $avgRating = $tool->ratings()
            ->avg('score');

        $ratingCount = $tool->ratings()->count();

        $tool->update([
            'average_rating' => $avgRating ? round($avgRating, 2) : 0,
            'rating_count' => $ratingCount,
        ]);
    }

    /**
     * Update comment-related metrics.
     */
    private function updateCommentMetrics(Tool $tool): void
    {
        $commentCount = $tool->comments()
            ->where('is_moderated', true)
            ->count();

        $tool->update(['comment_count' => $commentCount]);
    }

    /**
     * Update view-related metrics.
     */
    private function updateViewMetrics(Tool $tool): void
    {
        // Increment view count
        $tool->increment('view_count');
    }
}
