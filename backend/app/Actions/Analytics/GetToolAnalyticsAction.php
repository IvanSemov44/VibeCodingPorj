<?php

declare(strict_types=1);

namespace App\Actions\Analytics;

use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\Query\Builder;

final readonly class GetToolAnalyticsAction
{
    /**
     * Get comprehensive analytics for a specific tool.
     *
     * @param Tool $tool The tool to analyze
     * @return array<string, mixed> Analytics data
     */
    public function execute(Tool $tool): array
    {
        return [
            'tool_id' => $tool->id,
            'tool_name' => $tool->name,
            'views' => $tool->view_count ?? 0,
            'comments' => $tool->comments_count ?? 0,
            'average_rating' => $tool->average_rating ?? 0,
            'ratings_count' => $tool->ratings()->count(),
            'category' => $tool->category?->name,
            'tags' => $tool->tags->pluck('name')->toArray(),
            'created_at' => $tool->created_at,
            'updated_at' => $tool->updated_at,
            'status' => $tool->status,
            'ratings_breakdown' => $this->getRatingsBreakdown($tool),
            'recent_comments' => $tool->comments()
                ->with('user')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($comment) => [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'user' => $comment->user?->name,
                    'created_at' => $comment->created_at,
                ]),
        ];
    }

    /**
     * Get breakdown of ratings by score.
     *
     * @param Tool $tool The tool to analyze
     * @return array<int, int> Ratings count by score
     */
    private function getRatingsBreakdown(Tool $tool): array
    {
        $breakdown = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];

        $ratings = $tool->ratings()
            ->selectRaw('score, COUNT(*) as count')
            ->groupBy('score')
            ->get();

        foreach ($ratings as $rating) {
            $breakdown[$rating->score] = $rating->count;
        }

        return $breakdown;
    }
}
